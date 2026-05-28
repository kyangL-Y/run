# 模块: fliggy_plugin

## 职责

- 提供 `plugins/fliggy-ops` 本地插件壳的 MCP bridge，实现插件宿主到当前 Flask Web/API 的能力映射。
- 负责拉起本地 backend 健康检查、组装多租户请求头，并暴露与当前项目主流程对应的 MCP 工具。
- 为控制台主要页面提供快捷打开入口，便于插件宿主与真实 Web 控制台协同使用。

## 行为规范

- `plugins/fliggy-ops/scripts/fliggy_ops_mcp_server.py` 是唯一 MCP bridge；插件继续复用现有 `backend` 页面和 API，不重复实现业务逻辑。
- bridge 在调用 API 或打开页面前必须先确认本地 backend 可用；若 `/health` 不可达，则先调用 `start_project.ps1` 尝试拉起服务。
- 所有门店级工具继续通过 `X-Tenant-Id` 与 `X-Shop-Id` 传递租户上下文，并保持 `shop_id` 与 payload/query 的一致性。
- bridge 现已覆盖服务状态、竞对趋势/最新价、飞猪采集、房态分析、定价推荐、商家凭据、商家会话、商家映射、商家采价与商家改价主流程。商家采价预览与采集默认使用 `prefer_cdp`，会先尝试 `9222` 调试端口；当调试端口不可达或 CDP 成功但未解析到任何房型时，会回退到已保存的商家会话。
- 页面入口工具只负责打开现有 Flask 页面，如 `/ops/pricing/merchant-credentials`、`/ops/pricing/merchant-pricing`、`/ops/market/rooms/analyze`；真实表单提交仍由后端页面或 API 承担。
- 插件 README 必须与 bridge 暴露的 MCP 工具集合保持一致。

## 依赖关系

- `plugins/fliggy-ops/.mcp.json`：声明 bridge 的本地 Python 启动入口。
- `plugins/fliggy-ops/scripts/fliggy_ops_mcp_server.py`：定义本地 MCP server、通用请求帮助函数与各类工具。
- `plugins/fliggy-ops/README.md`：说明插件能力、边界和本地使用方式。
- `start_project.ps1`：在本地后端未就绪时负责创建环境、安装依赖并拉起 Flask 服务。
- `backend/app/api/routes.py`：提供 bridge 复用的 JSON API 能力。
- `backend/app/web/pricing.py`、`backend/app/web/market.py`：提供 bridge 快捷打开的 Flask 控制台页面。
- `backend/tests/test_fliggy_ops_mcp_server.py`：覆盖 bridge 的路径、参数和页面入口映射回归测试。

