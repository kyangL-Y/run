# 变更提案: rooms-vs-manage-pricing-submit

## 元信息
```yaml
类型: 优化
方案类型: implementation
优先级: P1
状态: 执行中
创建: 2026-05-07
```

---

## 1. 需求

### 背景
插件现有商家改价默认指向飞猪 `batchRoomStatusUpdate?type=price` 页面。用户确认真实改价页面应改为 `roomsVsManage`，并希望在生成建议价后，经二次确认即可直接修改平台价格。

### 目标
将插件商家改价默认目标页调整为 `https://hotel.fliggy.com/ebooking/hotelBaseInfoUv.htm#/ebk-rp/roomsVsManage`，保留现有“生成建议价 -> 一键回填 -> 二次确认 -> 后端提交”的安全链路，并补强后端通用提交选择器对该页面的兼容。

### 约束条件
```yaml
时间约束: 本轮完成代码修改和本地静态/资产测试
性能约束: 不增加额外真实提交前置请求
兼容性约束: 保留 popup 与右下角浮层双入口一致行为
业务约束: 不执行真实平台改价；真实改价必须保留二次确认
```

### 验收标准
- [ ] 插件默认飞猪平台价格页改为 `roomsVsManage`
- [ ] popup、右下角浮层、background payload 使用同一默认 URL
- [ ] 后端提交选择器兼容“修改价格/价格管理/保存/确认”等常见控件
- [ ] 生成建议价和一键回填不触发真实改价
- [ ] 二次确认后才发送 `MERCHANT_PRICING_SUBMIT_CURRENT`
- [ ] JS 静态检查和插件资产测试通过

---

## 2. 方案

### 技术方案
采用最小可用改造方案：替换前端和 background 默认改价 URL，更新测试断言；在后端 `merchant_portal_pricing_service.py` 的通用选择器中补充 `roomsVsManage` 常见按钮、输入框、保存成功/失败文案，避免改变现有 API 和数据模型。

### 影响范围
```yaml
涉及模块:
  - apps/frontend/extension: popup、右下角浮层和 background 默认 URL 与文案
  - apps/backend/app/services: 商家后台价格提交选择器兼容
  - apps/backend/tests: 浏览器插件资产测试断言
  - .helloagents: 方案包与变更记录
预计变更文件: 8
```

### 风险评估
| 风险 | 等级 | 应对 |
|------|------|------|
| 真实商家后台价格修改属于高风险业务操作 | 高 | 保留二次确认，不执行真实提交测试 |
| `roomsVsManage` 页面 DOM 与现有选择器不一致 | 中 | 补充通用选择器，提交结果返回 selector、行文本和失败原因 |
| hash 路由页面加载较慢导致抓取为空 | 中 | 复用现有等待和 CDP/storage_state 双模式 |

---

## 3. 技术设计

### 链路
```mermaid
flowchart TD
    A[生成建议价] --> B[前端展示最终价]
    B --> C[一键回填建议价]
    C --> D[用户二次确认]
    D --> E[MERCHANT_PRICING_SUBMIT_CURRENT]
    E --> F[/plugin/pricing/merchant-direct-submit]
    F --> G[Playwright 接管 roomsVsManage 页面]
    G --> H[匹配房型行并填入最终价]
    H --> I[点击保存/提交并返回结果]
```

### API设计
不新增 API。继续使用：
- `POST /plugin/pricing/competitor-workflow-preview`
- `POST /plugin/pricing/merchant-direct-submit`
- `POST /plugin/pricing/uniform-direct-submit`

### 数据模型
不新增数据表或字段。

---

## 4. 核心场景

### 场景: 建议价确认后提交到 roomsVsManage
**模块**: 浏览器插件商家改价  
**条件**: 商家后台已登录，房型映射具备 `gid/hid`，建议价已生成  
**行为**: 用户一键回填建议价后点击“确认最终价并提交”，并通过二次确认  
**结果**: 后端在 `roomsVsManage` 页面按确认后的最终价提交，并返回逐房型成功/失败结果

---

## 5. 技术决策

### rooms-vs-manage-pricing-submit#D001: 使用最小可用改造切换默认改价页
**日期**: 2026-05-07  
**状态**: ✅采纳  
**背景**: 用户明确指出真实改价页面是 `roomsVsManage`，现有提交链路已具备二次确认和 Playwright 提交能力。  
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 仅替换 URL | 改动极小 | 页面控件变化时提交失败概率高 |
| B: 替换 URL 并补强通用选择器 | 改动可控，兼容性更好 | 仍需真实页面 DOM 验证 |
| C: 新增专用页面适配器 | 可观测性最佳 | 改动范围和测试成本更高 |
**决策**: 选择方案 B  
**理由**: 能最快满足业务目标，同时不改变现有安全确认链路和 API 边界。  
**影响**: 影响插件默认入口、后端价格提交选择器、插件资产测试。
