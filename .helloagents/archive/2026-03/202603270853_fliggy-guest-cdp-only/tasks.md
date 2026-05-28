> **@status:** completed | 2026-03-27 09:24

﻿# 任务清单: fliggy-guest-cdp-only

```yaml
@feature: fliggy-guest-cdp-only
@created: 2026-03-27
@status: completed
@mode: R2
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 8/8 (100%) | 更新: 2026-03-27 09:22:39
当前: 游客竞对抓价链路收敛、测试验证与知识库同步已完成
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 8 | 0 | 0 | 8 |

---

## 任务列表

### 1. 服务层收敛

- [√] 1.1 在 `backend/app/services/competitor_service.py` 中移除游客链路对 `storage_state` 和 `auto_login` 的 fallback。
- [√] 1.2 在 `backend/app/services/competitor_service.py` 中统一游客链路返回值与错误信息，确保只返回 `cdp_current_page` 语义。

### 2. 入口与页面收敛

- [√] 2.1 在 `backend/app/schemas/competitor.py` 中调整游客抓价请求默认模式为 `cdp_current_page`，清理旧模式语义。
- [√] 2.2 在 `backend/app/web/market.py` 中删除游客自动登录相关字段透传，保留当前页接管所需参数。
- [√] 2.3 在 `backend/app/api/routes.py` 中同步精简游客抓价接口参数。
- [√] 2.4 在 `backend/app/templates/ops/market/fliggy_collect.html` 中移除游客登录会话区域和 fallback 文案，改为明确的 CDP 使用说明。

### 3. 测试与验证

- [√] 3.1 在 `backend/tests/test_competitor_guest_login_flow.py` 中删除 fallback 成功断言，改为 CDP 失败报错断言。
- [√] 3.2 运行游客抓价相关测试，确认成功接管与失败提示均符合新行为。

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-03-27 08:55:00 | 方案设计 | completed | 已确定游客竞对抓价仅保留 `cdp_current_page` 链路，并创建方案包。 |
| 2026-03-27 09:18:00 | 开发实施 | completed | 已完成服务、Web、API、模板与测试改造，移除游客自动登录与会话回退入口。 |
| 2026-03-27 09:22:39 | 验证与知识库同步 | completed | `py_compile` 与 18 个 unittest 用例通过，模块文档已同步。 |

---

## 执行备注

> 记录执行过程中的重要说明、决策变更、风险提示等

- 本次改造只针对游客竞对抓价链路，商家抓价相关 `prefer_cdp` / `storage_state` 逻辑不在本轮处理范围内。
- 若后续仍需保留会话文件能力，应作为独立受控工具链，而不能继续挂在当前游客抓价主路径上。
