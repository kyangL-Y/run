# 任务清单: competitor-snapshot-cleanup-script

> **@status:** completed | 2026-03-21 19:45

```yaml
@feature: competitor-snapshot-cleanup-script
@created: 2026-03-21
@status: completed
@mode: R2
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 4/4 (100%) | 更新: 2026-03-21 19:45:00
当前: 方案包已归档
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 4 | 0 | 0 | 4 |

---

## 任务列表

### 1. 清洗规则与脚本实现

- [√] 1.1 在 `backend/app/services/competitor_service.py` 中补充历史快照清洗可复用规则，统一名称规范化、来源映射和无效快照判定
- [√] 1.2 在 `backend/scripts/clean_competitor_snapshots.py` 中实现一次性清洗脚本，支持 `dry-run`、过滤条件和显式删除开关
  - 依赖: 1.1

### 2. 回归验证

- [√] 2.1 在 `backend/tests/test_competitor_service.py` 中补充历史清洗规则回归测试
- [√] 2.2 运行竞对相关定向测试，确认历史清洗规则与现有采集行为兼容
  - 依赖: 1.2, 2.1

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-03-21 18:05:00 | 方案设计 | completed | 已确认采用“服务层规则复用 + 独立 dry-run 清洗脚本”方案 |
| 2026-03-21 19:18:00 | 1.1 清洗规则落地 | completed | 已在 `competitor_service.py` 新增历史快照来源归一、signals 解析与单行清洗计划构建函数 |
| 2026-03-21 19:24:00 | 1.2 清洗脚本实现 | completed | 已新增 `clean_competitor_snapshots.py`，支持过滤条件、预览统计、显式 apply 与 delete-invalid |
| 2026-03-21 19:31:00 | 2.1 测试补充 | completed | 已补充历史快照来源归一、名称修正和无效 URL 识别回归测试 |
| 2026-03-21 19:34:00 | 2.2 定向验证 | completed | `python -m unittest tests.test_competitor_service tests.test_competitor_guest_login_flow` 通过，且新脚本 `py_compile` 通过 |

---

## 执行备注

> 记录执行过程中的重要说明、决策变更、风险提示等

- 本轮不新增 Web/API 入口，保持为运维脚本能力。
- 删除类动作必须通过显式参数开启，默认执行路径仅做预览或安全更新。
- 子代理未调用：TASK_COMPLEXITY=simple，按规则由主代理直接执行。

