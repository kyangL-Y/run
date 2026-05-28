# 变更提案: celery-competitor-trend

## 元信息
```yaml
类型: 新功能
方案类型: implementation
优先级: P1
状态: 草稿
创建: 2026-04-27
```

---

## 1. 需求

### 背景
当前项目已具备浏览器插件端每 120 分钟采集竞对酒店详情页房型价、保存 `hotel_room_prices`、生成房型分类最低价趋势图和建议的能力。但该调度依赖 Chrome 插件 alarm、浏览器运行和插件登录态，不适合作为稳定后端定时任务。

### 目标
- 使用 Celery/Redis 在后端实现每 2 小时执行一次竞对酒店房型价采集任务。
- 复用现有 `competitor_hotels` 店铺级竞对酒店配置和 `hotel_room_prices` 存储表。
- 补充酒店维度最低价趋势聚合，让前端可以在“房型分类最低价”和“酒店最低价”之间展示。
- 保留现有浏览器插件手动采集、房型分类趋势图和建议价功能。

### 约束条件
```yaml
时间约束: 本次以 PoC 可运行闭环为目标，不引入 Airflow/Dagster 等重型编排。
性能约束: 单次任务按店铺串行或有限并发采集，避免大量并发打开飞猪页面。
兼容性约束: 不破坏现有 Flask API、插件手动采集、插件 alarm 逻辑和测试。
业务约束: 真实改价链路继续保留人工确认闸门；本任务只采集和生成趋势建议，不自动改价。
运行约束: Celery worker 和 Celery beat 需要 Redis；房型价采集仍可能依赖可用的飞猪登录态或可访问详情页。
```

### 验收标准
- [ ] 后端提供 Celery app、定时任务和 worker/beat 启动脚本。
- [ ] Celery Beat 默认每 2 小时触发竞对房型价采集。
- [ ] 任务能读取启用的 `competitor_hotels`，采集并保存 `hotel_room_prices`。
- [ ] 后端趋势接口支持 `series_type=room_category` 与 `series_type=hotel_min_price`。
- [ ] Popup 可展示酒店维度最低价折线图，并保留现有房型分类趋势图。
- [ ] 规则建议和 LLM 建议继续可用；无 LLM key 时不失败。
- [ ] 相关单元测试和资产测试通过。

---

## 2. 方案

### 技术方案
采用 Celery/Redis 作为后端调度层：

- 新增 `app/celery_app.py`，从现有 `Settings` 读取 `celery_broker_url`、`celery_result_backend`，配置 worker 与 beat schedule。
- 新增后端任务模块，例如 `app/tasks/competitor_trend_tasks.py`，实现 `collect_competitor_room_prices_for_all_shops` 和按店铺采集函数。
- 新增服务函数，按 `competitor_hotels` 中 `enabled=1` 的配置构造 `{name,url}` 列表，调用现有 `crawl_multiple_hotels_room_prices()` 与 `save_room_prices()`。
- 扩展 `get_room_price_trend_summary()`，增加 `series_type` 参数。默认保持 `room_category`，新增 `hotel_min_price` 按酒店聚合各采集时间点的最低房型价。
- 扩展 `/plugin/competitor/room-price-trends` 查询参数，支持 `series_type=hotel_min_price`。
- Popup 增加趋势维度切换控件或展示区，复用现有 SVG 折线图渲染逻辑。
- 保留插件端 alarm 手动/兜底采集，不在本次删除。

### 影响范围
```yaml
涉及模块:
  - backend/app/core/config.py: 如需补充调度开关、间隔、并发等配置项。
  - backend/app/celery_app.py: 新增 Celery 应用入口。
  - backend/app/tasks/: 新增 Celery 任务模块。
  - backend/app/services/competitor_hotel_config_service.py: 复用或补充启用酒店查询能力。
  - backend/app/services/competitor_service.py: 增加酒店维度趋势聚合和后端任务复用入口。
  - backend/app/api/plugin_routes.py: 扩展趋势查询参数。
  - apps/frontend/extension/popup.html: 增加趋势维度入口。
  - apps/frontend/extension/popup.js: 拉取并渲染酒店维度趋势。
  - scripts/: 增加 Celery worker/beat 启动脚本。
  - tests/: 增加后端任务、趋势聚合、插件资产测试。
预计变更文件: 10-14
```

### 风险评估
| 风险 | 等级 | 应对 |
|------|------|------|
| Celery/Redis 未启动导致定时任务不执行 | 中 | 增加启动脚本、README/知识库说明，并在状态返回中暴露调度依赖 |
| 后端 Playwright 采集依赖登录态或 CDP 浏览器 | 高 | 本次不承诺绕过登录；任务记录失败状态，保留插件手动采集兜底 |
| 多店铺/多酒店采集耗时过长 | 中 | 默认串行执行，限制每店酒店数量，后续再引入并发控制 |
| 飞猪页面结构变化导致房型解析失败 | 中 | 复用现有解析与测试，任务失败不影响服务启动 |
| 前端趋势切换破坏现有图表 | 低 | 保持 `room_category` 默认行为，新增维度以兼容方式接入 |

---

## 3. 技术设计

### 架构设计
```mermaid
flowchart TD
    Beat[Celery Beat 每2小时] --> Task[Celery Task]
    Task --> Config[读取 competitor_hotels enabled=1]
    Config --> Crawl[复用 crawl_multiple_hotels_room_prices]
    Crawl --> Save[save_room_prices 写入 hotel_room_prices]
    Save --> TrendAPI[/plugin/competitor/room-price-trends]
    TrendAPI --> Popup[Popup SVG 折线图]
    TrendAPI --> Advice[规则/LLM 趋势建议]
```

### API 设计
#### GET /plugin/competitor/room-price-trends
- **新增查询参数**:
```yaml
series_type: room_category | hotel_min_price
days: 1-30
point_limit: 1-240
hotel_name: 可选
include_advice: 0|1
```
- **响应兼容**:
```yaml
series_type: room_category 或 hotel_min_price
metric: min_price
series:
  - category_code/category_name 或 hotel_name
  - latest_min_price
  - change_amount
  - change_pct
  - points:
      - collected_at
      - min_price
      - avg_price
      - max_price
      - sample_count
```

### 数据模型
本次不新增核心业务表，继续使用 `hotel_room_prices`：

| 字段 | 类型 | 说明 |
|------|------|------|
| shop_id | BIGINT | 店铺 ID |
| hotel_name | VARCHAR(128) | 竞对酒店名 |
| hotel_url | VARCHAR(1024) | 竞对酒店详情页 |
| room_type | VARCHAR(64) | 房型名称 |
| price | DECIMAL(10,2) | 房型价格 |
| collected_at | DATETIME | 采集时间 |

如需记录 Celery 任务运行状态，优先使用 Celery result backend 与日志；若实施中发现前端需要展示后端任务状态，再补轻量状态表或复用审计表。

---

## 4. 核心场景

### 场景: 后端每 2 小时采集竞对房型价
**模块**: backend scheduling  
**条件**: Redis、Celery worker、Celery beat 正常运行，店铺配置了启用的竞对酒店。  
**行为**: Beat 触发任务，任务读取启用酒店，逐个采集详情页房型价并保存。  
**结果**: `hotel_room_prices` 新增本轮采样点。

### 场景: 查看酒店维度最低价折线图
**模块**: browser_extension  
**条件**: 已有至少两次酒店房型价采样。  
**行为**: Popup 调用趋势接口并传入 `series_type=hotel_min_price`。  
**结果**: SVG 折线图按酒店显示最低房型价走势，并展示建议摘要。

### 场景: 采集失败但不影响现有插件能力
**模块**: backend scheduling / browser_extension  
**条件**: 后端定时采集因登录态或页面变化失败。  
**行为**: Celery task 记录错误；用户仍可通过插件手动采集。  
**结果**: 系统不自动改价，现有手动闭环保持可用。

---

## 5. 技术决策

### celery-competitor-trend#D001: 采用 Celery Beat 作为后端定时调度
**日期**: 2026-04-27  
**状态**: ✅采纳  
**背景**: 插件 alarm 依赖浏览器运行，不满足稳定后端调度要求。项目已存在 `celery`、`redis` 依赖和配置项，具备低成本接入基础。  
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: Celery Beat + Redis | 后端稳定调度，可独立于浏览器插件运行，符合用户选择 | 需要 Redis、worker、beat 进程运维 |
| B: Flask 内置线程 | 改动小，已有类似 `fliggy_schedule_service` | 与 Web 进程耦合，重启/多进程下不稳定 |
| C: 保留插件 alarm | 已实现，无新增后端组件 | 依赖浏览器，不满足稳定后端任务目标 |
**决策**: 选择方案 A。  
**理由**: 用户已选择 Celery/Redis；项目已有依赖，新增架构成本可控，并能把采集调度从插件中解耦。  
**影响**: 增加 Celery 运行入口、脚本和部署说明；后端需有 Redis。

### celery-competitor-trend#D002: 趋势接口用参数扩展而非新增独立接口
**日期**: 2026-04-27  
**状态**: ✅采纳  
**背景**: 现有 `/plugin/competitor/room-price-trends` 已服务 Popup 趋势图和建议，酒店维度与房型分类本质都是 `hotel_room_prices` 的 chart-ready 聚合。  
**选项分析**:
| 选项 | 优点 | 缺点 |
|------|------|------|
| A: 在现有接口增加 `series_type` | 兼容现有调用，前端复用成本低 | 后端函数分支稍复杂 |
| B: 新增 `/room-price-hotel-trends` | 语义独立 | 增加路由和重复前端请求逻辑 |
**决策**: 选择方案 A。  
**理由**: 最小化 API 面积，保持现有默认行为不变。  
**影响**: 后端 schema/参数校验和前端渲染需识别 `series_type`。
