import fs from 'node:fs/promises';

const LIVE_URL = 'https://api.digikala.com/v1/dictionaries/?types%5B5%5D=category_tree';
const SNAPSHOT_URL = 'https://raw.githubusercontent.com/BaseMax/DigikalaShopCategories/main/categories.json';
const OUT = 'data/digikala-category-tree.json';

const isObject = value => value && typeof value === 'object' && !Array.isArray(value);

function childrenOf(node) {
  if (!isObject(node)) return [];
  const raw = node.children ?? node.childs ?? node.subCategories ?? node.subcategories ?? node.items;
  if (Array.isArray(raw)) return raw;
  if (isObject(raw)) return Object.values(raw);
  return [];
}

function nameOf(node) {
  if (!isObject(node)) return '';
  return String(node.name ?? node.title ?? node.label ?? node.text ?? '').trim();
}

function normalizeNode(node, seen = new Set()) {
  if (!isObject(node) || seen.has(node)) return null;
  const name = nameOf(node);
  if (!name) return null;
  seen.add(node);
  const children = childrenOf(node)
    .map(child => normalizeNode(child, seen))
    .filter(Boolean);
  return { name, children };
}

function findCandidate(value, depth = 0) {
  if (depth > 12 || value == null) return [];
  if (Array.isArray(value)) {
    const normalized = value.map(v => normalizeNode(v)).filter(Boolean);
    if (normalized.length >= 5) return normalized;
    for (const item of value) {
      const found = findCandidate(item, depth + 1);
      if (found.length >= 5) return found;
    }
    return normalized;
  }
  if (!isObject(value)) return [];
  for (const key of ['category_tree', 'categoryTree', 'categories', 'children', 'childs']) {
    if (key in value) {
      const found = findCandidate(value[key], depth + 1);
      if (found.length >= 5) return found;
    }
  }
  for (const child of Object.values(value)) {
    const found = findCandidate(child, depth + 1);
    if (found.length >= 5) return found;
  }
  return [];
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'DigiYar-Digikala-Taxonomy-Sync/1.0' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function main() {
  let root;
  let source;

  try {
    const live = await fetchJson(LIVE_URL);
    root = findCandidate(live);
    if (root.length < 5) throw new Error('live response did not expose a usable category tree');
    source = {
      type: 'digikala_live_dictionary',
      url: LIVE_URL,
      status: 'live-extracted'
    };
  } catch (error) {
    const snapshot = await fetchJson(SNAPSHOT_URL);
    root = findCandidate(snapshot);
    if (root.length < 5) throw new Error(`snapshot extraction failed: ${error.message}`);
    source = {
      type: 'public_snapshot',
      url: SNAPSHOT_URL,
      status: 'historical-fallback',
      reason: error.message
    };
  }

  const payload = {
    schemaVersion: '2.0',
    store: 'digikala',
    generatedAt: new Date().toISOString(),
    source,
    notes: 'Static, isolated taxonomy data. Runtime UI does not call Digikala APIs.',
    root
  };

  await fs.writeFile(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Digikala taxonomy written: ${root.length} root nodes`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
