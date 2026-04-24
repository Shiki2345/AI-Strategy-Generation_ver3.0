// Normalize URL + dedupe + compare with existing rag_simple_db.json
// Step 1 output: review .md file (no write to rag DB)

const fs = require('fs');
const path = require('path');

const PROJECT = 'c:/Users/Administrator/Desktop/Algernon/AI辅助策略生成模块';
const CSV_PATH = path.join(PROJECT, 'AI总结URL+页面信息.csv');
const RAG_PATH = path.join(PROJECT, '.claude/skills/access-policy-builder/assets/rag_simple_db.json');
const OUT_PATH = path.join(PROJECT, 'CSV归一化评审表.md');

// ---- URL normalization rules ----
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

  // Strip hash
  const hashIdx = u.indexOf('#');
  if (hashIdx >= 0) u = u.slice(0, hashIdx);

  // Remove pseudo-path segments like /ref=xxx or /ref_=xxx appearing mid-path
  // e.g. /xxx/ref_=xx_xxx_dnav_xx -> /xxx
  u = u.replace(/\/ref_?=[^/?]+/gi, '');

  // Handle malformed URLs where query params were glued to path with / instead of ?
  // e.g. /inventory/view/optimize-listings/fulfilledBy=all&page=1&... -> /inventory/view/optimize-listings
  // e.g. /account/onboarding/enrollmentApplicationId=hCBn11x1 -> /account/onboarding
  // Detect: a path segment that contains = (and possibly & in following segments)
  // We take the whole tail starting at such a segment and convert to proper query
  const malformedMatch = u.match(/^(.+?:\/\/[^/]+)(\/[^?#]*?)(\/[a-zA-Z_][a-zA-Z0-9_]*=[^?#]*)$/);
  if (malformedMatch) {
    const origin = malformedMatch[1];
    const cleanPath = malformedMatch[2];
    const pseudoQuery = malformedMatch[3].slice(1); // drop leading /
    // Convert the pseudo-query into a real query string and re-parse
    u = origin + cleanPath + '?' + pseudoQuery;
  }

  // Parse
  let parsed;
  try { parsed = new URL(u); } catch (e) { return u; }

  // Domain wildcard
  let host = parsed.hostname.toLowerCase();
  let newHost;
  if (host.includes('advertising.amazon')) {
    newHost = 'advertising.amazon.*';
  } else if (host.endsWith('.amazon.com') || host.endsWith('.amazon.co.jp') ||
             host.endsWith('.amazon.co.uk') || host.includes('.amazon.')) {
    newHost = '*.amazon.*';
  } else {
    newHost = host; // non-amazon, keep as-is (shouldn't happen in CSV)
  }

  // Filter query params
  const kept = [];
  for (const [k, v] of parsed.searchParams.entries()) {
    const kl = k.toLowerCase();
    if (KEEP_KEYS.has(kl)) {
      kept.push([k, v]);
    } else if (TRACKING_KEYS.has(kl)) {
      // drop
    } else {
      // unknown param — drop by default (user said 全砍 for Tab params,
      // and tracking rules cover rest; any residual unknown we also drop)
    }
  }

  let result = 'https://' + newHost + parsed.pathname;
  if (kept.length > 0) {
    const qs = kept.map(([k, v]) => `${k}=${v}`).join('&');
    result += '?' + qs;
  }
  // Remove trailing slash unless it's the only path char
  if (result.endsWith('/') && parsed.pathname !== '/') {
    result = result.slice(0, -1);
  }
  return result;
}

// ---- CSV parsing (handles quoted fields with commas) ----
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') {
        row.push(field); rows.push(row);
        row = []; field = '';
      } else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

// ---- Main ----
const csvText = fs.readFileSync(CSV_PATH, 'utf8').replace(/^﻿/, '');
const rows = parseCsv(csvText);
const header = rows[0];
const data = rows.slice(1).filter(r => r.some(c => c && c.trim()));

const IDX = {
  menu: header.indexOf('功能'),
  ts: header.indexOf('画面特征/时间戳'),
  title: header.indexOf('页面标题 (Page Title)'),
  menuPath: header.indexOf('菜单路径 (Menu Path)'),
  func: header.indexOf('核心业务功能 (Core Function)'),
  content: header.indexOf('网页内容 (Webpage Content)'),
  url: header.indexOf('映射 URL (Mapped URL)'),
  conf: header.indexOf('置信度'),
};

// Carry menu forward (CSV groups: only first row of each group has 功能 filled)
let currentMenu = '';
const records = data.map((r, i) => {
  if (r[IDX.menu] && r[IDX.menu].trim()) currentMenu = r[IDX.menu].trim();
  return {
    csvLine: i + 2,
    menu: currentMenu,
    ts: (r[IDX.ts] || '').trim(),
    title: (r[IDX.title] || '').trim(),
    menuPath: (r[IDX.menuPath] || '').trim(),
    func: (r[IDX.func] || '').trim(),
    content: (r[IDX.content] || '').trim(),
    rawUrl: (r[IDX.url] || '').trim(),
    conf: (r[IDX.conf] || '').trim(),
  };
});

// Normalize and dedupe by URL
const byUrl = new Map();
for (const rec of records) {
  const normUrl = normalizeUrl(rec.rawUrl);
  if (!normUrl) continue;
  if (!byUrl.has(normUrl)) {
    byUrl.set(normUrl, { normUrl, sources: [] });
  }
  byUrl.get(normUrl).sources.push(rec);
}

// Load rag_simple_db.json — also normalize trailing-slash for fair comparison
const rag = JSON.parse(fs.readFileSync(RAG_PATH, 'utf8'));
const ragByUrl = new Map();
function cmpKey(u) {
  // Strip trailing slash (unless the url is just protocol://host/)
  let k = u.trim();
  if (k.endsWith('/') && k.split('/').length > 4) k = k.slice(0, -1);
  return k;
}
for (const entry of rag) {
  ragByUrl.set(cmpKey(entry.exact_url), entry);
}

// Build review table
const grouped = Array.from(byUrl.values());
grouped.sort((a, b) => a.sources[0].csvLine - b.sources[0].csvLine);

// Levenshtein distance on path segment for typo detection
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m || !n) return Math.max(m, n);
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}

// Extract path from normalized URL for comparison
function urlPath(u) {
  try { return new URL(u.replace('*.amazon.*', 'placeholder.amazon.com').replace('advertising.amazon.*', 'advertising.amazon.com')).pathname; }
  catch { return u; }
}

const added = [];
const enhanced = [];
for (const g of grouped) {
  if (ragByUrl.has(cmpKey(g.normUrl))) enhanced.push(g);
  else added.push(g);
}

// Find near-matches in rag DB for each added entry
const suspected = [];
for (const g of added) {
  const gPath = urlPath(g.normUrl);
  if (gPath.length < 5) continue;
  for (const entry of rag) {
    const ePath = urlPath(entry.exact_url);
    if (ePath === gPath) continue;
    const dist = levenshtein(gPath, ePath);
    const maxLen = Math.max(gPath.length, ePath.length);
    if (dist > 0 && dist <= 3 && dist / maxLen < 0.15) {
      suspected.push({ normUrl: g.normUrl, source: g.sources[0], ragEntry: entry, distance: dist });
    }
  }
}

let md = '';
md += '# CSV → rag_simple_db.json 归一化评审表\n\n';
md += `- 原始 CSV 行数：${records.length}\n`;
md += `- 归一化后唯一 URL 数：${grouped.length}\n`;
md += `- 现有 rag_simple_db.json 条目数：${rag.length}\n\n`;
md += `- 🆕 新增条目：**${added.length}** 条\n`;
md += `- 🔁 增强已有条目：**${enhanced.length}** 条\n\n`;

// Dup stats
const dupGroups = grouped.filter(g => g.sources.length > 1);
md += `- 📎 合并过的重复 URL 数：**${dupGroups.length}** 组（合计 ${dupGroups.reduce((s, g) => s + g.sources.length, 0)} 行合并为 ${dupGroups.length} 条）\n\n`;

md += '---\n\n';

if (suspected.length > 0) {
  md += '## ⚠️ 疑似拼写差异 / 可能重复（人工重点核对）\n\n';
  md += '自动通过 path 编辑距离发现以下 CSV 新增条目与现有 rag DB 有相似路径，请人工确认是否为同一页面（可能是 CSV 原始录入有错字）：\n\n';
  md += '| CSV URL | 现有 rag URL | rag_id | 现有 user_description | CSV 行 | 编辑距离 |\n';
  md += '|---|---|---|---|---|---|\n';
  for (const s of suspected) {
    md += `| \`${s.normUrl}\` | \`${s.ragEntry.exact_url}\` | ${s.ragEntry.id} | ${s.ragEntry.user_description} | L${s.source.csvLine} | ${s.distance} |\n`;
  }
  md += '\n---\n\n';
}

md += '## 一、🆕 新增条目（CSV 有、rag_simple_db.json 无）\n\n';
md += '| # | 归一化 URL | 页面标题 | 菜单路径 | 核心业务功能 | 置信度 | CSV 源行 |\n';
md += '|---|---|---|---|---|---|---|\n';
added.forEach((g, i) => {
  const titles = [...new Set(g.sources.map(s => s.title).filter(Boolean))].join(' / ');
  const paths = [...new Set(g.sources.map(s => s.menuPath).filter(Boolean))].join(' / ');
  const funcs = [...new Set(g.sources.map(s => s.func).filter(Boolean))].join(' / ');
  const confs = [...new Set(g.sources.map(s => s.conf).filter(Boolean))].join('/');
  const lines = g.sources.map(s => `L${s.csvLine}`).join(',');
  md += `| ${i + 1} | \`${g.normUrl}\` | ${titles} | ${paths} | ${funcs} | ${confs} | ${lines} |\n`;
});

md += '\n---\n\n';
md += '## 二、🔁 增强已有条目（URL 已存在于 rag_simple_db.json）\n\n';
md += '| # | 归一化 URL | 现有 rag_id | 现有 user_description | CSV 页面标题 | CSV 核心业务功能 | 置信度 | CSV 源行 |\n';
md += '|---|---|---|---|---|---|---|---|\n';
enhanced.forEach((g, i) => {
  const existing = ragByUrl.get(cmpKey(g.normUrl));
  const titles = [...new Set(g.sources.map(s => s.title).filter(Boolean))].join(' / ');
  const funcs = [...new Set(g.sources.map(s => s.func).filter(Boolean))].join(' / ');
  const confs = [...new Set(g.sources.map(s => s.conf).filter(Boolean))].join('/');
  const lines = g.sources.map(s => `L${s.csvLine}`).join(',');
  md += `| ${i + 1} | \`${g.normUrl}\` | ${existing.id} | ${existing.user_description} | ${titles} | ${funcs} | ${confs} | ${lines} |\n`;
});

md += '\n---\n\n';
md += '## 三、📎 重复合并详情（同一归一化 URL 的多个 CSV 源行）\n\n';
dupGroups.forEach((g, i) => {
  md += `### ${i + 1}. \`${g.normUrl}\` （${g.sources.length} 行合并）\n\n`;
  md += '| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |\n';
  md += '|---|---|---|---|---|\n';
  g.sources.forEach(s => {
    md += `| L${s.csvLine} | ${s.menu} | ${s.title} | ${s.menuPath} | ${s.func} |\n`;
  });
  md += '\n';
});

md += '\n---\n\n';
md += '## 四、rag_simple_db.json 中未被 CSV 覆盖的现有条目（仅供参考）\n\n';
md += '| rag_id | user_description | exact_url |\n';
md += '|---|---|---|\n';
const csvUrls = new Set(grouped.map(g => cmpKey(g.normUrl)));
for (const entry of rag) {
  if (!csvUrls.has(cmpKey(entry.exact_url))) {
    md += `| ${entry.id} | ${entry.user_description} | \`${entry.exact_url}\` |\n`;
  }
}

fs.writeFileSync(OUT_PATH, md, 'utf8');
console.log('Wrote', OUT_PATH);
console.log(`Total records: ${records.length}, Unique URLs: ${grouped.length}, Added: ${added.length}, Enhanced: ${enhanced.length}, Dup groups: ${dupGroups.length}`);
