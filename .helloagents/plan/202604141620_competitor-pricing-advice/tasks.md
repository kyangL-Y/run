# 任务清单: competitor-pricing-advice

```yaml
@feature: competitor-pricing-advice
@created: 2026-04-14
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 7/7 (100%) | 更新: 2026-04-14 18:05:00
当前: 全部任务完成，等待用户验收
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 7 | 0 | 0 | 7 |

---

## 任务列表

### 1. 方案包与后端接口基线
- [√] 1.1 补齐 proposal.md 和 tasks.md 的真实内容与进度基线
- [√] 1.2 在 `backend/app/schemas/pricing.py` 中新增独立竞对建议价请求模型
- [√] 1.3 在 `backend/app/api/plugin_routes.py` 中新增独立竞对建议价预览接口

### 2. 定价服务实现
- [√] 2.1 在 `backend/app/services/pricing_service.py` 中补充可直接消费插件抓价结果的建议价生成入口
- [√] 2.2 新增 `backend/app/services/competitor_pricing_advice_service.py`，拼装竞对上下文、历史价格上下文与展示摘要
  - 依赖: 2.1

### 3. 插件接线
- [√] 3.1 在 `browser-extension/background.js` 中新增独立建议价消息类型与 API 代理
- [√] 3.2 在 `browser-extension/popup.html`、`browser-extension/popup.js` 中新增抓价后库存输入与建议价展示入口
  - 依赖: 3.1

### 4. 验证与同步
- [√] 4.1 在 `backend/tests/test_plugin_api_routes.py`、`backend/tests/test_browser_extension_assets.py` 中补充回归测试
- [√] 4.2 同步 `.helloagents/modules/browser_extension.md` 与 `.helloagents/CHANGELOG.md`，完成语法/测试验证并准备归档

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-14 16:26:00 | 1.1 | completed | 创建方案包并补齐真实需求、方案与任务基线 |
| 2026-04-14 18:05:00 | 1.2-4.2 | completed | 独立竞对建议价 API、Popup 入口、消息桥接、测试与知识库同步已完成 |

---

## 执行备注

> 本轮按用户选择的方案 2 执行：独立新建竞对建议价 API 和插件入口，不与现有 competitor workflow 混用。

