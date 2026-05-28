# 任务清单: merchant-pricing-readiness-fix

```yaml
@feature: merchant-pricing-readiness-fix
@created: 2026-04-18
@status: completed
@mode: R2
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 3/3 (100%) | 更新: 2026-04-18 11:33:00
当前: 实施完成，待归档与变更同步
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 3 | 0 | 0 | 3 |

---

## 任务列表

### 1. merchant_pricing 后端修复

- [√] 1.1 在 `backend/app/services/fliggy_merchant_service.py` 中补充商家价格页内容就绪等待逻辑，避免页面刚到价格 URL 就立即解析
- [√] 1.2 在 `backend/app/services/fliggy_merchant_service.py` 中收紧 ready 判定，只在存在可识别房型/价格信号时才进入解析
  - 依赖: 1.1

### 2. 回归测试

- [√] 2.1 在 `backend/tests/test_fliggy_merchant_service.py` 中补充回归测试，覆盖延迟渲染页面与 URL 命中但内容未就绪场景

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-18 11:18:00 | 方案设计 | completed | 仅保留后端最小修复，不改基础功能板块 |
| 2026-04-18 11:26:00 | 1.1 | completed | 已为商家房型读取增加内容轮询等待，避免价格页异步渲染时过早解析 |
| 2026-04-18 11:26:00 | 1.2 | completed | 已将额外等待接入 CDP 与 storage_state 采集链路 |
| 2026-04-18 11:28:00 | 2.1 | completed | 已补充延迟房型文本回归测试 |
| 2026-04-18 11:30:00 | 验证 | completed | `backend.tests.test_fliggy_merchant_service` 与 `backend.tests.test_merchant_pricing_service` 通过 |

---

## 执行备注

> 本方案严格限制改动范围：不修改浏览器插件入口、不调整房型映射逻辑、不改提交改价流程，仅修复商家房型读取的页面就绪判定与回归测试。
