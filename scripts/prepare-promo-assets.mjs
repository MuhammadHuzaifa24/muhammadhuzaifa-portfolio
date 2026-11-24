import * as icons from 'simple-icons';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('creative/promo/branding', { recursive: true });
for (const name of ['Unity', 'Blender', 'React', 'Threedotjs', 'Csharp', 'Python']) {
  const icon = icons[`si${name}`];
  if (!icon) throw new Error(`Missing logo: ${name}`);
  const fill = icon.hex.toLowerCase() === 'ffffff' ? '17212b' : icon.hex;
  const svg = icon.svg.replace('<svg ', `<svg fill="#${fill}" `);
  await sharp(Buffer.from(svg)).resize(160, 160).png().toFile(`creative/promo/branding/${name}.png`);
}
await writeFile('creative/promo/branding/SOURCES.txt', 'Technology marks: Simple Icons 11.15.0 (CC0 collection), https://github.com/simple-icons/simple-icons/tree/11.15.0\nBrand names and trademarks belong to their respective owners. Used to identify the student’s tools.\n');
console.log('Created six technology logo assets.');
