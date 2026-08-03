import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = dirname(fileURLToPath(import.meta.url));
const svg = await readFile(join(root, "../public/brand/ajeitagrana-symbol.svg"), "utf8");
const outputDir = join(root, "../public/brand");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ deviceScaleFactor: 1 });

for (const size of [16, 32, 96, 180, 192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    '<body style="margin:0;width:' +
      size +
      "px;height:" +
      size +
      'px;background:#F7F8F4">' +
      svg.replace("<svg ", `<svg width="${size}" height="${size}" `) +
      "</body>"
  );
  await page.screenshot({ path: join(outputDir, `ajeitagrana-${size}.png`) });
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(
  '<body style="margin:0;background:#F7F8F4;color:#162019;font-family:Arial,sans-serif">' +
    '<main style="height:630px;display:flex;align-items:center;gap:48px;padding:72px 96px;box-sizing:border-box">' +
    '<div style="width:160px;height:160px">' +
    svg.replace("<svg ", '<svg width="160" height="160" ') +
    "</div>" +
    '<div><p style="margin:0 0 18px;color:#047857;font-size:24px;font-weight:700;letter-spacing:3px">AJEITAGRANA</p>' +
    '<h1 style="margin:0;max-width:760px;font-size:64px;line-height:1.05;letter-spacing:-2px">Ajeite sua grana. Faça seus planos avançarem.</h1>' +
    '<p style="margin:26px 0 0;max-width:680px;font-size:26px;line-height:1.35;color:#526158">Controle financeiro sem planilha e sem complicação.</p></div>' +
    "</main></body>"
);
await page.screenshot({ path: join(root, "../app/opengraph-image.png") });
await page.screenshot({ path: join(root, "../app/twitter-image.png") });
await browser.close();
console.log("brand PNG assets generated");
