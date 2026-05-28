# 任务清单: cloud-competitor-trend-ui

> **@status:** completed | 2026-04-30 09:23

```yaml
@feature: cloud-competitor-trend-ui
@created: 2026-04-30
@status: completed
@mode: R2
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 6/6 (100%) | 更新: 2026-04-30 09:20:00
当前: 开发实施与验证完成
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 6 | 0 | 0 | 6 |

---

## 任务列表

### 1. 插件趋势图展示

- [√] 1.1 在 `apps/frontend/extension/popup.js` 中调整折线图展示上限和文案，使 `主流房型最低价` 明确按 `房型 + 酒店` 区分。
- [√] 1.2 在 `apps/frontend/extension/popup.js` 中优化趋势卡片时间文案，云端最新采集时间与插件提醒检查时间分开展示。

### 2. 竞对房型明细

- [√] 2.1 在 `apps/frontend/extension/popup.js` 中为每条房型行传入并显示所属竞对酒店。

### 3. 云端趋势提醒

- [√] 3.1 在 `apps/frontend/extension/background.js` 中把 alarm 任务从本地页面抓取改为拉取云端趋势接口。
- [√] 3.2 在 `apps/frontend/extension/background.js` 中基于云端趋势 series 构建价格快照，并复用现有通知去重逻辑。

### 4. 验证

- [√] 4.1 更新或补充测试断言，并运行相关后端/扩展测试。

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-30 09:08:00 | 方案设计 | completed | 已完成分析与实施任务拆分 |
| 2026-04-30 09:20:00 | 开发实施 | completed | 已完成 popup/background 修改与测试验证 |

---

## 执行备注

本次为 R2 简化流程，未启用子代理。原因：当前 Codex 会话只允许在用户明确要求子代理/并行代理工作时调用 `spawn_agent`，本任务由主上下文降级完成设计。

验证命令:
- `node --check apps/frontend/extension/popup.js`
- `node --check apps/frontend/extension/background.js`
- `apps/backend/.venv/Scripts/python.exe -m pytest apps/backend/tests/test_browser_extension_assets.py apps/backend/tests/test_competitor_service.py apps/backend/tests/test_plugin_api_routes.py -q`
