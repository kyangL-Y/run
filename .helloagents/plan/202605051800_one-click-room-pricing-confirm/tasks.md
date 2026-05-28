# 任务清单: one-click-room-pricing-confirm

```yaml
@feature: one-click-room-pricing-confirm
@created: 2026-05-05
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 6/6 (100%) | 更新: 2026-05-05 18:09:53
当前: 插件一键改价主流程已收束为按房型建议价、人工确认最终价后提交
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 6 | 0 | 0 | 6 |

---

## 任务列表

### 1. 前端插件流程

- [√] 1.1 在 `apps/frontend/extension/popup.html` 中调整商家改价主流程文案和统一价备用入口文案
- [√] 1.2 在 `apps/frontend/extension/popup.js` 中增加提交前人工确认摘要
- [√] 1.3 在 `apps/frontend/extension/content.js` 中增加页面浮层提交前人工确认摘要

### 2. 测试与验收

- [√] 2.1 在 `apps/backend/tests/test_browser_extension_assets.py` 中补充插件资产断言
- [√] 2.2 运行相关 pytest 与完整后端测试
- [√] 2.3 运行扩展脚本 `node --check`

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-05-05 18:00:00 | 方案确认 | in_progress | 采用渐进式收束主流程方案 |
| 2026-05-05 18:09:53 | 开发完成 | completed | Popup 与页面浮层均改为按房型生成建议价、人工调整最终价、确认摘要后提交；统一目标价降为高级备用 |
| 2026-05-05 18:09:53 | 验收完成 | completed | `node --check` 通过 3 个扩展脚本；目标测试 `37 passed`；完整后端测试 `170 passed` |

---

## 执行备注

真实商家后台改价属于高风险操作。本次改造不做真实提交测试，只验证 mocked 后端测试、插件资产和脚本语法。
