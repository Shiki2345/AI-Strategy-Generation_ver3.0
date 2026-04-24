# CSV → rag_simple_db.json 归一化评审表

- 原始 CSV 行数：141
- 归一化后唯一 URL 数：130
- 现有 rag_simple_db.json 条目数：219

- 🆕 新增条目：**85** 条
- 🔁 增强已有条目：**45** 条

- 📎 合并过的重复 URL 数：**9** 组（合计 20 行合并为 9 条）

---

## ⚠️ 疑似拼写差异 / 可能重复（人工重点核对）

自动通过 path 编辑距离发现以下 CSV 新增条目与现有 rag DB 有相似路径，请人工确认是否为同一页面（可能是 CSV 原始录入有错字）：

| CSV URL | 现有 rag URL | rag_id | 现有 user_description | CSV 行 | 编辑距离 |
|---|---|---|---|---|---|
|  `https://*.amazon.*/gp/ssof/shipping-queue.html` | rag_017 | 管理亚马逊货件 | L11 | 3 |
|  `https://*.amazon.*/automatepricingv2/pricingrules` | rag_045 | 自动定价-新版 | L31 | 1 |
|  `https://*.amazon.*/mcf/orders/create-order` | rag_047 | 创建 MCF 订单 | L36 | 1 |
| `https://*.amazon.*/fba/returns`  | rag_023 | 亚马逊物流退货 | L42 | 1 |
| `https://*.amazon.*/gestalt/manageregistration/index.html` | rag_057 | 定制计划 | L85 | 3 |
| `https://*.amazon.*/customizedReports/lp` | rag_068 | 自定义报告 | L99 | 1 |
| `https://*.amazon.*/gp/tax/tax-library.html` | rag_070 | 税务文件库 | L101 | 3 |
| `https://*.amazon.*/mario/sellerwallet/seller-wallet-onboard/regional/node/welcome/render` | rag_061 | 卖家钱包-新版 | L113 | 1 |
| `https://*.amazon.*/spnsellerdashboard` | rag_087 | 管理服务请求 | L125 | 1 |

---

## 一、🆕 新增条目（CSV 有、rag_simple_db.json 无）

| # | 归一化 URL | 页面标题 | 菜单路径 | 核心业务功能 | 置信度 | CSV 源行 |
|---|---|---|---|---|---|---|
| 1 | `https://*.amazon.*/inventory/view/fix-issues` | 修复无在售信息的亚马逊库存 | 库存 > 管理所有库存 > 了解更多信息 | 处理异常滞留库存 (Stranded Inventory) | High | L3 |
| 2 | `https://*.amazon.*/inventory/view/optimize-listings` | 改善商品信息 / 所有库存 | 库存 > 管理所有库存 > 改善商品信息 / [隐性路径跳转] | 优化 Listing 质量以提升转化率 / 全局概览及优化在售商品 (Active Listings) 状态 | High | L4,L50 |
| 3 | `https://*.amazon.*/sell-globally/home` | 全球销售 | 库存 > Sell Globally | 监控跨国店铺业务指标与账户连接状态 | High | L7 |
| 4 | `https://*.amazon.*/automotive-mfn` | Request Access to Automotive Fitment Manager | 库存 > Manage Automotive Fitment Data | 汽配类目专属 AFM 工具开通申请 | High | L8 |
| 5 | `https://*.amazon.*/go/suo/shipping-queue.html` | 货件处理进度 | 库存 > 亚马逊物流库存 > 货件 | 追踪向亚马逊仓库发货的物流状态 | High | L11 |
| 6 | `https://*.amazon.*/next/fba` | 亚马逊物流注册机会 | 库存 > 亚马逊物流库存 > 机会 | 推荐高转化潜力商品转入 FBA 履约 | High | L12 |
| 7 | `https://*.amazon.*/fba/selleranalytics/fba/age-excess` | 亚马逊物流分析 | 库存 > 分析 | 分析积压库存以制定清货或移仓策略 | High | L13 |
| 8 | `https://*.amazon.*/fba/selleranalytics/value-recovery` | 亚马逊物流分析 (多渠道配送) | 库存 > 分析 > 导航切换至"多渠道配送" | 监控 MCF 订单资金回收状况 | High | L14 |
| 9 | `https://*.amazon.*/rafn/inventory` | 亚马逊物流远程配送 | 库存 > Remote Fulfillment with FBA | 管理利用一国 FBA 仓配多国的跨国配送 | High | L15 |
| 10 | `https://*.amazon.*/awd/about` | 亚马逊仓储和分拨服务计划 | 库存 > 亚马逊仓储和分拨服务计划 | AWD 卫星仓/上游仓储方案介绍与入驻 | High | L16 |
| 11 | `https://*.amazon.*/fba/sendtoamazon/confirm_content_step?upstream_storage=true` | 发送至亚马逊仓储和分拨 | 页面内动作流跳转 (Send to Amazon) | 创建发往 AWD 上游仓的货件计划 | High | L17 |
| 12 | `https://*.amazon.*/sizechart` | 尺码表：上传或编辑 | 目录 > 添加尺码表 | 为服饰鞋包类目挂载结构化尺码数据 | High | L21 |
| 13 | `https://*.amazon.*/inventory/view/drafts` | 所有库存 (草稿) | 目录 > 补全你的草稿 | 管理缺失必填项或待审核状态的商品草稿 | High | L22 |
| 14 | `https://*.amazon.*/learn/dashboard` | 卖家大学 | 页面内跳转至教育中心 | 官方卖家培训与合规教育资源集合 | High | L23 |
| 15 | `https://*.amazon.*/imaging/manage` | 图片管理器 | 目录 > Upload Images | 全局可视化化管理商品变体的合规变体图 | High | L25 |
| 16 | `https://*.amazon.*/media/upload` | 上传图片 (批量) | 目录 > Upload Images > 上传图片 Tab | Zip 压缩包批量注入商品图片 | High | L26 |
| 17 | `https://*.amazon.*/imaging/3dviewer` | 教育中心 (资产审核) | 目录 > Upload Images > 3D资产审核 Tab | 审核供 AR 试展示的 3D 模型资产 | High | L27 |
| 18 | `https://*.amazon.*/fba/sendtoamazon/confirm_step?upstream_storage=true` | 发货至亚马逊 - 第 1 步：选择要发送的库存 | (无明确展开的左侧菜单) | 配置 FBA 入仓货件属性并选择待发货 SKU | High | L29 |
| 19 | `https://*.amazon.*/automatepricing/2/pricingrules` | 自动定价规则 | 定价 > Automate Pricing | 管理基于预设条件和算法的自动动态调价规则引擎 | High | L31 |
| 20 | `https://*.amazon.*/lpf/seller` | 灵活买家融资计划 | 定价 > 亚马逊高客单价等项目计划付款 | 注册买家分期付款/融资计划以提升高客单价 SKU 的前端转化率 | High | L33 |
| 21 | `https://*.amazon.*/v0/seller/bwf` | 卖家主页 (后台首页) | 无 (全局入口) | 提供主导航入口及重要系统通知/弹窗引导 | High | L34 |
| 22 | `https://*.amazon.*/mc/orders/create-order` | 创建多渠道配送订单 | 订单 > Create MCF Order | 创建多渠道配送 (MCF) 的站外发货请求 | High | L36 |
| 23 | `https://*.amazon.*/order-reports-and-feeds/reports/endofdayform` | 生成日结单表单 | 订单 > 订单报告 (生成日结单表单 Tab) | 生成承运商所需的批量交接清单 (End of Day Form) | High | L38 |
| 24 | `https://*.amazon.*/return-insights` | 退货与回收：洞察与商机 | 订单 > 退货与回收机 | 提供逆向物流的数据可视化 Dashboard | High | L40 |
| 25 | `https://*.amazon.*/central/recovery` | 退货与回收：洞察与商机 | 订单 > 退货与回收机 (回收中心 Tab) | 监控二手及可回收商品的残值挽回绩效 | High | L41 |
| 26 | `https://*.amazon.*/fba/returns` | 亚马逊物流退货 | [隐性路径跳转] | 分析 FBA 退货趋势及具体 ASIN 的退货原因 | High | L42 |
| 27 | `https://*.amazon.*/reportcentral/CUSTOMER_RETURN/0` | 亚马逊物流买家退货报告 | [隐性路径跳转] | 自定义检索 FBA 退货流水明细 | High | L43 |
| 28 | `https://*.amazon.*/fba/insights` | 需要访问权限 | [受限拦截路径] | 拦截无子账号权限越权访问页面的安全机制 | High | L46 |
| 29 | `https://*.amazon.*/reportcentral/VALUE_RECOVERY/0` | 亚马逊物流商品分级和价值回收报告 | [隐性路径跳转] | 检索 FBA 损坏/二次销售商品的分级评定结果 | High | L47 |
| 30 | `https://*.amazon.*/reportcentral/REMOVAL_ORDER_DETAIL/1` | 移除订单详情报告 | [隐性路径跳转] | 审查清理不可售库存 (Removal Order) 的执行记录 | High | L49 |
| 31 | `https://*.amazon.*/safet-claims` | SAFE-T 索赔 / 管理 SAFE-T 索赔 | 订单 > 管理 SAFE-T 索赔 / 卖家后台菜单 > 广告 (悬停) | 提交并追踪卖家免责情况下的资金索赔申请 / 卖家自配送订单赔付申请管理 | High | L52,L53 |
| 32 | `https://advertising.amazon.*/recommendations` | 推荐建议 | 广告活动管理 > 左侧导航首个 Tab | 广告智能优化策略推荐 | High | L55 |
| 33 | `https://advertising.amazon.*/builder/brand-profile` | 您的 Brand Profile (品牌资料) / 品牌旗舰店 | 左侧导航 > 品牌内容 > 品牌资料 / 左侧导航 > 品牌旗舰店 | 品牌核心视觉资产配置 / 品牌专属落地页构建与管理 | High/Medium | L56,L57 |
| 34 | `https://advertising.amazon.*/builder/content-builder` | 亚马逊内容营销计划 | 左侧导航 > 亚马逊内容营销计划 | 品牌社交化图文内容分发 | Medium | L58 |
| 35 | `https://advertising.amazon.*/creative-assets` | 创意素材 | 左侧导航 > 创意素材 | 广告素材（图文/视频）资产库 | High | L59 |
| 36 | `https://advertising.amazon.*/creative-studio/test` | 了解创意智能体 | 左侧导航 > 创意工作室 (Beta) | AIGC 多模态广告素材生成工具 | High | L60 |
| 37 | `https://advertising.amazon.*/translation/marketplaces` | 选择翻译服务 | 左侧导航 > 翻译 | 跨境广告物料多语言本地化 | High | L61 |
| 38 | `https://advertising.amazon.*/bm/bm/unauthorized` | 品牌指标（测试版） | 左侧导航 > 品牌指标 | 衡量品牌购物旅程各节点转化率 | High | L62 |
| 39 | `https://advertising.amazon.*/bm/sti/bm/unauthorized` | 品牌展示份额 | 左侧导航 > 品牌搜索份额分析 | 品牌及竞品搜索词流量占有率评估 | High | L63 |
| 40 | `https://advertising.amazon.*/mediaPlanning/ads-planner/plans` | 广告策划师 | 左侧导航 > 广告策划师 | 多渠道媒介排期与预算分配工具 | High | L64 |
| 41 | `https://advertising.amazon.*/attribution/ineligible` | 亚马逊引流洞察（测试版） | 左侧导航 > 亚马逊引流洞察 | 站外全渠道流量追踪与销售归因 | High | L65 |
| 42 | `https://advertising.amazon.*/marketing-cloud/acceptTerms` | 亚马逊营销云 (AMC) | 左侧导航 > 亚马逊营销云 | 跨媒介高颗粒度数据集成与建模 | High | L66 |
| 43 | `https://advertising.amazon.*/reporting/test` | 使用模板创建报告 | 左侧导航 > 测量和报告 (创建页) | 定制化数据报表导出配置 | High | L67 |
| 44 | `https://advertising.amazon.*/studies/test` | 调研 | 左侧导航 > 调研 | 消费者倾向问卷与定性市场洞察 | High | L69 |
| 45 | `https://advertising.amazon.*/events-manager` | 事件管理 | 左侧导航 > 事件管理 | 追踪代码 (Pixel) 部署与转化事件联调 | High | L70 |
| 46 | `https://advertising.amazon.*/am/sellec/ENTITYK8DOVZ0A9Y68` | 账户访问和设置 | 齿轮图标 > 账户访问和设置 | 跨国站点子账号与角色权限管控 | High | L71 |
| 47 | `https://advertising.amazon.*/ads-bg/billing/history` | 账单概览 | 齿轮图标 > 账单和付款 | 跨国站点广告财务对账与结算 | High | L72 |
| 48 | `https://*.amazon.*/attribution` | 亚马逊引流洞察 测试版 | 卖家后台菜单 > 广告 > 衡量非亚马逊广告 | 外部社媒/搜索流量站内转化追踪监控 | High | L73 |
| 49 | `https://*.amazon.*/enhanced-content/content-manager` | 商品描述管理器 | 卖家后台菜单 > 广告 > A+ 商品描述管理器 | 结构化图文详情页 (A+/EBC) 编排配置 | High | L74 |
| 50 | `https://*.amazon.*/vine/welcome_to_vine` | Amazon Vine | 卖家后台菜单 > 广告 > Vine | 官方合规邀评与种子买家送测 | High | L75 |
| 51 | `https://*.amazon.*/merchandising-new/funding` | 借助促销提升销量 | 卖家后台菜单 > 广告 > 秒杀 | Prime Day/七天促销等站内 Deal 提报 | High | L76 |
| 52 | `https://*.amazon.*/promotions/manage` | 促销 | 卖家后台菜单 > 广告 > 管理促销 | 组合购买折扣或社媒专属折扣码设置 | High | L80 |
| 53 | `https://advertising.amazon.*/builder` | 品牌旗舰店 | 广告 > 品牌旗舰店 | 创建与管理品牌专属亚马逊旗舰店页面 | High | L81 |
| 54 | `https://*.amazon.*/buy-with-prime` | 在您的电子商务网站上提供 Prime 购物优惠 | 增长 > 用 Prime 购实现您的网站 | 引导商家开通 Buy with Prime 服务以转化独立站流量 | High | L82 |
| 55 | `https://*.amazon.*/gmtall/manageregistration/index.html` | 亚马逊定制计划 | 增长 > 定制计划 | 管理与发布支持买家个性化定制的商品 | High | L85 |
| 56 | `https://*.amazon.*/selection/cross-listing` | 全球开店选品需求 | 增长 > 跨地区选品 | 分析其他站点同类竞品的表现，推荐跨国上架机会 | High | L86 |
| 57 | `https://*.amazon.*/lending/ph/offers` | 亚马逊贷款 | 增长 > 借贷 | 向符合条件的卖家提供第三方企业融资贷款入口 | High | L87 |
| 58 | `https://*.amazon.*/opportunity-explorer/explore` | 商机探测器 | 增长 > 商机探测器 | 探索买家搜索趋势、识别高潜力细分市场与热门关键词 | High | L88 |
| 59 | `https://*.amazon.*/custom-analytics/dashboard/overall-business-performance-template` | 整体业务绩效 | 数据报告 > Custom Analytics | 综合评估全盘业务健康度与核心 KPI 达标情况 | High | L94 |
| 60 | `https://*.amazon.*/custom-analytics/templates` | 创建自定义控制面板 | 数据报告 > Custom Analytics | 支持商家根据特定业务场景组合与实例化数据仪表盘模板 | High | L95 |
| 61 | `https://*.amazon.*/reportcentral/WelcomePage` | 亚马逊物流报告 | 数据报告 > 亚马逊物流 | 提供针对 FBA 仓储、库存及配送状态的专属报告聚合入口 | High | L96 |
| 62 | `https://*.amazon.*/customizedReports/sp` | 亚马逊生成的报告 | 数据报告 > 自定义报告 | 集中管理由系统或用户配置生成的非标准化数据报告 | High | L99 |
| 63 | `https://*.amazon.*/tax/tax-library.html` | 税务文档库 | 数据报告 > Tax Document Library | 为财务合规提供税务发票与相关文档的统一调阅存档中心 | High | L101 |
| 64 | `https://*.amazon.*/tax/exemptions` | Tax-Exemption Certificates | 数据报告 > Tax Document Library | 管理针对特定 B2B 买家订单的免税资质证明 | High | L102 |
| 65 | `https://*.amazon.*/economics` | 利润分析 | 数据报告 > 销售成本和费用 | 全链路解构销售收入结构，定位各项成本损耗以优化商品利润模型 | High | L104 |
| 66 | `https://*.amazon.*/scenario-modeling` | 场景建模 | 数据报告 > 销售成本和费用 | 通过调整变量参数(物流、广告等)预估商业策略变动对利润率的潜在影响 | High | L105 |
| 67 | `https://*.amazon.*/revcal` | 收入计算器 | 数据报告 > 销售成本和费用 | 实时演算单个商品采用亚马逊物流 (FBA) 或自发货 (FBM) 的预估收益 | High | L106 |
| 68 | `https://advertising.amazon.*/ads/bg/billing/history` | 概览 | 侧边栏 > 数据报告 > 付款 > 广告账单历史记录 | 跨站点广告费用账单管理与支付 | High | L111 |
| 69 | `https://*.amazon.*/maric/sellerwallet/seller-wallet-onboard/regional/node/welcome/render` | amazon seller wallet | 侧边栏 > 数据报告 > 亚马逊全球收款 | 卖家钱包服务介绍与注册引导 | High | L113 |
| 70 | `https://*.amazon.*/px/accs` | 卖家货币转换器 | 侧边栏 > 数据报告 > 亚马逊全球收款 | 跨国销售款项换汇费率预估与提现指引 | High | L114 |
| 71 | `https://*.amazon.*/gp/accs` | 卖家货币转换器 (ACCS) | 无 | 跨境收款汇率预估与转换配置 | High | L115 |
| 72 | `https://*.amazon.*/spn/sellerdashboard` | 管理服务请求 | 应用程序和服务 > 管理服务请求 | 追踪与管理向外部服务商发起的服务工单 (Service Requests) 状态与生命周期。 | High | L125 |
| 73 | `https://*.amazon.*/account/onboarding` | 注册加入新计划 | 应用程序和服务 > 开发应用程序 (跨域重定向) | 开发者控制台 (Developer Console) 入驻流程中的关联企业账户选择与鉴权。 | High | L126 |
| 74 | `https://*.amazon.*/business/opportunities` | B2B 选择建议 | B2B > 商品机会 | 洞察并拓展适合 B2B 的高转化选品 | High | L129 |
| 75 | `https://*.amazon.*/profile/certifications` | 认证和证书 | B2B > 认证和证书 | 企业多元化资质与证书归档管理 | High | L130 |
| 76 | `https://*.amazon.*/profile/editor` | 企业资料 | B2B > 企业资料 | 维护卖家 B2B 公开商业档案视图 | High | L131 |
| 77 | `https://*.amazon.*/gc/amazon-business/b2b-growth-essentials` | Amazon Business | B2B > B2B 增长基本信息 | B2B 业务功能聚合导航与卖家培育 | High | L132 |
| 78 | `https://*.amazon.*/business/insights` | 企业商品折扣分析 | B2B > 企业折扣分析 | 监控并优化企业商品阶梯定价策略 | High | L133 |
| 79 | `https://*.amazon.*/gc/amazonbusiness-api-overview` | 亚马逊企业 API | B2B > B2B API 概览 | B2B 自动化工作流 API 对接与授权指引 | High | L135 |
| 80 | `https://*.amazon.*/manage-your-brands` | 管理您的品牌 | 品牌 > 管理您的品牌 | 品牌备案与申请状态追踪 | High | L136 |
| 81 | `https://*.amazon.*/brand-protection` | Amazon Brand Registry | 品牌 > Brand Protection | 品牌保护计划与防伪工具概览 | High | L137 |
| 82 | `https://*.amazon.*/learn/learning-pathway/brand-lp-1` | 卖家大学 - 品牌所有者的成功 | 品牌 > 建立您的品牌 | 品牌建设相关教育资源获取 | High | L138 |
| 83 | `https://*.amazon.*/brand-customer-reviews` | 买家评论 | 品牌 > Customer Reviews | 品牌维度买家评价监控与管理 | High | L139 |
| 84 | `https://*.amazon.*/transparency` | 欢迎使用 Transparency 透明计划 | 品牌 > 借助 Transparency 保护您的品牌 | 透明计划(防伪溯源)申请与业务介绍 | High | L140 |
| 85 | `https://*.amazon.*/seller-forums` | 欢迎来到卖家论坛 | 学习 > 论坛 | 卖家社区交流、异常排查与官方资讯阅览 | High | L142 |

---

## 二、🔁 增强已有条目（URL 已存在于 rag_simple_db.json）

| # | 归一化 URL | 现有 rag_id | 现有 user_description | CSV 页面标题 | CSV 核心业务功能 | 置信度 | CSV 源行 |
|---|---|---|---|---|---|---|---|
| 1 | `https://*.amazon.*/myinventory/inventory` | rag_042 | 管理定价 | 所有库存 | 管理全部 SKU 的库存与基础销售状态 | High | L2 |
| 2 | `https://*.amazon.*/seller-fulfilled-product/analytics` | rag_013 | 管理卖家自配送商品 | 卖家自配送商品 / Customer Service by Amazon (CSBA) 洞察控制面板 | 监控 MFN (自发货) 绩效与销售数据 / 分析亚马逊代客服务 CSBA 绩效 | High | L5,L6 |
| 3 | `https://*.amazon.*/fba/dashboard` | rag_031 | FBA-控制面板 | 亚马逊物流控制面板 | FBA 全局健康度与仓储容量总览 | High | L9 |
| 4 | `https://*.amazon.*/inventoryplanning/manageinventoryhealth` | rag_030 | 管理亚马逊物流库存 | 亚马逊物流库存 | FBA 单品库存周转与补货建议评估 | High | L10 |
| 5 | `https://*.amazon.*/home` | rag_190 | 店铺首页-旧版界面 | 卖家后台主页 | 全局店铺概览与核心事务提醒 | High | L18 |
| 6 | `https://*.amazon.*/product-search` | rag_001 | 添加商品 | 添加商品 | 在已有商品目录中搜索或创建新 ASIN | High | L19 |
| 7 | `https://*.amazon.*/listing/upload` | rag_002 | 批量上传商品 | 批量上传商品 | 通过 Flat File/模板实现 SKU 批量创建与管理 | High | L20 |
| 8 | `https://*.amazon.*/hz/myqdashboard` | rag_004 | 查看销售申请 | 查看销售申请 | 追踪限制级类目/品牌销售权限 (Ungating) 申请 | High | L24 |
| 9 | `https://*.amazon.*/creatorhub/video/library` | rag_007 | 上传和管理视频 | 上传和管理视频 | 管理 A+ 页面及主图位置的买家导购视频 | High | L28 |
| 10 | `https://*.amazon.*/pricing/health` | rag_041 | 定价状况 | 定价状况 | 监控店铺 SKU 定价健康度并获取具有竞争力的系统调价建议 | High | L30 |
| 11 | `https://*.amazon.*/feediscounts/dashboard/price` | rag_044 | 佣金折扣 | 佣金折扣 | 评估并参与通过降低商品终端售价以换取平台销售佣金减免的计划 | Medium | L32 |
| 12 | `https://*.amazon.*/orders-v3/fba/all` | rag_052 | FBA订单管理 | 管理订单 | 管理与追踪 FBA/FBM 订单的履约及配送状态 | High | L35 |
| 13 | `https://*.amazon.*/order-reports-and-feeds/reports` | rag_048 | 订单报告 | 订单报告 | 按需生成并下载历史订单数据报表 | High | L37 |
| 14 | `https://*.amazon.*/order-reports-and-feeds/feeds` | rag_049 | 上传订单相关文件 | 上传订单相关文件 | 批量上传模板文件以同步修改订单状态 | High | L39 |
| 15 | `https://*.amazon.*/voice-of-the-customer` | rag_080 | 买家之声 | 买家之声 | 监控基于买家反馈的商品级 CX 健康度 / 基于 ASIN 粒度监控商品买家不满意率 (NCX) | High | L44,L121 |
| 16 | `https://*.amazon.*/returns/report` | rag_067 | 退货报告 | 退货报告 | 批量导出并下载后台计算的历史退货详情 / 监控并管理买家退货请求与售后订单数据流 | High | L45,L98 |
| 17 | `https://*.amazon.*/payments/event/view` | rag_213 | 交易视图 | 交易视图 | 审视特定时间范围内的账户交易流水明细 / 历史交易明细查询与过滤 | High | L48,L108 |
| 18 | `https://*.amazon.*/gp/returns/list/v2` | rag_205 | 亚马逊新页面 | 管理卖家自配送退货 | 处理 FBM (卖家自配送) 模式下的逆向售后请求 | High | L51 |
| 19 | `https://advertising.amazon.*/cm` | rag_160 | 广告页-1 | 广告活动 | 站内广告投放监控与管理 | High | L54 |
| 20 | `https://advertising.amazon.*/reports` | rag_073 | 广告报告 | 无报告 / 按报告查看结果 | 历史数据报表任务管理与下载 / 追踪与分析站内广告投放活动的 ROI 与流量转化效果 | High | L68,L97 |
| 21 | `https://*.amazon.*/merchandising-new/create` | rag_035 | 创建秒杀 | 促销 (选择商品) | 提报 Deal 门槛校验与 SKU/ASIN 提报 | High | L77 |
| 22 | `https://*.amazon.*/coupons` | rag_185 | 优惠券主页面 | 优惠券 | 单品满减或百分比折扣券全生命周期监控 | High | L78 |
| 23 | `https://*.amazon.*/discounts` | rag_186 | 价格折扣 | Prime 专享折扣 | Prime 会员专属特价活动提报 | High | L79 |
| 24 | `https://*.amazon.*/grow` | rag_055 | 增长建议 | 商品推荐 | 提供 ASIN 维度的运营优化建议与行动看板 | High | L83 |
| 25 | `https://*.amazon.*/recommended-programs` | rag_056 | 浏览计划 | 了解销售计划 | 聚合展示亚马逊各类卖家增长与支持计划，按业务目标分类导航 | High | L84 |
| 26 | `https://*.amazon.*/mcf` | rag_060 | 可用于所有渠道的亚马逊物流库存 | Amazon Multi-Channel Fulfillment | 宣传并引导卖家使用 MCF 处理独立站及其他电商平台的订单 | High | L89 |
| 27 | `https://*.amazon.*/business-reports` | rag_065 | 业务报告 | 销售控制面板 / 业务报告-销售图表和流量 / 业务报告-详情页面销售和流量 / 业务报告-各月销售额和订单数量 | 提供账户全局销售业绩的快速概览与对比分析 / 以时间序列图表展示销售与流量数据的趋势变化 / 提供基于子 SKU/ASIN 维度的流量转化与销售绩效明细 / 基于月度聚合维度的长期销售业绩走势监控 | High | L90,L91,L92,L93 |
| 28 | `https://*.amazon.*/listing/reports` | rag_069 | 库存报告 | 库存报告 | 执行商品库存盘点与可用状态的批量数据导出 | High | L100 |
| 29 | `https://*.amazon.*/managetaxes/global-transaction-reports` | rag_072 | 管理税费 | 全球交易报告 | 提供跨站点多主体财税合规层面的交易流水账单 | High | L103 |
| 30 | `https://*.amazon.*/payments/dashboard/index.html` | rag_212 | 报告视图 | 付款控制面板 | 账户资金概览与结算状态追踪 | High | L107 |
| 31 | `https://*.amazon.*/payments/past-settlements` | rag_214 | 所有声明 | 所有结算 | 历史结算周期账单下载与核对 | High | L109 |
| 32 | `https://*.amazon.*/payments/allstatements/index.html` | rag_215 | 支出 | 转账金额 | 资金转账（打款）记录查询 | High | L110 |
| 33 | `https://*.amazon.*/payments/reports-repository` | rag_217 | 报告存储库 | 报告库 | 财务与结算报告自定义生成及下载 | High | L112 |
| 34 | `https://*.amazon.*/performance/dashboard` | rag_075 | 账户状况 | 账户状况 | 监控全局店铺合规状态与关键服务指标 | High | L116 |
| 35 | `https://*.amazon.*/feedback-manager/index.html` | rag_076 | 反馈 | Feedback Manager (反馈管理器) | 买家店铺反馈数据的多维度查看与管理 | High | L117 |
| 36 | `https://*.amazon.*/gp/guarantee-claims/home.html` | rag_077 | 亚马逊商城交易索赔 | 亚马逊商城交易保障索赔 | 处理买家针对订单发起的 A-to-z 索赔争议 | High | L118 |
| 37 | `https://*.amazon.*/gp/chargebacks/home.html` | rag_078 | 信用卡拒付索赔 | 拒客中止付款 (信用卡拒付) | 处理买家端发起的信用卡拒付 (Chargeback) | High | L119 |
| 38 | `https://*.amazon.*/performance/notifications` | rag_079 | 业绩通知 | 业绩通知 | 查阅官方下发的账户状态审核与违规警告邮件 | High | L120 |
| 39 | `https://*.amazon.*/selling-partner-appstore` | rag_084 | 销售伙伴应用商店 | 销售伙伴应用商店 | 第三方电商应用与系统集成插件 (Plugins/Integrations) 的发现与采购。 | High | L122 |
| 40 | `https://*.amazon.*/apps/manage` | rag_085 | 管理您的应用 | 管理您的应用程序 | 卖家授权的第三方应用 (Third-party Apps) 生命周期与 API 鉴权状态管理。 | High | L123 |
| 41 | `https://*.amazon.*/tsba` | rag_086 | 探索服务 | 探索服务提供商网络 | 基于业务需求检索官方认证的代运营与专业服务提供商 (Service Provider Network, SPN)。 | High | L124 |
| 42 | `https://*.amazon.*/business/b2bcentral` | rag_090 | B2B平台 | B2B 平台 | 企业购业务数据全盘概览与监控 | High | L127 |
| 43 | `https://*.amazon.*/business/manage-quotes` | rag_091 | 管理报价 | 管理报价 | 处理大宗采购询价与自定义折扣请求 | High | L128 |
| 44 | `https://*.amazon.*/business/largepacks` | rag_092 | 装箱推荐 | 多箱推荐 | 匹配适合大宗批发的原厂包装商品 | High | L134 |
| 45 | `https://*.amazon.*/learn` | rag_094 | 卖家大学 | 卖家大学 | 卖家全链路培训与官方课程资源检素 | High | L141 |

---

## 三、📎 重复合并详情（同一归一化 URL 的多个 CSV 源行）

### 1. `https://*.amazon.*/inventory/view/optimize-listings` （2 行合并）

| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |
|---|---|---|---|---|
| L4 | 菜单——库存 | 改善商品信息 | 库存 > 管理所有库存 > 改善商品信息 | 优化 Listing 质量以提升转化率 |
| L50 | 菜单——订单 | 所有库存 | [隐性路径跳转] | 全局概览及优化在售商品 (Active Listings) 状态 |

### 2. `https://*.amazon.*/seller-fulfilled-product/analytics` （2 行合并）

| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |
|---|---|---|---|---|
| L5 | 菜单——库存 | 卖家自配送商品 | 库存 > 管理卖家自配送商品 | 监控 MFN (自发货) 绩效与销售数据 |
| L6 | 菜单——库存 | Customer Service by Amazon (CSBA) 洞察控制面板 | 页面内触发的 Modal 弹窗 | 分析亚马逊代客服务 CSBA 绩效 |

### 3. `https://*.amazon.*/voice-of-the-customer` （2 行合并）

| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |
|---|---|---|---|---|
| L44 | 菜单——订单 | 买家之声 | [隐性路径跳转] | 监控基于买家反馈的商品级 CX 健康度 |
| L121 | 菜单——绩效 | 买家之声 | 绩效 > Voice of the Customer | 基于 ASIN 粒度监控商品买家不满意率 (NCX) |

### 4. `https://*.amazon.*/returns/report` （2 行合并）

| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |
|---|---|---|---|---|
| L45 | 菜单——订单 | 退货报告 | [隐性路径跳转] | 批量导出并下载后台计算的历史退货详情 |
| L98 | 菜单——报告 | 退货报告 | 数据报告 > 退货报告 | 监控并管理买家退货请求与售后订单数据流 |

### 5. `https://*.amazon.*/payments/event/view` （2 行合并）

| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |
|---|---|---|---|---|
| L48 | 菜单——订单 | 交易视图 | [隐性路径跳转] | 审视特定时间范围内的账户交易流水明细 |
| L108 | 菜单——付款 | 交易视图 | 侧边栏 > 数据报告 > 付款 > 交易一览 | 历史交易明细查询与过滤 |

### 6. `https://*.amazon.*/safet-claims` （2 行合并）

| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |
|---|---|---|---|---|
| L52 | 菜单——订单 | SAFE-T 索赔 | 订单 > 管理 SAFE-T 索赔 | 提交并追踪卖家免责情况下的资金索赔申请 |
| L53 | 菜单——广告 | 管理 SAFE-T 索赔 | 卖家后台菜单 > 广告 (悬停) | 卖家自配送订单赔付申请管理 |

### 7. `https://advertising.amazon.*/builder/brand-profile` （2 行合并）

| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |
|---|---|---|---|---|
| L56 | 菜单——广告 | 您的 Brand Profile (品牌资料) | 左侧导航 > 品牌内容 > 品牌资料 | 品牌核心视觉资产配置 |
| L57 | 菜单——广告 | 品牌旗舰店 | 左侧导航 > 品牌旗舰店 | 品牌专属落地页构建与管理 |

### 8. `https://advertising.amazon.*/reports` （2 行合并）

| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |
|---|---|---|---|---|
| L68 | 菜单——广告 | 无报告 | 左侧导航 > 测量和报告 (列表页) | 历史数据报表任务管理与下载 |
| L97 | 菜单——报告 | 按报告查看结果 | 数据报告 > 广告 | 追踪与分析站内广告投放活动的 ROI 与流量转化效果 |

### 9. `https://*.amazon.*/business-reports` （4 行合并）

| CSV 行 | 菜单 | 页面标题 | 菜单路径 | 核心业务功能 |
|---|---|---|---|---|
| L90 | 菜单——报告 | 销售控制面板 | 数据报告 > 业务报告 | 提供账户全局销售业绩的快速概览与对比分析 |
| L91 | 菜单——报告 | 业务报告-销售图表和流量 | 数据报告 > 业务报告 | 以时间序列图表展示销售与流量数据的趋势变化 |
| L92 | 菜单——报告 | 业务报告-详情页面销售和流量 | 数据报告 > 业务报告 | 提供基于子 SKU/ASIN 维度的流量转化与销售绩效明细 |
| L93 | 菜单——报告 | 业务报告-各月销售额和订单数量 | 数据报告 > 业务报告 | 基于月度聚合维度的长期销售业绩走势监控 |


---

## 四、rag_simple_db.json 中未被 CSV 覆盖的现有条目（仅供参考）

| rag_id | user_description | exact_url |
|---|---|---|
| rag_003 | 补全您的草稿 | `https://*.amazon.*/fixyourproducts/drafts` |
| rag_005 | 改进商品信息质量 | `https://*.amazon.*/quality` |
| rag_006 | 上传图片 | `https://*.amazon.*/imaging/upload` |
| rag_008 | 管理商品文档 | `https://*.amazon.*/enhanced-content/content-manager/workflow/product-document` |
| rag_009 | 批量上传2 | `https://*.amazon.*/product-search/bulk` |
| rag_010 | 优化商品信息-新版页面 | `https://*.amazon.*/myinventory/inventory/views/optimize-listings` |
| rag_011 | 创建图文版商品描述 | `https://*.amazon.*/enhanced-content/content-manager/workflow` |
| rag_014 | 全球销售 | `https://*.amazon.*/global-selling/dashboard` |
| rag_015 | 管理亚马逊库存 | `https://*.amazon.*/hz/inventory/view/FBAKNIGHTS` |
| rag_016 | 库存规划 | `https://*.amazon.*/inventoryplanning/dashboard` |
| rag_017 | 管理亚马逊货件 | `https://*.amazon.*/gp/ssof/shipping-queue.html` |
| rag_019 | 库存表现 | `https://*.amazon.*/inventory-performance/dashboard` |
| rag_020 | 补充库存 | `https://*.amazon.*/restockinventory/recommendations` |
| rag_021 | 滞留库存 | `https://*.amazon.*/inventoryplanning/stranded-inventory` |
| rag_022 | 无法履行的库存 | `https://*.amazon.*/inventory` |
| rag_023 | 亚马逊物流退货 | `https://*.amazon.*/fba/return` |
| rag_024 | 全驱动库存 | `https://*.amazon.*/fba-inventory/gim/inventory-list` |
| rag_025 | 发送至亚马逊 | `https://*.amazon.*/fba/sendtoamazon` |
| rag_026 | 出货表现 | `https://*.amazon.*/fba/inboundperformancedashboard` |
| rag_027 | 创建移除订单 | `https://*.amazon.*/recoveryui/removal-order/create` |
| rag_028 | 商品编辑-图片 | `https://*.amazon.*/abis/listing/edit/images` |
| rag_029 | 商品编辑-产品详情 | `https://*.amazon.*/abis/listing/edit/product_details` |
| rag_032 | 创建变体 | `https://*.amazon.*/listing/varwiz` |
| rag_033 | 创建定价规则 | `https://*.amazon.*/automatepricing/rules/rule/` |
| rag_034 | 创建发往亚马逊的货件 | `https://*.amazon.*/fba/sendtoamazon/pack_mixed_unit_step` |
| rag_036 | 促销相关页面 | `https://*.amazon.*/promotions` |
| rag_037 | 秒杀 | `https://*.amazon.*/merchandising-new` |
| rag_038 | Listing编辑 | `https://*.amazon.*/abis/listing/edit/offer` |
| rag_039 | 管理库存-新页面 | `https://*.amazon.*/amazonsell/manage-products` |
| rag_040 | 编辑商品信息 | `https://*.amazon.*/abis/listing/edit` |
| rag_043 | 自动定价 | `https://*.amazon.*/automatepricing/home` |
| rag_045 | 自动定价-新版 | `https://*.amazon.*/automatepricingv2/pricingrules` |
| rag_046 | 管理订单 | `https://*.amazon.*/orders-v3` |
| rag_047 | 创建 MCF 订单 | `https://*.amazon.*/mcf/orders/create-order` |
| rag_050 | 管理退货 | `https://*.amazon.*/gp/returns/list` |
| rag_051 | 卖家自配送-取消订单 | `https://*.amazon.*/orders-v3/order/*/cancel-order` |
| rag_053 | 订单详情 | `https://*.amazon.*/orders-v3/order` |
| rag_054 | 订单退款 | `https://*.amazon.*/gp/orders-v2/refund` |
| rag_057 | 定制计划 | `https://*.amazon.*/gestalt/manageregistration/index.html` |
| rag_058 | 选品指南针 | `https://*.amazon.*/selection` |
| rag_059 | 商机探测器 | `https://*.amazon.*/opportunity-explorer` |
| rag_061 | 卖家钱包-新版 | `https://*.amazon.*/mario/sellerwallet/seller-wallet-onboard/regional/node/welcome/render` |
| rag_063 | 卖家钱包 | `https://*.amazon.*/gc/sellerwallet-program` |
| rag_064 | 亚马逊销售指导 | `https://*.amazon.*/hz/sellingcoach` |
| rag_066 | 库存和销售报告 | `https://*.amazon.*/reportcentral` |
| rag_068 | 自定义报告 | `https://*.amazon.*/customizedReports/lp` |
| rag_070 | 税务文件库 | `https://*.amazon.*/gp/tax/tax-library.html` |
| rag_071 | 广告 | `https://*.amazon.*/sspa/tresah` |
| rag_074 | 销量与访问量 | `https://*.amazon.*/custom-analytics` |
| rag_081 | 账户状况-1 | `https://*.amazon.*/gp/seller-rating/pages/performance-summary.html` |
| rag_082 | 反馈管理器 | `https://*.amazon.*/gp/seller-rating/pages/feedback-manager.html` |
| rag_083 | 业绩通知-1 | `https://*.amazon.*/gp/customer-experience/perf-notifications.html` |
| rag_087 | 管理服务请求 | `https://*.amazon.*/spnsellerdashboard` |
| rag_088 | 开发应用程序 | `https://*.amazon.*/sellingpartner/developerconsole` |
| rag_089 | 开发应用程序-新版 | `https://solutionproviderportal.amazon.com/` |
| rag_093 | 打造您的品牌 | `https://*.amazon.*/build-your-brand` |
| rag_095 | 论坛 | `https://*.amazon.*/forums` |
| rag_096 | 新闻 | `https://*.amazon.*/gp/headlines.html` |
| rag_097 | 礼品选项 | `https://*.amazon.*/gcx/gift-options` |
| rag_098 | 您的信息和政策 | `https://*.amazon.*/gp/help-content/home.html` |
| rag_099 | 税务设置-澳大利亚 | `https://sellercentral.amazon.com.au/tax/jpregistrations` |
| rag_100 | 账户信息 | `https://*.amazon.*/global-dashboard` |
| rag_101 | 付款信息 | `https://*.amazon.*/global-dashboard/payment-information` |
| rag_102 | 卖家信息 | `https://*.amazon.*/sw/AccountInfo/SellerProfile` |
| rag_103 | 登录设置 | `https://*.amazon.*/ap/cnep` |
| rag_104 | 全球账户 | `https://*.amazon.*/account/management` |
| rag_105 | 通知首选项 | `https://*.amazon.*/notifications/preferences` |
| rag_106 | 退货设置 | `https://*.amazon.*/gp/returns/settings` |
| rag_107 | 配送设置 | `https://*.amazon.*/sbr` |
| rag_108 | 税务设置-美国 | `https://sellercentral.amazon.com/tax/nexus/settings` |
| rag_109 | 税务设置-英国 | `https://sellercentral.amazon.co.uk/gc/amazon-business/tax-settings` |
| rag_110 | 用户权限 | `https://*.amazon.*/gp/account-manager/home.html` |
| rag_111 | 用户权限历史记录 | `https://*.amazon.*/audit/account` |
| rag_112 | 亚马逊物流 | `https://*.amazon.*/fba/settings` |
| rag_113 | 亚马逊查看存款方式 | `https://*.amazon.*/sw/AccountInfo/DepositMethodView/step/DepositMethodView` |
| rag_114 | 账户概览 | `https://*.amazon.*/global-dashboard/account-overview` |
| rag_115 | 店铺信息 | `https://*.amazon.*/global-dashboard/store-information` |
| rag_116 | 业务信息 | `https://*.amazon.*/global-dashboard/business-information` |
| rag_117 | 发货和退货信息 | `https://*.amazon.*/global-dashboard/shipping-information` |
| rag_118 | 税务信息 | `https://*.amazon.*/global-dashboard/tax-information` |
| rag_119 | 账户管理 | `https://*.amazon.*/global-dashboard/account-management` |
| rag_120 | 税务设置-欧洲 | `https://*.amazon.*/gc/amazon-business/tax-settings` |
| rag_121 | 用户权限2 | `https://*.amazon.*/account/permission` |
| rag_122 | 税务设置-日本 | `https://sellercentral-japan.amazon.com/gp/tax-manager/dashboard.html/ref=xx_taxmgr_dnav_xx` |
| rag_123 | 用户权限-新版 | `https://*.amazon.*/account/permissions` |
| rag_124 | 配送设置2 | `https://*.amazon.*/sbr#shipping_templates` |
| rag_125 | 用户权限3 | `https://*.amazon.*/account/permissions#/user-management/users` |
| rag_126 | 亚马逊物流设置 | `https://*.amazon.*/fba/settings/index.html#/` |
| rag_127 | 税务信息2 | `https://*.amazon.*/tax` |
| rag_128 | 法人实体 | `https://*.amazon.*/sw/AccountInfo/LegalEntity/step/LegalEntity` |
| rag_129 | RFC信息 | `https://*.amazon.*/tax-interview` |
| rag_130 | 卖家信息2 | `https://*.amazon.*/sw/AccountInfo` |
| rag_131 | 商业信息 | `https://*.amazon.*/mario/seller-verification` |
| rag_132 | 卖家记号 | `https://*.amazon.*/gp/on-board/configuration` |
| rag_133 | 商业保险 | `https://*.amazon.*/mario/v2/az/flow/BusinessInsurance` |
| rag_134 | 管理您的品牌 | `https://brandregistry.amazon.*/` |
| rag_135 | 管理员工 | `https://*.amazon.*/account/permissions#/user-management` |
| rag_136 | 添加员工 | `https://*.amazon.*/account/permissions#/add-user` |
| rag_137 | 公开邀请 | `https://*.amazon.*/account/permissions#/open-invites/user-invites` |
| rag_138 | 两步验证设置 | `https://*.amazon.*/a/settings/approval` |
| rag_139 | 亚马逊欧洲站-意大利 | `https://sellercentral.amazon.it/` |
| rag_140 | 亚马逊欧洲站-英国 | `https://sellercentral.amazon.co.uk/` |
| rag_141 | 亚马逊欧洲站-法国 | `https://sellercentral.amazon.fr/` |
| rag_142 | 亚马逊欧洲站-德国 | `https://sellercentral.amazon.de/` |
| rag_143 | 亚马逊欧洲站-荷兰 | `https://sellercentral.amazon.nl/` |
| rag_144 | 亚马逊欧洲站-瑞典 | `https://sellercentral.amazon.se/` |
| rag_145 | 亚马逊欧洲站-西班牙 | `https://sellercentral.amazon.es/` |
| rag_146 | 亚马逊-澳大利亚 | `https://sellercentral.amazon.com.au/` |
| rag_147 | 亚马逊-日本 | `https://sellercentral.amazon.co.jp/` |
| rag_148 | 亚马逊-新加坡 | `https://sellercentral.amazon.sg/` |
| rag_149 | 亚马逊-美国 | `https://sellercentral.amazon.com/` |
| rag_150 | 亚马逊-墨西哥 | `https://sellercentral.amazon.com.mx/` |
| rag_151 | 亚马逊-加拿大 | `https://sellercentral.amazon.ca/` |
| rag_152 | 亚马逊-沙特 | `https://sellercentral.amazon.sa/` |
| rag_153 | 亚马逊-阿联酋 | `https://sellercentral.amazon.ae/` |
| rag_154 | 亚马逊-埃及 | `https://sellercentral.amazon.eg/` |
| rag_155 | 亚马逊-日本new | `https://sellercentral-japan.amazon.com/` |
| rag_156 | 亚马逊-欧洲总站 | `https://sellercentral-europe.amazon.com/` |
| rag_157 | 亚马逊欧洲站-波兰 | `https://sellercentral.amazon.pl/` |
| rag_158 | 亚马逊欧洲站-比利时 | `https://sellercentral.amazon.com.be/` |
| rag_159 | 广告 | `https://*.amazon.*/reports` |
| rag_161 | 广告页-2 | `https://sellercentral.amazon.*/cm` |
| rag_162 | 法国站广告活动管理 | `https://advertising.amazon.fr/` |
| rag_163 | 英国站广告活动管理 | `https://advertising.amazon.co.uk/` |
| rag_164 | 德国站广告活动管理 | `https://advertising.amazon.de/` |
| rag_165 | 意大利站广告活动管理 | `https://advertising.amazon.it/` |
| rag_166 | 西班牙站广告活动管理 | `https://advertising.amazon.es/` |
| rag_167 | 荷兰站广告活动管理 | `https://advertising.amazon.nl/` |
| rag_168 | 瑞典站广告活动管理 | `https://advertising.amazon.se/` |
| rag_169 | 波兰站广告活动管理 | `https://advertising.amazon.pl/` |
| rag_170 | 日本站new广告活动管理 | `https://advertising-japan.amazon.com/` |
| rag_171 | 澳大利亚站广告活动管理 | `https://advertising.amazon.com.au/` |
| rag_172 | 墨西哥站广告活动管理 | `https://advertising.amazon.com.mx/` |
| rag_173 | 美国站广告活动管理 | `https://advertising.amazon.com/` |
| rag_174 | 加拿大广告活动管理 | `https://advertising.amazon.ca/` |
| rag_175 | 日本站广告活动管理 | `https://advertising.amazon.co.jp/` |
| rag_176 | 创建coupon | `https://*.amazon.*/coupons/create-coupon` |
| rag_177 | 创建PercentageOff | `https://*.amazon.*/promotions/new/preview` |
| rag_178 | 优惠券 | `https://*.amazon.*/coupons/ref=xx_scoupn_dnav_xx` |
| rag_179 | 促销 | `https://*.amazon.*/promotions` |
| rag_180 | 促销2 | `https://*.amazon.*/promotions/new` |
| rag_181 | 广告活动查看1 | `https://*.amazon.*/campaign-manager` |
| rag_182 | 广告活动查看2 | `https://*.amazon.*/cm/targeting` |
| rag_183 | 广告组页面 | `https://*.amazon.*/cm/*/campaigns` |
| rag_184 | Vine | `https://*.amazon.*/vine` |
| rag_187 | 广告活动主页面 | `https://advertising.amazon.*/` |
| rag_188 | 登录 | `https://*.amazon.*/ap/signin` |
| rag_189 | 注册 | `https://*.amazon.*/ap/register` |
| rag_191 | 登录验证 | `https://*.amazon.*/ap/mfa` |
| rag_192 | 亚马逊-美国站首页 | `https://sellercentral.amazon.com/home` |
| rag_193 | 亚马逊-日本站首页 | `https://sellercentral-japan.amazon.com/home` |
| rag_194 | 验证 | `https://*.amazon.*/ap/sso` |
| rag_195 | 新的亚马逊销售体验 | `https://*.amazon.*/amazonsell/business` |
| rag_196 | 账户信息2 | `https://*.amazon.*/gp/seller/configuration/account-info-page.html` |
| rag_197 | 店铺首页-新版界面 | `https://*.amazon.*/amazonsell/business` |
| rag_198 | 假期设置页面 | `https://*.amazon.*/hz/account-info/vacation-settings` |
| rag_199 | 管理服务页面 | `https://*.amazon.*/account-information/mys` |
| rag_200 | 管理存款方式 | `https://*.amazon.*/sw/AccountInfo/ManageDepositMethods/step/ManageDepositMethods` |
| rag_201 | 付费方式 | `https://*.amazon.*/gp/on-board/configuration/single-section/global-billing.html` |
| rag_202 | 替换存款方式 | `https://*.amazon.*/sw/AccountInfo/DepositMethod/step/DepositMethod` |
| rag_203 | 账户付费方式 | `https://*.amazon.*/sw/AccountInfo/Charge` |
| rag_204 | 收费方式更新 | `https://*.amazon.*/sw/AccountInfo/ChargeMethod/step/Update` |
| rag_206 | 税务设置 | `https://*.amazon.*/tax/nexus/settings` |
| rag_207 | 付款方式 | `https://*.amazon.*/gp/on-board/configuration/single-section` |
| rag_208 | 管理付款方式 | `https://*.amazon.*/sw/AccountInfo/ChargeMethod` |
| rag_209 | 帮助中心首页 | `https://*.amazon.*/help/center` |
| rag_210 | cases管理 | `https://*.amazon.*/cu/case-lobby` |
| rag_211 | 帮助中心页面 | `https://*.amazon.*/help/hub` |
| rag_216 | 广告发票历史记录 | `https://*.amazon.*/gp/advertiser/transactions/transactions.html` |
| rag_218 | 广告账单历史 | `https://*.amazon.*/billing/history` |
| rag_219 | 亚马逊前台 | `https://www.amazon.*/` |
