// Regenerate aliases + keywords for all CSV-touched entries (77 new + 53 enhanced = 130)
// using claude-sonnet-4-6 via the fzzixun gateway.
//
// Design notes:
// - Anthropic SDK with baseURL override (gateway speaks Anthropic native format)
// - tool_use forced via tool_choice for bulletproof structured output (works on Bedrock relays)
// - Prompt caching on system prompt + tool definition (stable across 130 calls)
// - SDK handles retry automatically (maxRetries=4, exponential backoff)
// - Incremental save every 20 entries so a crash mid-run is recoverable

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const PROJECT = 'c:/Users/Administrator/Desktop/Algernon/AI辅助策略生成模块';
const V2_PATH = path.join(PROJECT, '.claude/skills/access-policy-builder/assets/rag_simple_db_v2.json');
const RAG_PATH = path.join(PROJECT, '.claude/skills/access-policy-builder/assets/rag_simple_db.json');

const MODEL = 'claude-sonnet-4-6';
const BASE_URL = process.env.ANTHROPIC_BASE_URL;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) { console.error('ANTHROPIC_API_KEY not set in .env'); process.exit(1); }

const client = new Anthropic({
  apiKey: API_KEY,
  baseURL: BASE_URL,
  maxRetries: 4,
  timeout: 60000,
});

const SYSTEM_PROMPT = `你是亚马逊卖家后台页面数据标注专家。你为每个页面生成两组词汇，用于 RAG 检索系统。

## 生成规则

### aliases（5-10 个）— 用户实际可能使用的同义表达
- 贴近真实对话场景：口语化、含简称和俗称（例如"上架"、"铺货"、"投广告"、"开促销"）
- 保留关键英文术语：FBA、MCF、AWD、CSBA、ASIN、Listing、SKU、FNSKU、EBC、A+、CTA、Prime、Vine、SAFE-T 等
- 包含中英混合表达（例如"FBA 退货"、"创建 Listing"、"Brand Registry"）
- 单个别名不超过 15 个字
- 如果页面标题本身就是标准叫法，要包含它

### keywords（5-10 个）— 用于索引匹配的词汇
- 包括页面标题、菜单节点、业务场景词、官方功能名
- 可以与 aliases 部分重合，但侧重检索覆盖面
- 避免通用 UI 词：Banner、Modal、Data Table、Button、Dropdown、Widget、弹窗、面板、按钮等

## 输出约束
- 必须通过 record_output 工具提交，不要输出纯文本
- 每个数组至少 5 个、至多 10 个
- 去重（aliases 内部不重复，keywords 内部不重复）
- 所有条目都是实际能用于语义匹配的具体词汇，不是说明性句子`;

const TOOL_DEFINITION = {
  name: 'record_output',
  description: '提交为当前页面生成的 aliases 和 keywords。',
  input_schema: {
    type: 'object',
    properties: {
      aliases: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 10,
                description: '用户可能说出的同义表达，5-10 个' },
      keywords: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 10,
                  description: '检索索引关键词，5-10 个' },
    },
    required: ['aliases', 'keywords'],
  },
};

function buildUserPrompt(entry) {
  const existing = (entry.aliases || []).filter(a => a && a.length < 40).slice(0, 12);
  return `页面标题: ${entry.user_description}
核心业务功能: ${entry.page_description || '(无描述)'}
现有别名参考: ${existing.length > 0 ? existing.join(' / ') : '(无)'}

请为该页面生成 aliases 和 keywords，调用 record_output 提交。`;
}

async function enrichOne(entry) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
    ],
    tools: [{ ...TOOL_DEFINITION, cache_control: { type: 'ephemeral' } }],
    tool_choice: { type: 'tool', name: 'record_output' },
    messages: [{ role: 'user', content: buildUserPrompt(entry) }],
  });

  const toolUse = response.content.find(b => b.type === 'tool_use');
  if (!toolUse) throw new Error(`No tool_use block in response for ${entry.id}`);
  return {
    aliases: toolUse.input.aliases,
    keywords: toolUse.input.keywords,
    usage: response.usage,
  };
}

function identifyTargets(v2, rag) {
  const ragById = new Map(rag.map(e => [e.id, e]));
  const targets = [];
  for (const entry of v2) {
    if (entry._source === 'csv_import') {
      targets.push({ entry, kind: 'new' });
    } else {
      const orig = ragById.get(entry.id);
      if (orig && (
        (entry.aliases?.length ?? 0) !== (orig.aliases?.length ?? 0) ||
        entry.exact_url !== orig.exact_url ||
        entry.page_description !== orig.page_description
      )) {
        targets.push({ entry, kind: 'enhanced' });
      }
    }
  }
  return targets;
}

async function main() {
  const v2 = JSON.parse(fs.readFileSync(V2_PATH, 'utf8'));
  const rag = JSON.parse(fs.readFileSync(RAG_PATH, 'utf8'));

  const targets = identifyTargets(v2, rag);
  const byId = new Map(v2.map(e => [e.id, e]));

  console.log(`Loaded: ${v2.length} v2 entries, ${rag.length} rag entries`);
  console.log(`Targets to enrich: ${targets.length} (new: ${targets.filter(t => t.kind === 'new').length}, enhanced: ${targets.filter(t => t.kind === 'enhanced').length})`);
  console.log(`Model: ${MODEL}  |  Base URL: ${BASE_URL || '(default)'}`);
  console.log('='.repeat(80));

  const startTime = Date.now();
  let totalCacheCreate = 0, totalCacheRead = 0, totalInput = 0, totalOutput = 0, failed = 0;

  // Allow resuming: if arg is passed, start from that index
  const startIdx = parseInt(process.argv[2] || '0', 10);
  const limit = process.argv[3] ? parseInt(process.argv[3], 10) : targets.length;

  for (let i = startIdx; i < Math.min(startIdx + limit, targets.length); i++) {
    const { entry, kind } = targets[i];
    const padded = `[${String(i + 1).padStart(3)}/${targets.length}]`;
    try {
      const result = await enrichOne(entry);
      const live = byId.get(entry.id);
      live.aliases = result.aliases;
      live.keywords = result.keywords;
      totalCacheCreate += result.usage.cache_creation_input_tokens || 0;
      totalCacheRead += result.usage.cache_read_input_tokens || 0;
      totalInput += result.usage.input_tokens || 0;
      totalOutput += result.usage.output_tokens || 0;

      console.log(`${padded} ${kind.padEnd(8)} ${entry.id} "${entry.user_description}" → ${result.aliases.length}a/${result.keywords.length}k  (in:${result.usage.input_tokens} cache_r:${result.usage.cache_read_input_tokens || 0} out:${result.usage.output_tokens})`);
    } catch (err) {
      failed++;
      console.error(`${padded} ${kind.padEnd(8)} ${entry.id} FAILED: ${err.message}`);
    }

    // Incremental save every 20
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(V2_PATH, JSON.stringify(v2, null, 2), 'utf8');
      console.log(`  -- checkpoint saved at ${i + 1} --`);
    }
  }

  // Final save
  fs.writeFileSync(V2_PATH, JSON.stringify(v2, null, 2), 'utf8');

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('='.repeat(80));
  console.log(`Done in ${elapsed}s  |  Failed: ${failed}`);
  console.log(`Tokens — input: ${totalInput}, cache_read: ${totalCacheRead}, cache_create: ${totalCacheCreate}, output: ${totalOutput}`);
  const cacheHitRate = totalCacheRead + totalInput > 0
    ? (totalCacheRead / (totalCacheRead + totalInput) * 100).toFixed(1)
    : '0.0';
  console.log(`Cache hit rate: ${cacheHitRate}%`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
