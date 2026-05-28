# 任务清单: rooms-vs-manage-pricing-submit

> **@status:** completed | 2026-05-07 10:20

```yaml
@feature: rooms-vs-manage-pricing-submit
@created: 2026-05-07
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 6/6 (100%) | 更新: 2026-05-07 10:20:00
当前: roomsVsManage 默认改价页切换与验证已完成
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 6 | 0 | 0 | 6 |

---

## 任务列表

### 1. 方案包

- [√] 1.1 创建并填充本次实施方案包

### 2. 插件默认入口

- [√] 2.1 将 popup、右下角浮层和 background 默认改价 URL 切换为 `roomsVsManage`
- [√] 2.2 确认二次确认提交链路仍使用 `MERCHANT_PRICING_SUBMIT_CURRENT`

### 3. 后端提交兼容

- [√] 3.1 补充商家后台价格提交选择器以兼容 `roomsVsManage`

### 4. 测试与知识库

- [√] 4.1 更新插件资产测试断言和 CHANGELOG
- [√] 4.2 运行 JS 静态检查和插件资产测试

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-05-07 10:13 | 1.1 | in_progress | 已创建方案包并开始填充 |
| 2026-05-07 10:20 | 1.1-4.2 | completed | 默认 URL、后端选择器、测试断言和知识库记录已完成；静态检查与插件资产测试通过 |

---

## 执行备注

本次变更涉及真实商家后台改价链路，仅修改代码和测试，不执行真实平台提交。按 Codex 子代理限制，moderate 复杂度的 explorer/designer/implementer 调用已降级为主上下文执行。
