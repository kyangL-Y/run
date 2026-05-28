# 变更提案: browser-extension-pluginization

## 元信息
```yaml
类型: 重构/优化
方案类型: implementation
优先级: P1
状态: 已确认
创建: 2026-04-03
```

---

## 1. 需求

### 背景
当前项目已经具备浏览器插件最小闭环，但插件代码仍停留在 PoC 形态。页面识别、浮层 UI、动作执行、消息转发都混在 `browser-extension/content.js` 与 `browser-extension/background.js` 中，导致插件难以继续扩展，也不利于把现有“能跑通的核心功能”稳定迁移为浏览器插件主入口。

### 目标
- 将当前已跑通的核心链路整理为适合浏览器插件的结构。
- 保留并强化现有核心能力：页面识别、服务状态检查、竞对价格读取、按当前页采集。
- 让 `popup`、页面浮层、设置页、后台代理各自职责清晰，避免单文件继续膨胀。
- 保持现有后端主程序与插件接口可运行，不破坏已经通过的链路。

### 约束条件
```yaml
时间约束: 本轮优先完成核心链路插件化，不扩展到所有 SSR 运营页面能力
性能约束: 插件注入脚本需保持轻量，避免在飞猪页面执行重型逻辑或大范围 DOM 扫描回归
兼容性约束: 保持 Manifest V3、Edge/Chrome 可加载、现有启动脚本可继续使用
业务约束: 不改变当前“只接管当前已登录页、不自动登录、不新开浏览器”的主链路原则
```

### 验收标准
- [ ] 插件内可完成“识别当前页 -> 查看配置/服务状态 -> 读取最新竞对价格 -> 按当前页采集”的完整闭环。
- [ ] `popup` 成为插件总入口，不再只是简单状态页。
- [ ] 页面浮层保留就地操作能力，但 UI 渲染、页面识别、API 调用不再耦合在单个大文件中。
- [ ] 现有后端插件接口保持可用，现有插件相关测试通过，并按需要补充回归测试。

---

## 2. 方案

### 技术方案
采用“保守重构型插件化”方案：

- 保留当前 `manifest + background + content + popup + options` 总体形态，不推翻已跑通链路。
- 在 `browser-extension/` 下按职责拆分模块，将页面识别、消息调用、结果格式化、浮层渲染从单文件中抽离。
- 将 `popup` 升级为全局入口，负责展示服务状态、基础配置摘要、当前活动页识别摘要和快捷操作入口。
- 将页面浮层保留为飞猪页内就地操作层，负责上下文展示、执行当前页采集和查看最近结果摘要。
- `background` 统一作为配置中心与本地 Flask API 代理层，集中管理存储、请求封装、消息协议和错误处理。
- 后端优先复用现有 `/plugin/service-status`、`/plugin/competitor/latest-prices`、`/plugin/fliggy/collect` 三个接口，只在插件实现确有缺口时做最小增补。

### 影响范围
```yaml
涉及模块:
  - browser-extension/manifest.json: 保持入口定义，按拆分后的文件结构校准资源引用
  - browser-extension/background.js: 拆分配置和 API 代理职责，保留消息总线入口
  - browser-extension/content.js: 收敛为注入入口和装配层，不再承载全部实现细节
  - browser-extension/popup.html: 升级为插件总入口 UI
  - browser-extension/popup.js: 增加当前页摘要和核心动作入口
  - browser-extension/options.html: 保持配置页定位，必要时微调字段说明
  - browser-extension/options.js: 继续服务配置保存与连通性校验
  - backend/app/api/plugin_routes.py: 仅在插件展示缺口明确时做最小适配
  - backend/tests/test_browser_extension_assets.py: 同步插件资源与结构断言
  - backend/tests/test_plugin_api_routes.py: 保持插件接口回归
预计变更文件: 8-12
```

### 风险评估
| 风险 | 等级 | 应对 |
|------|------|------|
| 内容脚本拆分后注入失败或资源未加载 | 中 | 保持 `content.js` 为稳定入口，只把实现细节下沉到新模块 |
| Popup 与页面浮层动作重复导致协议混乱 | 中 | 统一消息类型和 API client，避免两套请求拼装 |
| 飞猪页面 DOM 波动导致识别结果退化 | 中 | 保留现有识别逻辑为基线，先做结构重组，再做局部增强 |
| 后端接口字段不足以支撑插件展示 | 低 | 优先做前端结果整形；只有缺口明确时才扩接口 |

---

## 3. 技术设计（可选）

> 涉及架构变更、API设计、数据模型变更时填写

### 架构设计
```mermaid
flowchart TD
    A[Popup 总入口] --> B[Background 消息总线]
    C[飞猪页面浮层] --> B
    B --> D[Chrome Storage]
    B --> E[Flask 插件接口]
    C --> F[页面上下文识别]
    E --> G[/plugin/service-status]
    E --> H[/plugin/competitor/latest-prices]
    E --> I[/plugin/fliggy/collect]
```

### API设计
#### GET /plugin/service-status
- **请求**: Header 携带租户信息可选；当前实现对插件公共可读
- **响应**: `{status, plugin, login_url, mcp_enabled}`

#### GET /plugin/competitor/latest-prices
- **请求**: Header `X-Tenant-Id`、`X-Shop-Id`，Query `limit`
- **响应**: 最新竞对酒店价格列表及统计摘要

#### POST /plugin/fliggy/collect
- **请求**: `{shop_id, start_url, max_pages, max_hotels, target_hotel_names, target_page_url_keyword, save_result, collect_mode, debug_url}`
- **响应**: 当前页接管采集结果、过滤统计、保存结果统计

#### 插件内部消息协议
- **请求**: `GET_CONFIG | SAVE_CONFIG | SERVICE_STATUS | LATEST_PRICES | RUN_COLLECT | OPEN_OPTIONS`
- **响应**: `{ok, data}` 或 `{ok: false, error}`

### 数据模型
| 字段 | 类型 | 说明 |
|------|------|------|
| pageContext | object | 当前飞猪页识别结果，包含 URL、页面类型、城市、日期、候选酒店等 |
| extensionConfig | object | 插件本地配置，包含 baseUrl、tenantId、shopId、debugUrl、startUrl 等 |
| actionResult | object | 服务状态、价格读取或采集动作的标准化展示结果 |

---

## 4. 核心场景

> 执行完成后同步到对应模块文档

### 场景: 从 Popup 进入插件工作流
**模块**: browser-extension/popup.*
**条件**: 插件已加载，后端服务已启动
**行为**: 用户点击扩展图标，在 popup 中查看服务状态、当前配置、当前活动页摘要，并可直接进入采集/价格读取/设置动作
**结果**: Popup 成为可操作的插件总入口，而不是单纯状态展示

### 场景: 在飞猪页面内执行当前页采集
**模块**: browser-extension/content.* + background.*
**条件**: 用户正在飞猪或淘宝相关页，插件已注入浮层
**行为**: 插件识别当前页上下文，用户在页面浮层中直接触发“按当前页采集”
**结果**: 请求使用当前页 URL、候选酒店和 URL 关键字组成采集参数，并返回可读的摘要结果

### 场景: 查看最新竞对价格
**模块**: popup.* / content.* / background.*
**条件**: 本地服务在线，数据库已有采集结果
**行为**: 用户从 popup 或页面浮层触发“读取竞对价格”
**结果**: 插件展示最近采集时间、数量和酒店价格摘要，不要求跳回 SSR 页面

### 场景: 修改插件连接设置
**模块**: browser-extension/options.*
**条件**: 用户需要调整店铺、调试端口或后端地址
**行为**: 用户打开设置页保存配置并测试连接
**结果**: 后续 popup 与页面浮层共享同一份配置并立即生效

---

## 5. 技术决策

> 本方案涉及的技术决策，归档后成为决策的唯一完整记录

### browser-extension-pluginization#D001: 保留现有插件骨架并做职责拆分
**日期**: 2026-04-03
**状态**: ✅采纳
**背景**: 当前插件链路已跑通，风险主要来自职责耦合，而不是插件形态错误
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 保留骨架并拆分模块 | 风险低，可快速落地，复用现有接口与启动链路 | 体系仍建立在现有扩展骨架上 |
| B: 重做为全新插件工作台 | 结构更完整，后续扩展空间更大 | 改动面更大，交付更慢，回归风险更高 |
**决策**: 选择方案 A
**理由**: 当前目标是尽快把“能跑通的程序”整理成稳定可用的浏览器插件，而不是重建系统
**影响**: 主要影响 `browser-extension/` 内部结构与少量测试文件

### browser-extension-pluginization#D002: Popup 作为总入口，页面浮层作为就地操作层
**日期**: 2026-04-03
**状态**: ✅采纳
**背景**: 当前 popup 过弱，content 浮层过重，导致插件入口体验失衡
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: Popup 总入口 + 页面浮层操作层 | 符合浏览器插件习惯，用途边界清晰 | 需要同步两处 UI 的动作协议 |
| B: 所有能力都塞进页面浮层 | 页面内操作自然 | 对非目标页支持弱，插件图标几乎失去意义 |
**决策**: 选择方案 A
**理由**: 既保留飞猪页面内的就地体验，也让插件图标点击后有明确价值
**影响**: 影响 `popup.*`、`content.*`、`background.js`

### browser-extension-pluginization#D003: 后端接口优先复用，新增接口只做最小增补
**日期**: 2026-04-03
**状态**: ✅采纳
**背景**: 当前后端接口已经验证可跑通，过早重构后端会扩大风险面
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 先复用现有 3 个插件接口 | 改动小，验证快 | 前端需要自己做一部分结果整形 |
| B: 先扩一整套插件专用接口 | 展示层更完整 | 后端改动面过大，不符合本轮目标 |
**决策**: 选择方案 A
**理由**: 本轮要先把插件做稳，再决定是否继续平台化接口
**影响**: 后端以兼容为先，只有明确缺口时才做补充
