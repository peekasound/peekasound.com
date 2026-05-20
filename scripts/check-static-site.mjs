import { readFile } from 'node:fs/promises';

const requiredFiles = [
  'CNAME',
  'favicon.svg',
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
  /<link\s+rel="icon"\s+href="favicon\.svg\?v=\d+"/,
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
    JSON.parse(content);
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

assertValidJson(files.get('site.webmanifest'), 'site.webmanifest');

if (!files.get('favicon.svg').includes('<svg')) {
  throw new Error('favicon.svg must contain an SVG root element');
}

if (!files.get('styles.css').includes('.site-shell')) {
  throw new Error('styles.css must include the site shell styles');
}

console.info('Static site checks passed.');
