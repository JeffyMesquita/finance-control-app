import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = dirname(fileURLToPath(import.meta.url));
const symbol = await readFile(join(root, "../public/brand/ajeitagrana-symbol.svg"), "utf8");
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
      symbol.replace("<svg ", `<svg width="${size}" height="${size}" `) +
      "</body>"
  );
  await page.screenshot({ path: join(outputDir, `ajeitagrana-${size}.png`) });
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(
  '<body style="margin:0;background:#162019;color:#F7F8F4;font-family:Arial,sans-serif">' +
    '<main style="height:630px;display:flex;align-items:center;gap:56px;padding:76px 92px;box-sizing:border-box">' +
    '<div style="width:200px;height:200px">' +
    symbol.replace("<svg ", '<svg width="200" height="200" ') +
    "</div>" +
    '<div><p style="margin:0 0 22px;color:#6ee7b7;font-size:22px;font-weight:700;letter-spacing:4px">AJEITAGRANA</p>' +
    '<h1 style="margin:0;max-width:760px;font-size:62px;line-height:1.04;letter-spacing:-2px">Ajeite sua grana.<br>Faça seus planos avançarem.</h1>' +
    '<p style="margin:26px 0 0;max-width:680px;font-size:25px;line-height:1.35;color:#b9c8bf">Organização financeira pessoal, sem planilha e sem complicação.</p></div>' +
    "</main></body>"
);
await page.screenshot({ path: join(root, "../app/opengraph-image.png") });
await page.screenshot({ path: join(root, "../app/twitter-image.png") });
await browser.close();
console.log("AjeitaGrana brand PNG assets generated");
