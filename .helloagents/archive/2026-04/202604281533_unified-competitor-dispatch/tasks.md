# 任务清单: unified-competitor-dispatch

> **@status:** completed | 2026-04-28 16:02

```yaml
@feature: unified-competitor-dispatch
@created: 2026-04-28
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 9/9 (100%) | 更新: 2026-04-28 15:46:00
当前: 调度改造、测试回归和知识库同步已完成
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 9 | 0 | 0 | 9 |

---

## 任务列表

### 1. 调度聚合与分发模型

- [√] 1.1 在 `apps/backend/app/services/competitor_room_price_schedule_service.py` 中重构竞对配置聚合逻辑，生成“按 hotel_url 去重”的统一抓取任务集
- [√] 1.2 在 `apps/backend/app/services/competitor_room_price_schedule_service.py` 中实现抓取结果到多个 `shop_id` 的分发保存逻辑
- [√] 1.3 在 `apps/backend/app/services/competitor_room_price_schedule_service.py` 中调整任务汇总结果结构，保留按店铺统计和失败信息

### 2. 抓取服务标准化

- [√] 2.1 在 `apps/backend/app/services/competitor_service.py` 中补充可复用的单酒店抓取结果标准化逻辑，确保统一抓取结果可被多个店铺复用
- [√] 2.2 在 `apps/backend/app/services/competitor_service.py` 中校验店铺分发时酒店名称、URL、rooms、错误信息的保留策略

### 3. 调度入口与插件兼容

- [√] 3.1 在 `apps/backend/app/tasks/competitor_trend_tasks.py` 中保持 Celery 入口不变，但对新的调度返回结构补兼容
- [√] 3.2 在 `apps/backend/app/api/plugin_routes.py` 中回归校验趋势图和建议接口，必要时补最小兼容处理，不改现有返回 schema

### 4. 测试与文档同步

- [√] 4.1 在 `apps/backend/tests/test_competitor_room_price_schedule_service.py` 中新增去重抓取和按店铺分发测试
- [√] 4.2 在 `apps/backend/tests/test_plugin_api_routes.py` 与相关测试中补趋势图/建议的店铺隔离回归，并同步 `.helloagents/modules/competitor_scheduler.md`

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-28 15:34:00 | 方案设计 | completed | 已确定采用“统一采集池 + URL 去重 + 按店铺分发” |
| 2026-04-28 15:40:00 | 开发实施启动 | in_progress | 开始重构定时调度服务与测试 |
| 2026-04-28 15:46:00 | 调度与抓取改造 | completed | 已完成统一抓取、按店铺分发和结果标准化 |
| 2026-04-28 15:46:00 | 回归测试 | completed | 目标测试 25 通过，全量后端测试 168 通过 |

---

## 执行备注

- 当前仍沿用统一游客会话，不在本轮引入新的共享快照表或独立后台管理页。
- 如果实施中发现 `hotel_url` 不能稳定唯一标识竞对酒店，需要退回到“URL + 规范化酒店名”的联合键策略。
- 本轮保持插件趋势图和建议接口协议不变，只调整云端调度和抓取分发逻辑。
