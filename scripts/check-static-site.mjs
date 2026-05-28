import { readFile } from 'node:fs/promises';

const requiredFiles = [
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'apple-touch-icon.png',
  'CNAME',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
  'icon-1024.png',
  'icon-source.png',
  'index.html',
  'site.webmanifest',
  'styles.css',
];

const requiredHtmlSnippets = [
  '<!doctype html>',
  '<html lang="en">',
  '<title>Peek-A-Sound</title>',
  '<main class="site-shell">',
  'data-contact-email',
  'data-local="aGVsbG8="',
  'data-domain="cGVla2Fzb3VuZC5jb20="',
];

const requiredHtmlPatterns = [
  /<meta\s+name="viewport"/,
  /<meta\s+name="description"/,
  /<link\s+rel="canonical"\s+href="https:\/\/peekasound\.com\/"/,
  /<link\s+rel="icon"\s+href="favicon\.ico\?v=\d+"\s+sizes="any"/,
  /<link\s+rel="icon"\s+href="favicon-32x32\.png\?v=\d+"\s+sizes="32x32"\s+type="image\/png"/,
  /<link\s+rel="icon"\s+href="favicon-16x16\.png\?v=\d+"\s+sizes="16x16"\s+type="image\/png"/,
  /<link\s+rel="apple-touch-icon"\s+href="apple-touch-icon\.png\?v=\d+"/,
  /<link\s+rel="manifest"\s+href="site\.webmanifest\?v=\d+"/,
  /<link\s+rel="stylesheet"\s+href="styles\.css\?v=\d+"/,
];

async function readRequiredFile(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    throw new Error(`Missing required static site file: ${path}`, {
      cause: error,
    });
  }
}

function assertIncludes(content, snippet, file) {
  if (!content.includes(snippet)) {
    throw new Error(`${file} must include ${snippet}`);
  }
}

function assertValidJson(content, file) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`${file} must contain valid JSON`, { cause: error });
  }
}

const files = new Map(
  await Promise.all(
    requiredFiles.map(async (file) => [file, await readRequiredFile(file)]),
  ),
);

const html = files.get('index.html');
const contactAddress = ['hello', 'peekasound.com'].join('@');
const contactHref = `mailto:${contactAddress}`;

for (const snippet of requiredHtmlSnippets) {
  assertIncludes(html, snippet, 'index.html');
}

for (const pattern of requiredHtmlPatterns) {
  if (!pattern.test(html)) {
    throw new Error(`index.html must match ${pattern}`);
  }
}

if (files.get('CNAME').trim() !== 'peekasound.com') {
  throw new Error('CNAME must contain peekasound.com');
}

if (html.includes(contactAddress) || html.includes(contactHref)) {
  throw new Error('index.html must not expose the raw contact email address');
}

const manifest = assertValidJson(files.get('site.webmanifest'), 'site.webmanifest');
const manifestIcons = manifest.icons ?? [];
const requiredManifestIcons = new Map([
  ['/android-chrome-192x192.png', '192x192'],
  ['/android-chrome-512x512.png', '512x512'],
]);

for (const [src, sizes] of requiredManifestIcons) {
  const icon = manifestIcons.find((candidate) => candidate.src === src);

  if (!icon) {
    throw new Error(`site.webmanifest must include ${src}`);
  }

  if (icon.sizes !== sizes || icon.type !== 'image/png') {
    throw new Error(`site.webmanifest must define ${src} as ${sizes} image/png`);
  }
}

if (!files.get('styles.css').includes('.site-shell')) {
  throw new Error('styles.css must include the site shell styles');
}

console.info('Static site checks passed.');
