@feature: project-stability-baseline
@created: 2026-03-30 16:26
@status: completed
@mode: INTERACTIVE

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 4/4 (100%) | 更新: 2026-03-30 16:38:00
当前: 全部任务完成
<!-- LIVE_STATUS_END -->

# 进度概览

- 完成：4
- 失败：0
- 跳过：0
- 总数：4

# 任务列表

- [√] 1. 恢复测试依赖基线
- [√] 2. 新增 Flask 路由最小冒烟测试
- [√] 3. 收敛 README 到当前真实实现
- [√] 4. 更新 CHANGELOG 与归档方案包

# 执行日志

- 2026-03-30 16:26: 创建方案包，选定“基线优先收口”方案
- 2026-03-30 16:31: 更新 `backend/requirements.txt`，补入 `pytest==8.3.5`
- 2026-03-30 16:32: 新增 `backend/tests/test_app_route_smoke.py`，锁定应用导入与关键路由注册
- 2026-03-30 16:34: 收敛 `backend/README.md` 到当前真实实现
- 2026-03-30 16:36: 执行 `python -m pytest -q tests/test_app_route_smoke.py`，2 项通过；执行 `python -m pytest --collect-only -q`，恢复到 119 项可采集

# 执行备注

- 本次只修高优先级稳定性问题，不补回 README 中已缺失的大功能
- 测试基线已恢复到可采集状态，后续可继续在此基础上做针对性修复
