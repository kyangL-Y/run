@feature: monthly-pricing-confirmation
@created: 2026-03-07 11:17
@status: completed
@mode: INTERACTIVE

# 进度概览

- 完成：7
- 失败：0
- 跳过：0
- 总数：7

# 任务列表

- [√] 1. 新增月度调价计划 schema
- [√] 2. 新增月度调价计划持久化与 service
- [√] 3. 新增生成/确认/查询接口
- [√] 4. 扩展定价逻辑为未来 30 天逐日建议
- [√] 5. 改造 Streamlit 页面为草稿编辑加确认流
- [√] 6. 增加或更新针对新接口的测试
- [√] 7. 更新 README 与知识库记录

# 执行日志

- 2026-03-07 11:17: 创建方案包，选定方案 B（专用月度调价计划流）
- 2026-03-07 11:48: 完成后端 service、接口、Streamlit 页面与测试改造
- 2026-03-07 11:49: 运行 `tests.test_pricing_service` 与 `tests.test_monthly_pricing_service`，共 8 项通过

# 执行备注

- 已实现“生成草稿 → 手工修改 → 确认改价”闭环
- 未确认前不会自动写入系统；确认后仍可重新生成新草稿继续调整
