# 变更提案: competitor-pricing-advice

## 元信息
```yaml
类型: 新功能
方案类型: implementation
优先级: P1
状态: 已确认
创建: 2026-04-14
```

---

## 1. 需求

### 背景
当前插件已经可以抓取竞对酒店详情页下的房型价，也已有商家改价和 LLM 定价基础能力，但缺少一条独立的“竞对建议价”分析链路。用户希望在抓到竞对酒店数据后，手工输入当前库存，并结合数据库中的历史价格，通过通义 API 生成一个可解释的建议价格。

### 目标
- 新增独立的插件竞对建议价入口，不与现有商家改价工作流混用。
- 后端接收插件抓到的竞对房型价结果和手工库存输入。
- 后端结合数据库历史价格与通义 API，生成建议价、调价幅度、竞对对比和理由。
- 插件展示分析结果，但本轮不自动提交 OTA。

### 约束条件
```yaml
时间约束: 本轮优先落地可用闭环，避免重做现有定价引擎
性能约束: 接口优先复用现有定价引擎，通义失败时必须规则回退
兼容性约束: 不破坏现有 competitor workflow 和 merchant pricing 入口
业务约束: 库存由插件手工输入；历史价格必须从数据库读取；本轮只做预览分析
```

### 验收标准
- [ ] Popup 中可以在抓取竞对房型价后，输入总房量、可售房量、当前售价并触发“生成建议价”。
- [ ] 后端新增独立插件接口，接收竞对抓价结果和库存快照，返回建议价、调价幅度、竞对对比和理由。
- [ ] 接口优先走通义配置，失败时回退规则定价，仍能返回结果。
- [ ] 分析结果会结合数据库历史价格快照做平滑修正。
- [ ] 现有竞对工作流、抓取配置房型价和目标价直改功能不回归。

---

## 2. 方案

### 技术方案
新增独立的 `competitor_pricing_advice_service` 作为插件竞对建议价分析服务。插件在完成竞对房型价抓取后，将房型价结果和手工库存快照通过新的 plugin API 发送给后端。后端把抓价结果归一为竞对价格上下文，读取店铺历史价格快照，复用现有 `pricing_service` 的通义/规则回退能力生成建议价摘要，再将结果返回给插件展示。

### 影响范围
```yaml
涉及模块:
  - browser_extension: 新增独立竞对建议价入口、库存输入、结果展示和消息类型
  - plugin_api: 新增竞对建议价预览接口
  - pricing: 复用并扩展现有定价引擎以支持直接消费插件抓价结果
  - merchant_history: 复用历史价格快照作为建议价平滑输入
预计变更文件: 8-10
```

### 风险评估
| 风险 | 等级 | 应对 |
|------|------|------|
| 新接口与现有 competitor workflow 语义混淆 | 中 | 保持独立路由、独立消息类型和独立 UI 区块 |
| 插件抓回的房型价结构不稳定 | 中 | 在 schema/service 中统一做归一化和价格过滤 |
| 通义不可用或超时 | 中 | 复用现有规则回退逻辑，保证始终返回可用建议 |
| 历史价格缺失导致建议失真 | 低 | 无历史价时降级为纯竞对+库存建议，并在结果中明确来源 |

---

## 3. 技术设计

### 架构设计
```mermaid
flowchart TD
    A[Popup 抓取竞对房型价] --> B[Popup 手工输入库存]
    B --> C[background 新消息代理]
    C --> D[/plugin/pricing/competitor-advice-preview]
    D --> E[competitor_pricing_advice_service]
    E --> F[pricing_service]
    E --> G[merchant_price_history_service]
    F --> H[通义 / 规则回退]
    H --> I[建议价摘要返回插件]
```

### API设计
#### POST /plugin/pricing/competitor-advice-preview
- **请求**: `shop_id + inventory_snapshot + competitor_hotels + strategy/目标参数`
- **响应**: `advice_summary + competitor_context + merchant_history_context + price_recommendation`

### 数据模型
| 字段 | 类型 | 说明 |
|------|------|------|
| competitor_hotels | list | 插件抓到的竞对酒店及房型价结果 |
| inventory_snapshot | object | 插件手工输入的整店库存快照 |
| advice_summary | object | 展示用摘要，包含建议价/幅度/对比/理由 |

---

## 4. 核心场景

### 场景: 抓价后生成独立竞对建议价
**模块**: browser_extension / plugin_api / pricing
**条件**: 用户已登录插件并完成竞对酒店房型价抓取
**行为**: 用户输入总房量、可售房量、当前售价后点击生成建议价
**结果**: 插件显示建议价、调价幅度、竞对对比和理由，且不自动提交 OTA

---

## 5. 技术决策

### competitor-pricing-advice#D001: 独立建议价接口直接消费插件抓价结果
**日期**: 2026-04-14
**状态**: ✅采纳
**背景**: 用户明确要求该能力独立于现有商家改价工作流存在。
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 复用现有 competitor workflow 入口 | 改动小 | 语义耦合，UI 和结果都偏房型改价工作流 |
| B: 新建独立建议价接口 | 语义清晰，便于后续扩展 | 需要新增 schema、service 和插件入口 |
**决策**: 选择方案 B
**理由**: 满足用户“独立入口、独立分析、不自动提交”的要求，同时仍可复用底层定价引擎。
**影响**: plugin_routes、pricing schema/service、popup/background
