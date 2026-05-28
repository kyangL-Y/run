# 模块: market_collection

## 职责

- 管理飞猪游客采集表单与 API 请求结构。
- 游客竞对采集支持两条链路：`cdp_current_page` 当前 Chrome / Edge 已登录标签页接管，以及 `storage_state` 持久化游客会话抓取。
- 在飞猪采集阶段识别酒店卡片、过滤非酒店价格项，并统一输出带统计信息的竞对酒店结果。
- 为运营台提供飞猪采集结果和竞对最新价的结构化展示。
- 为插件和后端调度提供竞对酒店房型价历史存储、主流房型最低价趋势、酒店维度最低价趋势和规则/LLM 建议。

## 行为规范

- 游客链路允许复用 `storage_state` 会话；当会话缺失或过期时，服务层会返回明确错误，便于重新登录生成新会话。
- Web 控制台上的飞猪游客采集面板只保留当前页接管所需的最小参数：`debug_url`、URL 关键字、翻页数、酒店数与结果保存开关；页面文案必须明确“不会自动登录、不会新开浏览器、只接管当前已登录页”。
- `cdp_current_page` 模式通过 Chrome 远程调试端口连接到用户当前已登录的浏览器，并优先选择当前激活的飞猪酒店列表页。
- `storage_state` 模式通过 `.playwright/fliggy_guest_states/*.json` 打开无头浏览器上下文，适用于云端定时任务和无桌面服务器。
- 飞猪候选卡片会先执行价格提取，再基于酒店 URL、酒店语义信号和排除词过滤掉机票、航线等非酒店项。
- DOM 主路径会优先按候选容器和结构信号评分抽取更像酒店卡片的节点，仅在主路径结果不足时才回退到整页文本解析。
- 对通过过滤的酒店结果，会在服务层统一执行酒店名规范化，清理会员价、立减等营销尾词、无金额残缺尾词（如单独“立减”“立省”）以及不可见/私有区字符，保证抓取、入库和最新价展示口径一致。
- 历史 `competitor_snapshots` 清洗脚本复用同一套服务层规则，支持默认 dry-run 摘要预览、`--sql-preview` SQL 语句预览、对旧快照的 `target_name`/`source` 批量修正，并在显式开关下清理明显无效的飞猪快照。
- 采集结果除 `items` 外，还会返回 `raw_row_count`、`kept_row_count`、`filtered_row_count`、`filter_summary` 和 `filtered_examples`，用于操作台排查采集质量。
- 飞猪首页不允许直接作为采集页；必须是可见价格的酒店列表或搜索结果页。
- 竞对房型价历史写入 `hotel_room_prices`；趋势接口默认按主流房型分类聚合最低价，也支持 `series_type=hotel_min_price` 按酒店聚合每个采集时间点的最低房型价。
- `/competitor/fliggy/session/login` 重新用于生成或更新 `fliggy_guest` 会话文件；竞对详情页房型抓取和定时任务会优先使用该会话文件。

## 依赖关系

- `backend/app/schemas/competitor.py`：定义采集模式、调试地址和 URL 关键字等请求字段。
- `backend/app/web/market.py`：处理 SSR 页面表单、参数解析与 service 调用。
- `backend/app/api/routes.py`：对外提供 `/competitor/fliggy/session/login` 与 `/competitor/fliggy/collect` API。
- `backend/app/services/competitor_service.py`：实现游客链路的 CDP 当前页接管、酒店过滤、价格抓取，以及历史快照清洗复用规则。
- `backend/app/services/competitor_room_price_schedule_service.py`：为 Celery 后端调度读取启用竞对酒店、批量抓取房型价并写入历史表。
- `backend/scripts/clean_competitor_snapshots.py`：对历史竞对快照执行 dry-run 预览、名称/来源修正与显式无效数据清理。
- `backend/app/templates/ops/market/fliggy_collect.html`：展示“只接管当前已登录浏览器页”的最小化操作面板、采集统计、有效酒店与过滤样例。
- `backend/app/templates/ops/market/competitor_latest_prices.html`：展示数据库中的最新竞对酒店价格。
- `backend/tests/test_competitor_guest_login_flow.py`：覆盖游客采集、CDP 接管与过滤规则回归测试。
- `backend/tests/test_competitor_service.py`：覆盖历史快照名称修正、来源归一与无效快照识别规则。
- `backend/tests/test_competitor_room_price_schedule_service.py`：覆盖后端竞对房型价调度服务的酒店分组、采集保存和多店铺汇总。
