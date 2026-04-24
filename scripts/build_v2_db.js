// Step 2: Build rag_simple_db_v2.json
// - Apply user-approved URL corrections (typo fixes from review)
// - Merge CSV entries: enhance existing rag entries OR create new ones
// - Output: complete merged DB

const fs = require('fs');
const path = require('path');

const PROJECT = 'c:/Users/Administrator/Desktop/Algernon/AI辅助策略生成模块';
const CSV_PATH = path.join(PROJECT, 'AI总结URL+页面信息.csv');
const RAG_PATH = path.join(PROJECT, '.claude/skills/access-policy-builder/assets/rag_simple_db.json');
const OUT_PATH = path.join(PROJECT, '.claude/skills/access-policy-builder/assets/rag_simple_db_v2.json');

// ---- URL normalization (same rules as Step 1) ----
const TRACKING_KEYS = new Set([
  'ref_', 'ref', 'jsessionid', 'merchantid', 'entityid', 'locale',
  'page', 'pagesize', 'pagenumber', 'resultsperpage',
  'sort', 'sortorder', 'orderby',
  'favorites', 'pageindex', 'orderstatus',
  'subview', 'status', 'fulfillmenttype', 'fulfilledby', 'view',
]);
const KEEP_KEYS = new Set(['upstream_storage']);

function normalizeUrl(raw) {
  if (!raw) return '';
  let u = raw.trim();
  const hashIdx = u.indexOf('#');
  if (hashIdx >= 0) u = u.slice(0, hashIdx);
  u = u.replace(/\/ref_?=[^/?]+/gi, '');
  const malformedMatch = u.match(/^(.+?:\/\/[^/]+)(\/[^?#]*?)(\/[a-zA-Z_][a-zA-Z0-9_]*=[^?#]*)$/);
  if (malformedMatch) {
    u = malformedMatch[1] + malformedMatch[2] + '?' + malformedMatch[3].slice(1);
  }
  let parsed;
  try { parsed = new URL(u); } catch (e) { return u; }
  let host = parsed.hostname.toLowerCase();
  let newHost;
  if (host.includes('advertising.amazon')) newHost = 'advertising.amazon.*';
  else if (host.includes('.amazon.')) newHost = '*.amazon.*';
  else newHost = host;
  const kept = [];
  for (const [k, v] of parsed.searchParams.entries()) {
    if (KEEP_KEYS.has(k.toLowerCase())) kept.push([k, v]);
  }
  let result = 'https://' + newHost + parsed.pathname;
  if (kept.length > 0) result += '?' + kept.map(([k, v]) => `${k}=${v}`).join('&');
  if (result.endsWith('/') && parsed.pathname !== '/') result = result.slice(0, -1);
  return result;
}

// ---- User-approved overrides from review ----
// Key: CSV line number; Value: { url?: override normalized URL, user_description?: override title }
const CSV_OVERRIDES = {
  11: { url: 'https://*.amazon.*/gp/ssof/shipping-queue.html' },   // CSV typo /go/suo/ → rag's /gp/ssof/
  31: { url: 'https://*.amazon.*/automatepricingv2/pricingrules' }, // CSV /automatepricing/2/ → rag's /automatepricingv2/
  36: { url: 'https://*.amazon.*/mcf/orders/create-order' },        // CSV /mc/orders/ → rag's /mcf/orders/
  // L42: CSV /fba/returns is correct; rag_023 has wrong /fba/return — we use /fba/returns
  42: { url: 'https://*.amazon.*/fba/returns', overridesRagUrl: 'https://*.amazon.*/fba/return' },
  85: { url: 'https://*.amazon.*/gestalt/manageregistration/index.html' },
  99: { url: 'https://*.amazon.*/customizedReports/lp' },
  101: { url: 'https://*.amazon.*/gp/tax/tax-library.html' },
  113: { url: 'https://*.amazon.*/mario/sellerwallet/seller-wallet-onboard/regional/node/welcome/render' },
  // L125: /spn/sellerdashboard is a distinct new page; user_description should be "服务提供商网络", not "管理服务请求"
  125: { user_description: '服务提供商网络' },
};

// ---- CSV parse ----
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

const csvText = fs.readFileSync(CSV_PATH, 'utf8').replace(/^﻿/, '');
const rows = parseCsv(csvText);
const header = rows[0];
const IDX = {
  menu: header.indexOf('功能'),
  title: header.indexOf('页面标题 (Page Title)'),
  menuPath: header.indexOf('菜单路径 (Menu Path)'),
  func: header.indexOf('核心业务功能 (Core Function)'),
  content: header.indexOf('网页内容 (Webpage Content)'),
  url: header.indexOf('映射 URL (Mapped URL)'),
  conf: header.indexOf('置信度'),
};

let currentMenu = '';
const records = rows.slice(1).filter(r => r.some(c => c && c.trim())).map((r, i) => {
  if (r[IDX.menu] && r[IDX.menu].trim()) currentMenu = r[IDX.menu].trim();
  const csvLine = i + 2;
  const override = CSV_OVERRIDES[csvLine] || {};
  const rawUrl = (r[IDX.url] || '').trim();
  const normUrl = override.url || normalizeUrl(rawUrl);
  const title = override.user_description || (r[IDX.title] || '').trim();
  return {
    csvLine,
    menu: currentMenu,
    title,
    menuPath: (r[IDX.menuPath] || '').trim(),
    func: (r[IDX.func] || '').trim(),
    content: (r[IDX.content] || '').trim(),
    rawUrl,
    normUrl,
    conf: (r[IDX.conf] || '').trim(),
    override,
  };
});

// ---- Group CSV records by normalized URL ----
const byUrl = new Map();
for (const rec of records) {
  if (!rec.normUrl) continue;
  if (!byUrl.has(rec.normUrl)) byUrl.set(rec.normUrl, []);
  byUrl.get(rec.normUrl).push(rec);
}

// ---- Load rag DB ----
const rag = JSON.parse(fs.readFileSync(RAG_PATH, 'utf8'));

function cmpKey(u) {
  let k = u.trim();
  if (k.endsWith('/') && k.split('/').length > 4) k = k.slice(0, -1);
  return k;
}

// Build rag lookup by normalized URL (for matching)
const ragByUrl = new Map();
for (const entry of rag) ragByUrl.set(cmpKey(entry.exact_url), entry);

// Handle L42 special case: rag_023 has wrong URL — we need to update it in the output
// When we see CSV URL /fba/returns, it should match rag_023 (which has /fba/return)
const URL_REMAPS = new Map();
for (const [csvLine, ov] of Object.entries(CSV_OVERRIDES)) {
  if (ov.overridesRagUrl) URL_REMAPS.set(ov.url, ov.overridesRagUrl);
}

function findRagEntry(normUrl) {
  // Direct match
  const direct = ragByUrl.get(cmpKey(normUrl));
  if (direct) return direct;
  // Remap (e.g., L42: /fba/returns maps to rag_023's /fba/return)
  const remapped = URL_REMAPS.get(normUrl);
  if (remapped) return ragByUrl.get(cmpKey(remapped));
  return null;
}

// ---- Alias/keyword generation ----
const UI_NOISE = new Set([
  'Data Table', 'Banner', 'Modal', 'Dropdown', 'Widget', 'Widgets',
  'Empty State', 'Tabs', 'Tab', 'Button', 'Input', 'Form', 'CTA',
  'Stepper', 'Wizard', 'Dashboard', '弹窗', '横幅', '面板', '卡片',
  '导航', '筛选器', '控件', '视图', '列表', '表格', '图表',
]);

const ACRONYM_WHITELIST = [
  'FBA', 'FBM', 'MCF', 'AWD', 'CSBA', 'SKU', 'ASIN', 'FNSKU', 'UPC',
  'MFN', 'SPN', 'API', 'ROI', 'KPI', 'CX', 'NCX', 'B2B', 'A+',
  'EBC', 'AR', 'AMC', 'DSP', 'EOD', 'ACCS', 'IPI', 'FAQ',
  'Listing', 'Pixel', 'Prime', 'Vine', 'Brand', 'SAFE-T',
];

function extractAcronyms(text) {
  if (!text) return [];
  const out = new Set();
  for (const acr of ACRONYM_WHITELIST) {
    if (text.includes(acr)) out.add(acr);
  }
  // English words in parentheses — often canonical terms
  const parens = text.match(/\(([^)]+)\)/g) || [];
  for (const p of parens) {
    const inner = p.slice(1, -1).trim();
    if (/^[A-Za-z][A-Za-z0-9\s\-]+$/.test(inner) && inner.length <= 30) {
      out.add(inner);
    }
  }
  return [...out];
}

function splitMenuPath(mp) {
  if (!mp) return [];
  return mp.split(/[>＞]/).map(s => s.trim()).filter(s => s && s.length < 30 &&
    !['无', '[隐性路径跳转]', '[受限拦截路径]', '页面内跳转至教育中心'].includes(s));
}

function buildAliases(recs) {
  const out = new Set();
  for (const r of recs) {
    // Title (primary alias)
    if (r.title) {
      out.add(r.title);
      // Clean version without parenthetical
      const clean = r.title.replace(/[（(][^）)]*[）)]/g, '').trim();
      if (clean && clean !== r.title) out.add(clean);
    }
    // Last menu path segment
    const segs = splitMenuPath(r.menuPath);
    if (segs.length > 0) out.add(segs[segs.length - 1]);
    // Acronyms from core function
    for (const a of extractAcronyms(r.func)) out.add(a);
  }
  // Remove duplicates after normalization and UI noise
  return [...out]
    .filter(s => s && s.length >= 2 && s.length < 40)
    .filter(s => !UI_NOISE.has(s))
    .slice(0, 12);
}

function buildKeywords(recs) {
  const out = new Set();
  for (const r of recs) {
    if (r.title) out.add(r.title);
    // Each menu segment
    for (const seg of splitMenuPath(r.menuPath)) out.add(seg);
    // Acronyms
    for (const a of extractAcronyms(r.func)) out.add(a);
    // 核心业务功能 — add as whole phrase
    if (r.func && r.func.length < 60) out.add(r.func);
  }
  return [...out]
    .filter(s => s && s.length >= 2 && s.length < 60)
    .filter(s => !UI_NOISE.has(s))
    .slice(0, 15);
}

// ---- Category inference from 功能 (menu group) column ----
const MENU_TO_CATEGORY = {
  '菜单——库存': 'inventory_fba',
  '菜单——目录': 'product_management',
  '菜单——确定价格': 'pricing',
  '菜单——订单': 'order_management',
  '菜单——广告': 'advertising',
  '菜单——报告': 'reports',
  '菜单——绩效': 'account_health',
  '菜单——应用程序和服务': 'apps_services',
  '菜单——B2B': 'b2b',
  '菜单——品牌': 'brand',
  '菜单——学习': 'help_support',
  '菜单——增长': 'growth_tools',
};

function inferCategory(recs) {
  for (const r of recs) {
    if (MENU_TO_CATEGORY[r.menu]) return MENU_TO_CATEGORY[r.menu];
  }
  return 'other';
}

function buildPageDescription(recs) {
  const descs = [...new Set(recs.map(r => r.func).filter(Boolean))];
  return descs.join('；');
}

function uniquePush(arr, items) {
  const seen = new Set(arr);
  for (const it of items) {
    if (it && !seen.has(it)) { arr.push(it); seen.add(it); }
  }
}

// ---- Build merged DB ----
const now = new Date().toISOString();
const out = [];
const enhancedIds = new Set();

// Pass 1: enhance existing rag entries (and update URL if needed)
for (const [normUrl, recs] of byUrl) {
  const ragEntry = findRagEntry(normUrl);
  if (!ragEntry) continue;
  enhancedIds.add(ragEntry.id);

  const clone = JSON.parse(JSON.stringify(ragEntry));

  // URL correction (e.g., L42)
  if (clone.exact_url !== normUrl) clone.exact_url = normUrl;

  // Enhance aliases / keywords with CSV-derived terms
  const csvAliases = buildAliases(recs);
  const csvKeywords = buildKeywords(recs);
  uniquePush(clone.aliases, csvAliases);
  uniquePush(clone.keywords, csvKeywords);

  // Enhance page_description: append CSV functions if meaningful new content
  const csvDesc = buildPageDescription(recs);
  if (csvDesc && !clone.page_description.includes(csvDesc.slice(0, 15))) {
    clone.page_description = clone.page_description + '；' + csvDesc;
  }

  out.push(clone);
}

// Pass 2: carry over existing rag entries NOT enhanced (unchanged)
for (const entry of rag) {
  if (!enhancedIds.has(entry.id)) out.push(entry);
}

// Pass 3: add new entries for CSV URLs not in rag
let nextId = 220; // existing max is 219
for (const [normUrl, recs] of byUrl) {
  if (findRagEntry(normUrl)) continue; // already handled in pass 1

  const id = `rag_${String(nextId).padStart(3, '0')}`;
  nextId++;

  // user_description: prefer explicit override, else first non-empty title
  const firstRec = recs[0];
  let userDesc = firstRec.override?.user_description || firstRec.title;
  if (!userDesc || userDesc.length < 2) {
    const segs = splitMenuPath(firstRec.menuPath);
    userDesc = segs[segs.length - 1] || '未命名页面';
  }

  out.push({
    id,
    user_description: userDesc,
    exact_url: normUrl,
    page_description: buildPageDescription(recs),
    aliases: buildAliases(recs),
    keywords: buildKeywords(recs),
    marketplace: 'ALL',
    category: inferCategory(recs),
    created_at: now,
    usage_count: 0,
    last_used: null,
    _source: 'csv_import', // audit field — can remove if unwanted
  });
}

// ---- Write out ----
fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
console.log(`Wrote ${OUT_PATH}`);
console.log(`Total entries: ${out.length}`);
console.log(`  - Enhanced from CSV: ${enhancedIds.size}`);
console.log(`  - Carried over unchanged: ${rag.length - enhancedIds.size}`);
console.log(`  - New from CSV: ${out.length - rag.length}`);
