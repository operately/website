import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { getPublishedReleases } from '../../utils/releases';

const parser = new MarkdownIt();

export async function GET(context) {
  const releases = await getCollection('releases');
  const sortedReleases = await getPublishedReleases();

  const items = sortedReleases.map((release) => {
    const htmlContent = parser.render(release.body);
    const sanitizedContent = sanitizeHtml(htmlContent, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt']
      }
    });

    // XML made manually because I kept running into a sanitization issue with the markdown content
    return `
      <item>
        <title>${escapeXml(release.data.title)}</title>
        <link>${context.site}releases/${release.slug}</link>
        <guid isPermaLink="true">${context.site}releases/${release.slug}</guid>
        <description>${escapeXml(release.data.description || '')}</description>
        <pubDate>${release.data.date.toUTCString()}</pubDate>
        <content:encoded><![CDATA[${sanitizedContent}]]></content:encoded>
      </item>
    `;
  }).join('');

  const rss = `
    <?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel>
        <title>Operately Releases</title>
        <description>Stay updated with the latest product releases and updates from Operately</description>
        <link>${context.site}</link>
        <language>en-us</language>
        ${items}
      </channel>
    </rss>
  `.trim();

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}