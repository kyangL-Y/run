# 变更提案: manual-room-mapping-advice

## 元信息
```yaml
类型: 新功能
方案类型: implementation
优先级: P1
状态: 已确认
创建: 2026-04-15
```

---

## 1. 需求

### 背景
当前竞对建议价链路默认依赖本店房型价格快照，再通过模糊匹配把竞对房型价映射到本店房型。这与当前使用方式不一致：你希望直接在插件设置页长期维护自己的房型名称和对应的竞对房型，不需要额外爬取本店房型映射，也希望结果里直接出现“高级大床房”这类真实业务名称。

### 目标
- 在插件设置页新增长期维护的“我的房型 -> 竞对房型”配置能力。
- 支持你手工录入自己的房型名称、房型类型、当前价和竞对房型匹配词。
- 生成建议价时优先使用手工房型配置，不再强依赖本店房型价格快照。
- 建议结果直接按你的房型名称输出，并保留现有竞对房型抓价流程。

### 约束条件
```yaml
时间约束: 本轮优先落地可用闭环，不新增完整的服务端配置管理后台
性能约束: 保持当前建议价接口响应模式，LLM 超时仍需规则回退
兼容性约束: 不破坏现有 competitor workflow、merchant pricing、竞对酒店配置和抓价流程
业务约束: 我的房型映射长期保存在插件设置中，并按 shop 维度隔离；未配置手工房型时保留旧的快照兜底路径
```

### 验收标准
- [ ] 设置页可以长期维护多条“我的房型 -> 竞对房型”映射，至少包含房型名称、房型类型、当前价和竞对房型匹配词。
- [ ] 竞对建议价预览在存在手工房型配置时，不再依赖本店房型价格快照，也能返回房型级建议价。
- [ ] 返回结果直接显示手工配置的房型名称，例如“高级大床房”。
- [ ] 每条房型建议优先基于映射指定的竞对房型样本生成，只有映射未命中时才退回模糊匹配或市场样本。
- [ ] 未配置手工房型时，现有建议价与商家改价相关能力不回归。

---

## 2. 方案

### 技术方案
采用插件侧持久化方案。设置页新增“我的房型映射”配置区，配置按当前 shop 维度保存在扩展存储中。竞对建议价请求由 background 自动附带当前店铺的手工房型配置，后端在 `CompetitorPricingAdviceRequest` 中新增 `manual_room_mappings` 字段。`competitor_pricing_advice_service` 优先把这些手工房型转换为 `merchant_rooms`，并在匹配竞对房型时优先使用手工配置中的竞对房型名称/关键字进行过滤；若没有手工配置，则回落到现有本店快照逻辑。展示层继续复用现有 `display_name` 优先策略，因此返回值中的 `display_name` 直接使用手工房型名称即可。

### 影响范围
```yaml
涉及模块:
  - browser_extension_config: 扩展存储结构新增 shop 级 manual room mappings
  - browser_extension_options: 设置页新增“我的房型映射”编辑器
  - browser_extension_advice_flow: Popup/内容面板建议价请求改为自动携带手工房型配置，并调整校验逻辑
  - plugin_api: schema 与 plugin 路由接收 manual_room_mappings
  - competitor_pricing_advice: 手工房型归一化、显式匹配优先、快照兜底
预计变更文件: 9-12
```

### 风险评估
| 风险 | 等级 | 应对 |
|------|------|------|
| 插件存储结构新增 shop 级配置后，旧配置读取混乱 | 中 | 在 background 中统一做 normalize，并提供当前 shop 的读写入口 |
| 手工配置与竞对抓价结果命名不一致导致匹配为空 | 中 | 优先按显式匹配词过滤，未命中时退回现有模糊匹配与 market fallback |
| Popup/内容面板仍强制校验单一 currentPrice，阻塞新流程 | 中 | 改为“存在手工房型配置时跳过单价必填”，保留旧模式兼容 |
| 长期把当前价放在设置中可能过时 | 低 | 首轮先以“长期维护 + 手动更新”为准，后续可扩展临时覆盖输入 |

---

## 3. 技术设计

### 架构设计
```mermaid
flowchart TD
    A[设置页维护我的房型映射] --> B[background 存储 shop 级 manualRoomMappings]
    C[抓取竞对酒店房型价] --> D[Popup/内容面板触发建议价]
    B --> D
    D --> E[background 构造 competitor advice payload]
    E --> F[/plugin/pricing/competitor-advice-preview]
    F --> G[competitor_pricing_advice_service]
    G --> H[manual room normalize]
    G --> I[显式竞对房型匹配 -> 模糊匹配 -> market fallback]
    I --> J[LLM / 规则回退]
    J --> K[返回 room_recommendations(display_name=我的房型名)]
```

### API设计
#### POST /plugin/pricing/competitor-advice-preview
- **请求**: `shop_id + inventory_snapshot + competitor_hotels + competitor_hotel_name + strategy + manual_room_mappings?`
- **响应**: `advice_summary + room_recommendations + merchant_room_snapshot + recommendation_source`

### 数据模型
| 字段 | 类型 | 说明 |
|------|------|------|
| manual_room_mappings | list | 手工维护的我的房型配置列表 |
| manual_room_mappings[].display_name | string | 你的房型展示名，如“高级大床房” |
| manual_room_mappings[].room_type | string | 房型类型，如“大床房/双床房” |
| manual_room_mappings[].current_price | number | 当前房型售价，用于生成建议价 |
| manual_room_mappings[].rate_name | string | 可选价型名，默认可回退为“标准价” |
| manual_room_mappings[].competitor_room_names | list[string] | 显式绑定的竞对房型名/关键字 |
| manual_room_mappings[].enabled | bool | 是否参与建议价计算 |

---

## 4. 核心场景

### 场景: 通过手工房型映射生成建议价
**模块**: browser_extension_options / background / competitor_pricing_advice
**条件**: 用户已登录插件、已配置竞对酒店并完成竞对房型价抓取，且在设置页维护了至少一条手工房型映射
**行为**: 用户在建议价入口点击“生成建议价”，插件自动带上手工房型映射与库存快照请求后端
**结果**: 返回按“高级大床房”等手工房型名组织的房型建议价，并标出各房型对应的竞对价格区间和理由

### 场景: 未配置手工房型时保持旧链路
**模块**: background / competitor_pricing_advice
**条件**: 当前店铺没有手工房型映射
**行为**: 用户仍按原流程生成建议价
**结果**: 服务退回现有本店房型快照逻辑，不影响旧功能使用

---

## 5. 技术决策

### manual-room-mapping-advice#D001: 手工房型映射先保存在插件设置而不是新建服务端配置表
**日期**: 2026-04-15
**状态**: ✅采纳
**背景**: 用户明确要求先能在设置中长期维护自己的房型并立即参与建议价，而不是先做完整后台配置系统。
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 保存在插件设置并随请求透传 | 落地快，改动集中，最贴近当前使用方式 | 配置默认绑定当前浏览器环境 |
| B: 新建服务端表和 CRUD 接口 | 跨设备一致，店铺级治理更完整 | 改动面更大，本轮实现成本高 |
**决策**: 选择方案 A
**理由**: 先用最短路径打通“长期维护 + 手工命名 + 建议价生成”的业务闭环，同时保留后续升级到服务端持久化的空间。
**影响**: background 配置模型、options 设置页、plugin pricing schema、competitor_pricing_advice_service

### manual-room-mapping-advice#D002: 建议价服务采用“显式映射优先，模糊匹配兜底”
**日期**: 2026-04-15
**状态**: ✅采纳
**背景**: 纯模糊匹配无法稳定命中“高级大床房”等业务命名，完全依赖显式映射又会在配置不全时造成空结果。
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 只按显式映射匹配 | 可控性最高 | 配置稍有缺漏就无结果 |
| B: 显式映射优先，未命中再走现有模糊匹配 | 兼顾可控性和可用性 | 服务逻辑会更复杂 |
**决策**: 选择方案 B
**理由**: 满足你对“针对我的房型生成价格”的要求，同时避免配置不完整时建议价链路直接失效。
**影响**: competitor_pricing_advice_service 的归一化、匹配和理由生成逻辑