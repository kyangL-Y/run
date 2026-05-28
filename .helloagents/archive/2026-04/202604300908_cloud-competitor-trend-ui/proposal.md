# 变更提案: cloud-competitor-trend-ui

## 元信息
```yaml
类型: 优化
方案类型: implementation
优先级: P1
状态: 已设计
创建: 2026-04-30
```

---

## 1. 需求

### 背景
云端竞对采集已经可以每 2 小时写入 `hotel_room_prices`，后端趋势接口也能返回折线图数据。但插件当前展示仍混用了本地浏览器 alarm 状态和云端采集结果，导致用户看到的采集时间不一致；`主流房型最低价` 折线图虽然后端已按 `category_name + hotel_name` 拆线，但前端最多只画 4 条线，且文案不够明确；房型明细行也没有直接标注所属竞对酒店。

### 目标
- `主流房型最低价` 折线图明确按 `主流房型 + 竞对酒店` 区分曲线。
- 房型明细每一行直接显示所属竞对酒店名称。
- 趋势卡片优先展示云端数据库的最新采集时间，并把本地 alarm 描述改成插件提醒检查状态，避免误解为云端调度时间。
- 插件提醒改为定时拉取云端趋势数据，发现云端最新采集批次或价格变化后触发通知，不再依赖本地打开飞猪页面抓取。

### 约束条件
```yaml
时间约束: 当前迭代内完成，用户随后需要重新部署云端和重新加载扩展。
性能约束: 插件弹窗内折线图保持轻量 SVG，不引入新依赖。
兼容性约束: 保持 Manifest V3；不改变现有后端鉴权 header；不破坏 hotel_min_price 维度。
业务约束: 云端 Celery 仍是实际采集来源；插件只做展示、查询和提醒。
```

### 验收标准
- [ ] 选择 `主流房型最低价` 时，图例与标签显示 `房型 · 酒店`，多家酒店可见且不再被 4 条线硬截断。
- [ ] 抓取后的竞对房型明细行显示 `竞对酒店: xxx`。
- [ ] 趋势卡片的最新采集时间来自后端 `latest_collected_at`，本地 schedule 文案不再被描述成云端采集状态。
- [ ] 插件 alarm 调用趋势接口读取云端数据，基于云端数据变化触发通知。
- [ ] 相关后端服务测试和扩展资产测试通过。

---

## 2. 方案

### 技术方案
采用前端为主、后端最小变更的方案。后端 `get_room_price_trend_summary` 已在 `room_category` 维度返回 `category_name` 与 `hotel_name`，无需重构聚合逻辑。前端调整 `popup.js` 的折线图可视化数量、图例文案、房型行参数传递和 schedule 文案。`background.js` 的 alarm 执行路径改为查询 `/plugin/competitor/room-price-trends`，将趋势数据转换为快照后与上次快照比较并通知。

### 影响范围
```yaml
涉及模块:
  - apps/frontend/extension/popup.js: 折线图、房型行、云端采集时间展示。
  - apps/frontend/extension/background.js: 插件提醒检查逻辑，从本地抓取切换为云端趋势查询。
  - apps/backend/tests/test_browser_extension_assets.py: 增加静态资产断言，覆盖关键新行为。
  - 可能涉及 apps/backend/tests/test_competitor_service.py: 若后端返回字段需补充断言。
预计变更文件: 2-4
```

### 风险评估
| 风险 | 等级 | 应对 |
|------|------|------|
| 折线过多导致弹窗拥挤 | 中 | 限制展示数量但提高到可区分常见酒店/房型，并显示完整标签列表。 |
| 云端趋势通知没有基线时误报 | 中 | 第一次只保存快照，不弹变化通知；后续有变化才通知。 |
| 本地 alarm 状态和云端采集状态概念混淆 | 中 | 文案改为“插件提醒检查”，云端最新采集单独展示。 |
| 旧配置中已有本地 alarm 状态 | 低 | 兼容旧字段，继续读取但改名展示。 |

---

## 3. 技术设计

### 前端趋势展示
- `buildCompetitorTrendSvg(series)` 将可视曲线数量从 4 调整到更适合弹窗的上限。
- `getTrendSeriesTitle()` 保持 `category_name + hotel_name` 优先级，并在 `room_category` 维度文案中明确“主流房型 + 酒店”。
- `renderCompetitorTrendPanel()` 将云端 `latest_collected_at` 作为主时间，schedule 文案仅说明插件提醒检查。

### 房型明细
- `renderCompetitorHotelCard()` 调用 `renderCompetitorRoomRow(room, idx, hotelName)`。
- `renderCompetitorRoomRow()` 增加 `竞对酒店: {hotelName}` meta。

### 云端趋势提醒
- `runScheduledCompetitorTrendRefresh()` 不再调用 `crawlCompetitorRoomPricesViaTabs()`。
- 新增或复用趋势查询函数获取 `hotel_min_price` 或 `room_category` 趋势。
- 将趋势 series 最新点转换为 snapshot，用现有 `buildCompetitorPriceChangeSummary()` 与上次快照比较。
- `lastRunAt` 表示插件检查时间，`lastCloudCollectedAt` 表示云端最新采集时间。

---

## 4. 核心场景

### 场景: 主流房型最低价区分竞对酒店
**模块**: browser extension popup
**条件**: 后端返回 `room_category` 趋势，series 中包含 `category_name` 和 `hotel_name`。
**行为**: 用户选择 `主流房型最低价` 并点击刷新。
**结果**: 折线图和图例展示 `商务房 · 酒店A`、`商务房 · 酒店B` 等曲线。

### 场景: 云端采集后插件提醒
**模块**: browser extension background
**条件**: 插件已登录并开启提醒检查，云端趋势接口有新采集点。
**行为**: Chrome alarm 触发，插件拉取云端趋势接口。
**结果**: 首次建立基线；后续价格变化时弹出通知。

---

## 5. 技术决策

### cloud-competitor-trend-ui#D001: 保持云端采集为唯一采集来源
**日期**: 2026-04-30
**状态**: 采纳
**背景**: 用户已经选择云端统一采集，多电脑插件只负责展示和提醒。如果继续让插件 alarm 打开页面抓取，会造成多电脑重复采集、时间不一致和账号依赖。
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 插件继续本地定时抓取 | 可以直接弹通知 | 多电脑重复抓取，和云端数据不一致 |
| B: 插件定时拉云端趋势数据 | 与云端采集保持一致，部署模型清晰 | 通知不是实时推送，取决于插件打开和 alarm |
**决策**: 选择方案 B。
**理由**: 当前系统的事实数据源是云端 `hotel_room_prices`，插件展示和提醒应围绕该数据源，避免本地浏览器状态污染业务判断。
**影响**: 修改 `background.js` 的 alarm 行为和 `popup.js` 的文案。
