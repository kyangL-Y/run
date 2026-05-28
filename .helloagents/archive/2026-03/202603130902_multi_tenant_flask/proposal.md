# 方案提案

- 名称：multi-tenant-flask
- 创建时间：2026-03-13 09:02
- 类型：implementation

## 1. 需求

### 背景

当前后端基于 FastAPI，并以 `X-Shop-Id` 作为“租户标识”（multi-shop）。实际业务需要“集团（tenant）-门店（shop）”两级隔离：集团拥有多个门店权限，门店仅能访问自身数据。

本次按“仅数据隔离”落地，不引入登录/JWT，仅通过请求头传递 tenant/shop 并进行强校验。

### 目标

- 后端 Web 框架从 FastAPI 全量迁移为 Flask（接口尽量保持不变）
- 引入 `tenant_id`（集团）与 shop 归属关系
- 请求必须携带 `X-Tenant-Id` 与 `X-Shop-Id`（门店级接口），并强制校验门店归属于集团
- 集团级接口按 `tenant_id` 过滤（例如列出集团下门店）

### 约束条件

- 不接入登录系统，不实现 JWT/RBAC（仅 Header 校验）
- 尽量复用现有 `schemas/*`（Pydantic）与 `services/*`（SQLAlchemy + text SQL）
- 数据隔离采用“shop 分区 + tenant↔shop 归属校验”的最小改造方案

### 验收标准

- 能以 Flask 启动后端并提供与原 FastAPI 同等的主要 API 路由
- 对所有门店级接口：缺少/非法 `X-Tenant-Id`、`X-Shop-Id` 时返回 400；tenant-shop 不匹配时返回 403/404（按约定）
- `/shops` 仅返回当前 `X-Tenant-Id` 下的门店列表
- 现有 service 层测试（不依赖 FastAPI）可继续运行；新增 tenant-shop 校验与 shop 查询过滤的测试

## 2. 方案

### 技术方案（方案A｜最小改动）

- 数据层：
  - `shops` 表新增 `tenant_id` 字段与索引（保留原 `id` 作为 `shop_id`）
  - （建议）新增 `tenants` 表（`id/name/status/created_at/updated_at`），用于存在性与启用状态校验
- 隔离与校验：
  - 新增 tenant/shop 解析：从 Header 读取 `X-Tenant-Id` / `X-Shop-Id`
  - 统一校验：`shop_id` 必须属于 `tenant_id`，且 shop/tenant 必须为 enabled（若实现 status）
- Web 框架迁移：
  - `backend/app/main.py`：由 FastAPI 改为 Flask app + Blueprint 注册
  - `backend/app/api/routes.py`：由 FastAPI APIRouter 改为 Flask Blueprint 路由
  - `backend/app/api/deps.py`：替换为 Flask 版本的 tenant/shop 校验函数（不再 Depends）
  - 错误处理：统一 JSON 错误响应（400/403/404/500）
- 兼容性：
  - 尽量保持原 URL 路径与请求/响应 JSON 结构不变
  - Pydantic schema 在 Flask 中手动 `model_validate`/`model_dump`

### 数据流（门店级接口）

1. 客户端传 `X-Tenant-Id`、`X-Shop-Id`
2. 服务端解析并校验（shop 属于 tenant，且 enabled）
3. 路由处理函数继续调用现有 service（以 `shop_id` 作为业务分区键）

### 影响范围

- `backend/app/main.py`、`backend/app/api/routes.py`、`backend/app/api/deps.py`
- `backend/app/services/shop_service.py`（`shops.tenant_id`、按 tenant 列表）
- `backend/requirements.txt`、`backend/README.md`
- `backend/tests/test_shop_service.py`（以及新增 tenant 相关测试）

### 风险评估

- 风险 1：Flask 迁移后请求校验不如 FastAPI 自动
  - 缓解：复用 Pydantic schema，统一 JSON 解析与错误返回
- 风险 2：历史数据缺少 `tenant_id`
  - 缓解：提供默认 tenant（例如 `tenant_id=1`）策略或要求初始化脚本/手工补齐；在 proposal 中明确迁移策略
- 风险 3：遗漏未加校验的路由导致越权
  - 缓解：统一封装 `require_tenant_shop()`，所有门店级路由必须调用；增加单元测试覆盖关键路径

## 3. 技术设计

### Header 约定

- `X-Tenant-Id`：集团 ID（int，>0）
- `X-Shop-Id`：门店 ID（int，>0）

### 数据结构

- `tenants`（建议新增）
- `shops` 新增 `tenant_id`（并建立 `idx_shops_tenant_status (tenant_id, status)` 或同等索引）

### 路由分级

- 无需 tenant/shop：`GET /health`
- 集团级：`GET /shops`（仅依赖 `X-Tenant-Id`）
- 门店级：其余绝大多数接口（依赖 `X-Tenant-Id` + `X-Shop-Id`，并强校验归属）

### 关键决策

- `multi-tenant-flask#D001`：本次不做“全表 tenant_id”，采用 tenant↔shop 归属强校验作为隔离基线
- `multi-tenant-flask#D002`：迁移到 Flask 时保留 Pydantic schema，避免手写大量参数校验
- `multi-tenant-flask#D003`：FastAPI 依赖点极少，优先采取“入口/路由/依赖替换”方式，复用 service 层逻辑