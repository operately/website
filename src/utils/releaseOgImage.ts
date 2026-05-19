import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const BRAND_BLUE = "#0055FF";
const MUTED_WHITE = "rgba(255, 255, 255, 0.72)";

const wordmarkPath = join(process.cwd(), "src/layouts/operately-logo.svg");
const fontsDir = join(process.cwd(), "node_modules/@fontsource/inter/files");

let fontsPromise: Promise<
  { name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" }[]
> | null = null;
let wordmarkDataUrlPromise: Promise<string> | null = null;

async function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(`${fontsDir}/inter-latin-400-normal.woff`),
      readFile(`${fontsDir}/inter-latin-600-normal.woff`),
      readFile(`${fontsDir}/inter-latin-700-normal.woff`),
    ]).then(([regular, semibold, bold]) => [
      { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
      { name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const },
      { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
    ]);
  }
  return fontsPromise;
}

/** Full Operately wordmark (icon + text) from operately-logo.svg, recolored to white. */
async function loadWordmarkDataUrl() {
  if (!wordmarkDataUrlPromise) {
    wordmarkDataUrlPromise = readFile(wordmarkPath, "utf8").then((svg) => {
      const whiteSvg = svg.replace(/fill="#(?:262626|024FAC|3185FF)"/g, 'fill="#ffffff"');
      return `data:image/svg+xml;base64,${Buffer.from(whiteSvg).toString("base64")}`;
    });
  }
  return wordmarkDataUrlPromise;
}

/** Safe text for satori-html — do not encode & (shows as literal &amp; otherwise). */
function sanitizeText(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll(/[<>]/g, "");
}

function titleFontSize(title: string) {
  if (title.length > 100) return 38;
  if (title.length > 80) return 42;
  if (title.length > 55) return 48;
  if (title.length > 35) return 54;
  return 58;
}

function formatReleaseDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export type ReleaseOgImageInput = {
  title: string;
  version: string;
  date: Date;
};

/** Build OG image URL from a release page pathname (e.g. `/releases/v160/`). */
export function releaseOgImagePath(releasePagePathname: string) {
  const normalized = releasePagePathname.replace(/\/$/, "");
  return `${normalized}/og.png`;
}

export async function generateReleaseOgImage({
  title,
  version,
  date,
}: ReleaseOgImageInput): Promise<Buffer> {
  const [fonts, wordmarkDataUrl] = await Promise.all([loadFonts(), loadWordmarkDataUrl()]);
  const safeTitle = sanitizeText(title);
  const safeVersion = sanitizeText(`Operately v${version}`);
  const safeDate = sanitizeText(formatReleaseDate(date));
  const headlineSize = titleFontSize(title);

  const markup = html(`
    <div
      style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: ${BRAND_BLUE};
        color: #ffffff;
        font-family: Inter;
        padding: 56px 72px 52px;
      "
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        "
      >
        <img
          src="${wordmarkDataUrl}"
          style="display: block; height: 36px; width: 202px;"
        />
        <div
          style="
            font-size: 22px;
            font-weight: 400;
            color: ${MUTED_WHITE};
          "
        >
          ${safeDate}
        </div>
      </div>

      <div
        style="
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 1000px;
          flex: 1;
          justify-content: center;
          padding-top: 8px;
          padding-bottom: 8px;
        "
      >
        <div
          style="
            font-size: ${headlineSize}px;
            font-weight: 700;
            line-height: 1.2;
            letter-spacing: -0.03em;
            color: #ffffff;
          "
        >
          ${safeTitle}
        </div>
        <div
          style="
            font-size: 32px;
            font-weight: 400;
            line-height: 1.3;
            color: ${MUTED_WHITE};
          "
        >
          ${safeVersion}
        </div>
      </div>

      <div
        style="
          font-size: 22px;
          font-weight: 400;
          color: ${MUTED_WHITE};
        "
      >
        operately.com
      </div>
    </div>
  `);

  const svg = await satori(markup, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}
