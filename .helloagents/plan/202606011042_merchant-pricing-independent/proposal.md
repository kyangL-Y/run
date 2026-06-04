# 方案包: merchant-pricing-independent

- 创建日期: 2026-06-01
- 类型: implementation
- 路由级别: R3 标准流程
- 选择方案: 三平台独立工作流

## 1. 需求

### 背景

插件当前分为“基础功能”和“商家改价”两大板块，但商家改价仍依赖基础功能中的竞对建议价流程：读取竞对价、生成 suggested_price、回填 final_price 后提交。用户希望两个板块真正独立，基础功能保持原实现，商家改价改为独立读取三个商家平台价格页、建立价格映射、用户选择映射后执行改价。

### 目标

- 基础功能保持原有实现方式和入口，不改动竞对抓价、趋势和“我的价格”建议主链路。
- 商家改价改成三平台统一工作流：飞猪、携程、美团价格页 URL -> 读取平台房型价 -> 自动生成映射候选 -> 用户选择映射并填写最终价 -> 按平台执行真实改价。
- 商家改价不再以 `COMPETITOR_WORKFLOW_PREVIEW` 作为主流程入口。
- 保留真实改价二次确认，只提交用户勾选的映射项。

### 约束条件

- 不新增后端重型业务层；当前后端源码不可完整编辑，优先改扩展侧。
- 不自动提交价格，不绕过用户确认。
- 平台读取失败时只标记该平台失败，不阻断其他平台展示。
- 复用现有 content script 的 DOM 读取和回填执行器。

### 验收标准

- Popup 商家改价区展示三平台 URL 输入和独立映射工作台。
- 点击读取后按三平台返回房型价格结果，并展示平台状态。
- 映射项可勾选、可选择基准价/目标平台、可编辑最终价。
- 提交时按平台分组调用现有本地页面提交链路。
- 基础功能区按钮和消息类型保持可用。
- `background.js`、`popup.js`、`content.js` 通过 JavaScript 语法检查。

## 2. 方案

### 技术方案

在扩展侧新增独立商家映射工作流：

- Popup 层新增 `merchantPlatformUrls`、`merchantPlatformSnapshots`、`merchantPriceMappings` 状态。
- 商家改价 UI 替换原“竞对驱动改价”为“三平台价格映射改价”。
- 新增 runtime 消息：
  - `MERCHANT_PLATFORM_PRICE_SNAPSHOTS`: 批量读取三平台价格页当前房型价。
  - `MERCHANT_PLATFORM_MAPPING_SUBMIT`: 按平台分组提交用户确认的映射项。
- `background.js` 复用 `collectLocalMerchantPriceItems()` 与 `submitCurrentMerchantPricing()`，新增批量编排函数。
- `popup.js` 本地生成映射候选：优先按 `gid/hid`，其次按房型名和价型名归一化相似匹配；默认以第一个有价格的平台作为基准项。

### 影响范围

- `apps/extension/popup.html`
- `apps/extension/popup.js`
- `apps/extension/background.js`
- `apps/extension/content.js`（仅必要字段兼容）
- `.helloagents/modules/browser_extension.md`
- `.helloagents/CHANGELOG.md`

### 风险评估

- EHRB: 涉及真实商家后台改价。处理方式是保留二次确认、只提交用户勾选项、按平台分组展示提交预览。
- 多平台 DOM 差异: 复用现有通用 DOM 读取器，读取失败时展示失败原因，不让失败平台阻断其他平台。
- 大文件修改风险: `popup.js`、`content.js`、`background.js` 均较大，实施时先搜索定位，按函数精确修改。

## 3. 技术决策

### merchant-pricing-independent#D001: 扩展侧优先，暂不新增后端服务

当前后端源码目录主要只有 `.pyc`，直接新增或修改后端商家映射服务风险高。本次以扩展侧状态和消息编排完成独立流程，保留未来后端持久化映射的扩展空间。

### merchant-pricing-independent#D002: 真实提交继续走本地商家后台 DOM 链路

真实改价继续由已登录商家后台页面的 content script 填价并点击保存，避免把平台账号和提交能力迁移到云端后端。
