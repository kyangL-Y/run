# 模块: competitor_scheduler

## 职责

- 通过 Celery/Redis 提供后端竞对房型价定时采集能力。
- 每 2 小时触发一次全店铺竞对房型价采集任务。
- 从 `competitor_hotels` 读取启用的店铺级竞对酒店配置。
- 将全部启用竞对酒店汇总为统一采集池，并按 `hotel_url` 去重抓取。
- 统一采集时会绑定对应店铺的 `fliggy_guest storage_state`，确保云端自身可复用游客会话抓取竞对详情页房型价。
- 将统一抓取结果按订阅关系分发到不同 `shop_id` 的 `hotel_room_prices` 历史表，不自动执行真实改价。

## 行为规范

- Celery app 入口为 `apps/backend/app/celery_app.py`，默认 beat schedule 名称为 `collect-competitor-room-prices-every-2-hours`。
- Celery task 入口为 `app.tasks.competitor_trend.collect_all_shops`。
- 统一调度链路为：店铺订阅读取 -> 读取店铺 `fliggy_guest` 会话名 -> 按 `hotel_url + storage_state_name` 分组抓取 -> 按店铺分发保存。
- 调度开关和参数来自后端环境配置：
  - `COMPETITOR_ROOM_PRICE_SCHEDULE_ENABLED`
  - `COMPETITOR_ROOM_PRICE_SCHEDULE_INTERVAL_MINUTES`
  - `COMPETITOR_ROOM_PRICE_SCHEDULE_MAX_HOTELS_PER_SHOP`
  - `COMPETITOR_ROOM_PRICE_SCHEDULE_HEADLESS`
  - `COMPETITOR_ROOM_PRICE_SCHEDULE_DEBUG_URL`
- Worker 与 Beat 需要 Redis；本地脚本为 `scripts/start_celery_worker.ps1` 和 `scripts/start_celery_beat.ps1`。
- 采集失败只记录在任务结果中，不影响 Flask API 启动，不触发自动改价。
- 同一竞对酒店被多个店铺订阅且复用同一 `storage_state_name` 时，单次调度只抓取一次，再按各店铺配置的 `hotel_name` 分发写入。
- 若某店铺没有可用游客会话文件，调度结果会返回明确错误（如 `guest session not found` / `guest session expired`），不再静默记为 0 房型。

## 依赖关系

- `apps/backend/app/core/config.py`：读取 Redis 和竞对房型价调度配置。
- `apps/backend/app/db/session.py`：提供 Celery task 使用的数据库 Session。
- `apps/backend/app/services/competitor_hotel_config_service.py`：确保并读取店铺级竞对酒店配置表。
- `apps/backend/app/services/merchant_connection_service.py`：读取店铺 `fliggy_guest` 会话名。
- `apps/backend/app/services/competitor_service.py`：复用抓取、结果标准化和 `save_room_prices()`。
- `apps/backend/tests/test_competitor_room_price_schedule_service.py`：覆盖统一抓取去重、按店铺分发、保存和汇总行为。
