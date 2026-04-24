// Final cleanup pass on rag_simple_db_v2.json:
// - strip _source audit field per user decision (keep format consistent with existing entries)
// - sanity checks: aliases/keywords counts, duplicates, structure conformance
// - summary report

const fs = require('fs');
const path = require('path');

const PROJECT = 'c:/Users/Administrator/Desktop/Algernon/AI辅助策略生成模块';
const V2_PATH = path.join(PROJECT, '.claude/skills/access-policy-builder/assets/rag_simple_db_v2.json');
const RAG_PATH = path.join(PROJECT, '.claude/skills/access-policy-builder/assets/rag_simple_db.json');

const v2 = JSON.parse(fs.readFileSync(V2_PATH, 'utf8'));
const rag = JSON.parse(fs.readFileSync(RAG_PATH, 'utf8'));

// ---- Cleanup: strip _source ----
let stripped = 0;
for (const entry of v2) {
  if ('_source' in entry) { delete entry._source; stripped++; }
}

// ---- Integrity checks ----
const REQUIRED = ['id', 'user_description', 'exact_url', 'page_description',
                  'aliases', 'keywords', 'marketplace', 'category',
                  'created_at', 'usage_count', 'last_used'];
const problems = [];
const ragIds = new Set(rag.map(e => e.id));

const stats = {
  total: v2.length,
  fromRag: 0, fromCsv: 0,
  aliasCounts: [], keywordCounts: [],
  thinAliases: [], // <5
  tooManyAliases: [], // >10
  dupAliases: [], dupKeywords: [],
};

for (const entry of v2) {
  for (const f of REQUIRED) {
    if (!(f in entry)) problems.push(`${entry.id}: missing ${f}`);
  }
  if (!Array.isArray(entry.aliases)) { problems.push(`${entry.id}: aliases not array`); continue; }
  if (!Array.isArray(entry.keywords)) { problems.push(`${entry.id}: keywords not array`); continue; }

  stats.aliasCounts.push(entry.aliases.length);
  stats.keywordCounts.push(entry.keywords.length);

  if (ragIds.has(entry.id)) stats.fromRag++; else stats.fromCsv++;

  if (entry.aliases.length < 5) stats.thinAliases.push(`${entry.id}(${entry.aliases.length})`);
  if (entry.aliases.length > 10) stats.tooManyAliases.push(`${entry.id}(${entry.aliases.length})`);

  const aSet = new Set(entry.aliases);
  if (aSet.size !== entry.aliases.length) stats.dupAliases.push(entry.id);
  const kSet = new Set(entry.keywords);
  if (kSet.size !== entry.keywords.length) stats.dupKeywords.push(entry.id);
}

// ---- Write cleaned file ----
fs.writeFileSync(V2_PATH, JSON.stringify(v2, null, 2), 'utf8');

// ---- Report ----
const avg = arr => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
console.log('Final v2 DB Status');
console.log('=================='.padEnd(60, '='));
console.log(`Path: ${V2_PATH}`);
console.log(`Total entries: ${stats.total}  (${stats.fromRag} from rag_simple_db.json, ${stats.fromCsv} new from CSV)`);
console.log(`Stripped _source fields: ${stripped}`);
console.log();
console.log(`Aliases per entry  — avg ${avg(stats.aliasCounts)}, min ${Math.min(...stats.aliasCounts)}, max ${Math.max(...stats.aliasCounts)}`);
console.log(`Keywords per entry — avg ${avg(stats.keywordCounts)}, min ${Math.min(...stats.keywordCounts)}, max ${Math.max(...stats.keywordCounts)}`);
console.log();
if (stats.thinAliases.length) console.log(`⚠️  条目 aliases<5: ${stats.thinAliases.join(', ')}`);
if (stats.tooManyAliases.length) console.log(`⚠️  条目 aliases>10: ${stats.tooManyAliases.join(', ')}`);
if (stats.dupAliases.length) console.log(`⚠️  条目 aliases 内部重复: ${stats.dupAliases.join(', ')}`);
if (stats.dupKeywords.length) console.log(`⚠️  条目 keywords 内部重复: ${stats.dupKeywords.join(', ')}`);
if (problems.length === 0) console.log('✅ 所有条目字段结构正常');
else { console.log(`❌ 发现 ${problems.length} 个结构问题:`); problems.slice(0, 20).forEach(p => console.log('  ' + p)); }
