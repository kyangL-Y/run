# 任务清单: celery-competitor-trend

> **@status:** completed | 2026-04-27 10:12

```yaml
@feature: celery-competitor-trend
@created: 2026-04-27
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 15/15 (100%) | 更新: 2026-04-27 10:05:00
当前: 开发实施完成，等待方案包归档
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 15 | 0 | 0 | 15 |

---

## 任务列表

### 1. 后端 Celery 调度

- [√] 1.1 新增 `apps/backend/app/celery_app.py`，创建 Celery app 并读取 Redis 配置。
- [√] 1.2 新增 `apps/backend/app/tasks/__init__.py` 与竞对趋势任务模块。
- [√] 1.3 实现每 2 小时 beat schedule，触发全店铺竞对房型价采集任务。
- [√] 1.4 实现按店铺读取启用竞对酒店配置的服务函数。
- [√] 1.5 复用 `crawl_multiple_hotels_room_prices()` 与 `save_room_prices()` 完成采集入库。

### 2. 后端趋势与 API

- [√] 2.1 扩展 `get_room_price_trend_summary()` 支持 `series_type=hotel_min_price`。
- [√] 2.2 保持 `series_type=room_category` 默认兼容行为。
- [√] 2.3 扩展 `/plugin/competitor/room-price-trends` 查询参数校验与传递。
- [√] 2.4 确认 `generate_room_price_trend_advice()` 对酒店维度趋势也能安全返回建议。

### 3. 插件前端展示

- [√] 3.1 在 Popup 增加趋势维度切换入口。
- [√] 3.2 调整 `refreshCompetitorTrendSummary()` 传递趋势维度。
- [√] 3.3 调整 SVG 图例与空态文案，兼容酒店维度与房型分类维度。

### 4. 脚本、测试与文档

- [√] 4.1 新增 Celery worker/beat 启动脚本或更新现有脚本说明。
- [√] 4.2 增加后端任务、酒店维度聚合、插件资产回归测试。
- [√] 4.3 更新 README/知识库模块说明与 CHANGELOG。

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-27 09:49:00 | DESIGN | pending | 方案包已创建，等待用户确认进入开发实施 |
| 2026-04-27 10:05:00 | DEVELOP | completed | Celery 调度、酒店维度趋势、Popup 切换、脚本、测试和文档已完成 |

---

## 执行备注

- RLM designer/pkg_keeper 按 HelloAGENTS 规则应调用；因当前 Codex 子代理使用受开发者指令限制，降级为主上下文执行。
- 本次开发不得移除现有插件 alarm 和手动采集路径，只新增后端稳定调度路径。
- 真实改价链路不纳入自动任务，保持人工确认。
- 验证命令: `pytest` 定向 49 项通过；`node --check` 验证 `background.js` 与 `popup.js` 通过；Celery app 导入检查通过。
