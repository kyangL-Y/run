# 变更提案: shop1-real-price-workflow

## 元信息
```yaml
类型: 运营实施
方案类型: implementation
优先级: P0
状态: 已确认
创建: 2026-03-17
```

---

## 1. 需求

### 背景
当前项目代码已经具备商家后台抓价、AI 调价预览、人工确认提交和飞猪渠道推价链路，但 `shop_id=1` 的真实业务配置并未补齐。已确认的阻塞项包括：

- 门店未开启真实渠道推价开关
- 门店未配置可用的飞猪凭据、商家会话、登录页和价格页地址
- 门店没有商家价格项到 `gid/hid` 的映射
- 数据库中没有该门店的房态基线价格快照

因此，本次任务的核心不是改代码，而是按现有项目设计补齐 `shop_id=1` 的真实运行条件，并在 `±10%` 风险边界内完成一次真实的“抓价 -> 预览 -> 提交 -> 核验”闭环。

### 目标
- 在不修改现有业务逻辑的前提下，补齐 `shop_id=1` 的真实商家抓价与渠道推价配置
- 真实获取当前商家价格，并建立可提交的价格项映射
- 基于现有 AI/规则链路生成自动调价建议，并把单次调价幅度限制在当前价的 `±10%`
- 在人工确认后执行真实飞猪改价，并验证提交结果、审计记录和本地状态

### 约束条件
```yaml
时间约束: 先完成单门店 shop_id=1 的一次真实闭环，不扩展到多店
性能约束: 商家后台抓价允许秒级延迟，但不得长时间阻塞本地服务
兼容性约束: 必须复用现有 Flask + MySQL + Playwright + Streamlit 能力，不新增架构层
业务约束: 真实调价仅允许在当前价 ±10% 内执行；必须保留人工确认；不得泄露凭据明文
```

### 验收标准
- [ ] `shop_id=1` 具备可用的商家登录地址、价格页地址、storage state、selectors 和飞猪推价配置
- [ ] 能真实抓取至少一组有效商家价格项，而不是只返回空结果或未登录页
- [ ] 至少建立一组有效的 `room/rate -> gid/hid` 映射，并完成价格预览
- [ ] 正式提交的最终价格相对当前价变动不超过 `±10%`
- [ ] 真实改价后产生可验证的提交结果和审计记录，失败原因可追踪

---

## 2. 方案

### 技术方案
采用“配置补齐 + 真实链路执行”的最小实施方案，不新增功能，不改变主流程。

执行顺序如下：

1. 启动并复验现有后端服务，确保本地控制面可用。
2. 读取 `shop_id=1` 当前门店配置，补齐以下真实运行项：
   - `fliggy_price_push_enabled`
   - 商家登录 URL / 价格 URL
   - Playwright storage state
   - 商家页面 selectors
   - 飞猪推价模板与必要业务键
3. 通过商家后台真实抓价接口获取价格列表。
4. 为可执行价格项建立 `gid/hid` 映射，并回填必要的房型信息。
5. 执行价格预览，校验建议价、风险等级和最终价。
6. 在提交前强制做 `±10%` 限幅检查；超过边界则中止，不执行真实推价。
7. 对通过校验的价格项走人工确认提交链路，触发真实渠道推价。
8. 对提交结果做核验，检查审计记录、返回状态和最新价格快照。

如果在以上过程中暴露出“配置已齐但代码路径仍阻塞”的问题，再进入最小代码修复分支。

### 影响范围
```yaml
涉及模块:
  - backend/app/api/routes.py: 复用现有 merchant/fliggy 与 pricing 接口，不新增路由
  - backend/app/services/merchant_pricing_service.py: 复用预览与正式提交链路
  - backend/app/services/action_executor.py: 复用真实调价执行与渠道推送
  - backend/app/services/fliggy_client.py: 复用模板渲染与真实飞猪提交
  - backend/app/services/shop_service.py: 读取并更新门店级配置
  - backend/streamlit_app.py: 如需要，通过现有页面辅助补配置和人工确认
  - backend/.env / 数据库 shops 相关配置: 补齐真实运行所需参数
预计变更文件: 2-5（仅在发现阻塞点时）
```

### 风险评估
| 风险 | 等级 | 应对 |
|------|------|------|
| 商家后台登录态失效或需要验证码，导致抓价失败 | 高 | 先走人工辅助登录获取最新 storage state，再继续自动抓价 |
| 门店缺少 `gid/hid` 映射，无法提交真实改价 | 高 | 先完成最小映射，只对已映射项执行 |
| 推价模板或飞猪凭据不完整，导致真实提交失败 | 高 | 提交前先校验推价配置完整性，不完整则停止 |
| 最终价超过 `±10%` 业务边界 | 高 | 在正式提交前做强制限幅校验，超界立即中止 |
| 抓价成功但本地无房态基线，难以核验结果 | 中 | 先写入基线快照，再执行预览和提交 |

---

## 3. 技术设计（可选）

> 本次以现有能力编排为主，不新增架构；保留关键执行链路用于实施阶段对照。

### 架构设计
```mermaid
flowchart TD
    A[Shop 1 Config] --> B[/merchant/fliggy/prices/preview]
    B --> C[merchant_pricing_service]
    C --> D[/pricing/merchant-preview]
    D --> E[人工确认]
    E --> F[/pricing/merchant-confirm]
    F --> G[action_executor]
    G --> H[FliggyClient.push_price]
    H --> I[审计与结果核验]
```

### API设计
#### POST /merchant/fliggy/prices/preview
- **请求**: `shop_id, price_url?, login_url?, storage_state_name?, selectors?, headless, auto_login`
- **响应**: `items[], mapping_summary, current_price, collected_at`

#### POST /pricing/merchant-preview
- **请求**: `shop_id, selected_items[]`
- **响应**: `items[]`，包含 `current_price, suggested_price, final_price, change_pct, risk_level`

#### POST /pricing/merchant-confirm
- **请求**: `shop_id, approver_user_id, confirmed_items[]`
- **响应**: `submitted_count, success_count, failed_count, items[]`

### 数据模型
| 字段 | 类型 | 说明 |
|------|------|------|
| shops.fliggy_price_push_enabled | bool | 门店是否允许真实渠道推价 |
| shops.fliggy_merchant_login_url | varchar | 商家后台登录地址 |
| shops.fliggy_merchant_price_url | varchar | 商家价格页地址 |
| shops.fliggy_merchant_storage_state | varchar | Playwright 会话文件名 |
| merchant_price_mappings.gid | varchar | 渠道推价业务键 |
| merchant_price_mappings.hid | varchar | 酒店业务键 |
| room_status_snapshots.current_price | numeric | 当前本地价格基线 |

---

## 4. 核心场景

> 执行完成后同步到对应模块文档

### 场景: 真实商家抓价
**模块**: `merchant/fliggy`
**条件**: `shop_id=1` 已具备登录地址、价格地址和有效 storage state
**行为**: 系统进入商家后台真实价格页并抓取可识别的房型价格列表
**结果**: 返回标准化价格项，可供映射和建议预览使用

### 场景: AI 调价预览
**模块**: `merchant_pricing_service`
**条件**: 至少有一个已抓取并可识别的价格项
**行为**: 系统基于当前价格、库存和规则计算建议价与最终价
**结果**: 返回可人工确认的调价清单

### 场景: 限幅后的真实改价提交
**模块**: `action_executor` + `FliggyClient`
**条件**: 已建立 `gid/hid` 映射，且最终价在当前价 `±10%` 范围内
**行为**: 系统创建改价动作，人工确认后调用真实飞猪渠道接口提交改价
**结果**: 产生提交结果与审计记录，并可用于后续核验

---

## 5. 技术决策

> 本方案涉及的技术决策，归档后成为决策的唯一完整记录

### shop1-real-price-workflow#D001: 优先补齐真实业务配置，不先改代码
**日期**: 2026-03-17
**状态**: ✅采纳
**背景**: 当前项目代码已具备真实抓价、预览和提交主链路，阻塞集中在门店配置、会话与映射缺失。
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 先补配置再执行 | 风险小，变更少，贴合现有系统 | 需要人工补齐真实业务参数 |
| B: 先改代码再试 | 可能提前扩展能力 | 容易在未确认真实阻塞前过度开发 |
**决策**: 选择方案A
**理由**: 真实运行失败的主要原因已明确是配置缺失，不应在证据不足时先动代码。
**影响**: 开发实施阶段先执行配置补齐、抓价、映射和提交核验。

### shop1-real-price-workflow#D002: 正式提交前必须执行 ±10% 限幅校验
**日期**: 2026-03-17
**状态**: ✅采纳
**背景**: 用户明确要求真实调价允许执行，但单次涨跌幅限制在当前价的 `±10%` 内。
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 提交前强制限幅 | 风险可控，符合授权边界 | 可能中止部分本可执行的建议 |
| B: 仅记录不阻断 | 操作更快 | 可能超出授权边界，带来真实业务风险 |
**决策**: 选择方案A
**理由**: 真实价格写入属于高风险动作，必须把用户给定边界做成硬校验。
**影响**: 开发实施阶段在正式提交前增加人工复核与限幅判断。
