# 任务清单: merchant-pricing-cdp-empty-fallback

> **@status:** completed | 2026-04-18 12:13

```yaml
@feature: merchant-pricing-cdp-empty-fallback
@created: 2026-04-18
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 4/4 (100%) | 更新: 2026-04-18 12:08:00
当前: 已完成代码修复、测试验证与知识库同步
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 4 | 0 | 0 | 4 |

---

## 任务列表

### 1. merchant_pricing 后端修复

- [√] 1.1 在 `backend/app/services/fliggy_merchant_service.py` 中实现 `prefer_cdp` 空结果自动回退 `storage_state`
- [√] 1.2 在 `backend/app/services/fliggy_merchant_service.py` 中记录空结果 fallback reason，保持现有成功路径不变

### 2. 回归测试与验证

- [√] 2.1 在 `backend/tests/test_fliggy_merchant_service.py` 中新增 CDP 空结果 fallback 回归测试
- [√] 2.2 运行定向 pytest，验证 merchant 采价与上层 pricing 服务链路通过

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-18 12:02:00 | 方案设计 | completed | 已确认采用“CDP 空结果回退 storage_state”的最小修复方案 |
| 2026-04-18 12:04:00 | 1.1 | completed | `prefer_cdp` 在 CDP 返回空房型时不再直接视为成功，而是继续回退到 storage_state |
| 2026-04-18 12:04:30 | 1.2 | completed | 为 CDP 空结果补充 `cdp_fallback_reason=cdp-returned-empty-items` |
| 2026-04-18 12:05:00 | 2.1 | completed | 新增回归测试覆盖 CDP 空结果 fallback 分支 |
| 2026-04-18 12:06:30 | 2.2 | completed | `backend/tests/test_fliggy_merchant_service.py` 24 passed，`backend/tests/test_merchant_pricing_service.py` 15 passed |

---

## 执行备注

> 记录执行过程中的重要说明、决策变更、风险提示等

- 本次仅修改后端采集容错与测试，不调整前端统计展示和商家提交流程。
