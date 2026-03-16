import fs from 'node:fs';
import path from 'node:path';

// Astro generates the sitemap during `astro build` (for this repo that ends up as
// `dist/sitemap-index.xml` + `dist/sitemap-0.xml`). This script runs immediately
// afterward from `npm run build` and removes any URLs whose final built HTML is
// marked `noindex`, so the published sitemap stays consistent with crawl/index
// directives.

const distDir = path.resolve('dist');
const sitemapPath = path.join(distDir, 'sitemap-0.xml');

if (!fs.existsSync(sitemapPath)) {
  console.log('No sitemap found, skipping sitemap post-processing.');
  process.exit(0);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const htmlFiles = walk(distDir).filter((file) => file.endsWith('.html'));
const noindexUrls = new Set();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) {
    continue;
  }

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canonicalMatch?.[1]) {
    noindexUrls.add(canonicalMatch[1]);
    continue;
  }

  const relative = path.relative(distDir, file).replace(/\\/g, '/');
  const route = relative === 'index.html' ? '/' : `/${relative.replace(/index\.html$/, '').replace(/\.html$/, '')}`;
  noindexUrls.add(`https://operately.com${route.endsWith('/') ? route : `${route}/`}`);
}

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const url of noindexUrls) {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  sitemap = sitemap.replace(new RegExp(`<url><loc>${escaped}</loc></url>`, 'g'), '');
}
fs.writeFileSync(sitemapPath, sitemap);

console.log(`Removed ${noindexUrls.size} noindex URL(s) from sitemap.`);
