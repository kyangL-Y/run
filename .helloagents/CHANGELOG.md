## [Unreleased] - 2026-04-18

### 变更
- **[browser_extension]**: 修复右下角页面浮层加载本地 `popup.html?embedded=1` 后空白的问题；`manifest.json` 的 `web_accessible_resources` 补充 `popup.js` 与 `content/result-view.js`，确保 iframe 内完整 Popup 工作台可以加载依赖脚本。
  - 文件: `apps/frontend/extension/manifest.json`, `apps/backend/tests/test_browser_extension_assets.py`, `apps/frontend/extension/README.md`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 恢复右上角默认 Popup 为本地完整 `popup.html`，页面右下角运营助手 iframe 改为加载本地 `popup.html?embedded=1`，避免 HTTPS 飞猪页面嵌入 HTTP 云端 UI 触发混合内容拦截；`popup-shell` 与 `/ops-assistant` 云端页面保留为 HTTP 测试入口，等待 HTTPS 域名可用后再切回云端 UI。
  - 文件: `apps/frontend/extension/manifest.json`, `apps/frontend/extension/content.js`, `apps/frontend/extension/README.md`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/context.md`, `.helloagents/modules/browser_extension.md`, `.helloagents/modules/_index.md`
- **[browser_extension]**: 新增右上角 `popup-shell.html` / `popup-shell.js` 云端 UI 壳，将扩展默认 Popup 切到 `http://api.aihuawise.com/ops-assistant`，并通过 `fliggy-ops-cloud-ui/v1` 复用 runtime 白名单、隐藏 `bridge.html`、当前活动页 content script 和本地备用入口；固定协议不变时，其他电脑重新打开 Popup 即可加载云端最新页面。
  - 文件: `apps/frontend/extension/popup-shell.html`, `apps/frontend/extension/popup-shell.js`, `apps/frontend/extension/manifest.json`, `apps/frontend/extension/README.md`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/context.md`, `.helloagents/modules/browser_extension.md`, `.helloagents/modules/_index.md`
- **[browser_extension]**: 后端新增 `/ops-assistant` 云端 UI 静态入口和基础页面，内置服务检查、页面识别、打开页面面板、竞对房型价、建议价和商家房型读取入口；页面通过同一 `fliggy-ops-cloud-ui/v1` 协议调用插件壳能力，便于 WinSCP 上传后端文件后集中更新多台电脑看到的插件页面。
  - 文件: `apps/backend/app/main.py`, `apps/backend/app/static/ops-assistant/index.html`, `apps/backend/app/static/ops-assistant/style.css`, `apps/backend/app/static/ops-assistant/app.js`, `apps/backend/tests/test_browser_extension_assets.py`, `apps/frontend/extension/README.md`, `.helloagents/context.md`, `.helloagents/modules/browser_extension.md`, `.helloagents/modules/_index.md`
- **[browser_extension]**: 页面内“运营助手”改为加载云端 UI `http://api.aihuawise.com/ops-assistant`，右上角 Popup 保留为本地稳定备用入口；`content.js` 新增 `fliggy-ops-cloud-ui/v1` 固定消息协议、云端来源校验和 runtime 消息白名单，云端页面可通过受控动作调用插件页面采集、商家页回填和后台消息能力。
  - 方案: [202605191200_cloud-ui-extension-protocol](plan/202605191200_cloud-ui-extension-protocol/)
  - 决策: cloud-ui-extension-protocol#D001(页面 UI 云端化，插件本体保留稳定能力桥)
  - 文件: `apps/frontend/extension/content.js`, `apps/frontend/extension/manifest.json`, `apps/frontend/extension/README.md`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`, `.helloagents/modules/_index.md`
- **[browser_extension]**: 将页面内“运营助手”浮层改为 iframe 承载同一个 `popup.html`，右上角插件和页面内打开方式不同但共用同一套业务页面；`manifest.json` 增加 `popup.html` 为 web accessible resource，`content.js` 继续保留页面识别、当前页读取和本地回填消息能力。
  - 文件: `apps/frontend/extension/content.js`, `apps/frontend/extension/manifest.json`, `apps/frontend/extension/README.md`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 页面内运营助手排版进一步对齐右上角 Popup；放大标题区，统一状态卡、一级导航、二级导航、功能卡片的间距/圆角/内边距，并移除通用卡片 `pre-wrap` 导致模板缩进撑高导航卡片的问题。
  - 文件: `apps/frontend/extension/content.js`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 对齐 Popup 与页面浮层的商家改价主流程；页面浮层补齐“读取当前页房型价”入口，并改为使用当前标签页链路读取本店房型价，避免右上角插件与页面内助手内容不一致。
  - 文件: `apps/frontend/extension/content.js`, `apps/frontend/extension/README.md`, `.helloagents/modules/browser_extension.md`
- **[pricing_advice]**: 生成房型建议价时读取最近自动抓取的竞对酒店最低价趋势；当多数竞对酒店同向上涨或下跌时，建议价按本店当前价同比例上调/下调，并在 Popup 与页面浮层展示趋势锚点价和趋势摘要。
  - 文件: `apps/backend/app/services/competitor_pricing_advice_service.py`, `apps/backend/tests/test_competitor_pricing_advice_service.py`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`
- **[pricing_advice]**: 收紧无趋势时的建议价规则；当竞对趋势为持平、分化或无数据时，fallback 和 API 结果都强制保持本店当前房型价，不再用竞对均价、库存或策略拉动价格。
  - 文件: `apps/backend/app/services/competitor_pricing_advice_service.py`, `apps/backend/tests/test_competitor_pricing_advice_service.py`
- **[browser_extension]**: 同步调整 Popup 与页面右下角浮层展示；隐藏“基础功能”介绍，主按钮改为“查看竞对价格”，隐藏刷新/诊断/维护竞对入口，并将“竞对建议价”页签改为“我的价格”，趋势维度上移、生成建议价按钮下移到底部。
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 调整 Popup 和页面右下角浮层的导航与“我的价格”表单顺序；Popup 中“基础功能 / 商家改价”分组栏固定在子功能栏上方，“我的价格”的房量、兜底价、策略和指定竞对酒店输入区移动到趋势图与曲线明细之后。
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`
- **[browser_extension]**: 设置页左上角新增“返回上一页”入口；打开设置页前记录来源标签页，返回时优先切回原页面，来源标签不存在时按 URL 重开或关闭设置页兜底。
  - 文件: `apps/frontend/extension/options.html`, `apps/frontend/extension/options.js`, `apps/frontend/extension/background.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 将“商家改价”主链路默认改为飞猪平台价格页 `hotel.fliggy.com/ebooking/...batchRoomStatusUpdate?type=price`；Popup 和页面浮层默认填充该链接，按钮文案改为“一键回填建议价”，后台 payload 在链接为空时同样兜底到该平台 URL，仍保留人工确认提交。
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`, `apps/frontend/extension/background.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 将商家改价默认目标页切换到飞猪 `roomsVsManage` 页面；Popup、页面右下角浮层和后台 payload 统一兜底到该页面，后端补充“修改价格/确认提交/立即生效”等选择器并在保存后处理常见确认弹窗，继续保留生成建议价后的二次确认。
  - 方案: [202605071013_rooms-vs-manage-pricing-submit](archive/2026-05/202605071013_rooms-vs-manage-pricing-submit/)
  - 决策: rooms-vs-manage-pricing-submit#D001(使用最小可用改造切换默认改价页)
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`, `apps/frontend/extension/background.js`, `apps/backend/app/services/fliggy_merchant_service.py`, `apps/backend/app/services/merchant_portal_pricing_service.py`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 商家改价改为本地已登录浏览器优先接管；插件从当前飞猪商家后台标签页读取房型价并通过 `merchant_items` 传给后端生成建议价，二次确认后由本地 content script 在同一商家后台页面填价保存，云端不再作为默认真实改价执行环境。
  - 方案: [202605071138_local-browser-merchant-takeover](archive/2026-05/202605071138_local-browser-merchant-takeover/)
  - 决策: local-browser-merchant-takeover#D001(本地 content script 负责真实平台操作)
  - 文件: `apps/frontend/extension/content.js`, `apps/frontend/extension/background.js`, `apps/backend/app/schemas/pricing.py`, `apps/backend/app/api/plugin_routes.py`, `apps/backend/app/services/merchant_pricing_service.py`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 将商家“一键改价”收束为按不同房型结合竞对价生成建议价，用户可逐条调整最终价，并在确认摘要后再提交；统一目标价改为“高级备用：统一目标价”，避免被误用为主流程。
  - 方案: [202605051800_one-click-room-pricing-confirm](plan/202605051800_one-click-room-pricing-confirm/)
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`

### 新增
- **[market_collection]**: 恢复并重新接入飞猪游客 `storage_state` 会话链路；`/competitor/fliggy/session/login` 重新可用，列表页采集与竞对详情页房型抓取都可基于已保存的游客会话执行，不再强依赖云端 `127.0.0.1:9222` 常驻调试浏览器。
  - 文件: `apps/backend/app/api/routes.py`, `apps/backend/app/services/competitor_service.py`, `apps/backend/app/schemas/competitor.py`
- **[competitor_scheduler]**: 将竞对房型价定时调度从“按店铺逐个抓取”改为“统一游客抓取池 + `hotel_url` 去重 + 按店铺分发”；同一竞对酒店被多个店铺订阅时，云端只抓取一次，再分别写入各自 `shop_id` 的历史价格数据，供不同账号生成各自折线图和建议。
  - 方案: [202604281533_unified-competitor-dispatch](plan/202604281533_unified-competitor-dispatch/)
  - 决策: unified-competitor-dispatch#D001(采用统一采集池后按店铺分发，而非继续逐店铺抓取)
- **[competitor_scheduler]**: 新增 Celery/Redis 后端竞对房型价定时采集能力，默认每 2 小时读取启用的店铺级竞对酒店配置并写入 `hotel_room_prices`；新增 worker/beat 启动脚本。
  - 方案: [202604270949_celery-competitor-trend](archive/2026-04/202604270949_celery-competitor-trend/)
  - 决策: celery-competitor-trend#D001(采用 Celery Beat 作为后端定时调度)
- **[browser_extension]**: Popup 竞对趋势图新增趋势维度切换，支持展示主流房型最低价和竞对酒店最低价两种折线图。
  - 方案: [202604270949_celery-competitor-trend](archive/2026-04/202604270949_celery-competitor-trend/)
  - 决策: celery-competitor-trend#D002(趋势接口用参数扩展而非新增独立接口)

### 修复
- **[browser_extension]**: 将竞对趋势两小时 alarm 从“只检查云端趋势”改为“本地浏览器打开已配置竞对酒店详情页抓取房型价并同步云端，再刷新趋势和弹窗提醒”，规避云服务器访问飞猪触发 `cloud_ip_bl` 导致 `0 rooms` 的问题。
  - 文件: `apps/frontend/extension/background.js`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`
- **[browser_extension]**: 修复本地插件采集写入 `hotel_room_prices.collected_at` 时使用 UTC 的问题；现在写入本机本地时间 `YYYY-MM-DD HH:mm:ss`，避免北京时间显示少 8 小时。
  - 文件: `apps/frontend/extension/background.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[market_collection]**: 修复 Linux 云端生成飞猪游客 `storage_state` 时被 Windows DPAPI 凭据加密中断的问题；游客登录态生成现在在密码加密不可用时继续保存非密码配置与 `storage_state_name`，确保 `guest-shop-{shop_id}.json` 可生成并被两小时定时任务使用。
  - 文件: `apps/backend/app/services/competitor_service.py`, `apps/backend/tests/test_competitor_guest_login_flow.py`
- **[competitor_scheduler]**: 竞对房型价定时任务改为按 `hotel_url + storage_state_name` 分组抓取；同一竞对酒店只有在复用同一游客会话时才会去重分发，避免不同店铺错误共享抓取上下文，也避免无会话时静默返回 `0 rooms / 0 saved`。
  - 文件: `apps/backend/app/services/competitor_room_price_schedule_service.py`, `apps/backend/tests/test_competitor_room_price_schedule_service.py`
- **[browser_extension]**: `/plugin/competitor/room-prices` 新增 `collect_mode`、`storage_state_name`、游客登录参数透传，后端可显式走 `storage_state` 模式抓取竞对详情页房型价。
  - 文件: `apps/backend/app/api/plugin_routes.py`, `apps/backend/app/schemas/competitor.py`, `apps/backend/tests/test_plugin_api_routes.py`
- **[browser_extension]**: 继续压缩页面内“运营助手”卡片体积；主卡片、嵌套卡片、按钮、输入框、结果区、趋势图容器和 workflow 条目的内边距进一步缩小，使卡片高度更接近文字实际占用空间。
  - 文件: `apps/frontend/extension/content.js`
- **[browser_extension]**: 页面内“运营助手”浮层尺寸直接对齐 Popup，设置为 `400px × 780px`，并保留小屏幕 `max-height` 兜底。
  - 文件: `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 压缩页面内“运营助手”浮层的视觉空白；减小 header、导航、卡片、Banner、按钮、输入框、趋势图图例、summary 和 workflow 列表的间距与内边距，使字体和图案/卡片之间更紧凑。
  - 文件: `apps/frontend/extension/content.js`
- **[browser_extension]**: 页面内“运营助手”浮层继续对齐 Popup 排版；面板宽度、卡片、导航、按钮、输入框和工作台底部“返回结果”位置按 Popup 结构调整，页面内动作结果默认回写到工作台底部结果卡。
  - 文件: `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 页面内“运营助手”浮层补齐与 Popup 一致的竞对趋势能力；“竞对建议价”卡片新增刷新竞对趋势图、趋势维度切换、折线图、曲线明细、竞对酒店来源和配置链接展示。
  - 文件: `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 竞对趋势曲线明细补充竞对酒店来源展示；后端趋势接口的每条 `series` 现在带回 `hotel_url`，Popup 在“曲线明细”中显示“竞对酒店来源：云端历史价”和对应配置链接。
  - 文件: `apps/backend/app/services/competitor_service.py`, `apps/frontend/extension/popup.js`, `apps/backend/tests/test_competitor_service.py`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: Popup 趋势图下新增“曲线明细”列表；`主流房型最低价` 现在逐条显示“主流房型、竞对酒店、最新最低价、最新采集、变化和点数”，避免只看图例时无法确认每条曲线属于哪家酒店。
  - 文件: `apps/frontend/extension/popup.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 优化竞对趋势和提醒展示；`主流房型最低价` 折线图明确按“主流房型 + 竞对酒店”区分曲线，竞对房型明细行直接标注所属酒店，趋势时间改以云端最新采集时间为准，插件 alarm 改为检查云端趋势数据并基于价格变化/新采集批次触发通知，同时将扩展版本号提升到 `0.2.3` 便于确认加载结果。
  - 方案: [202604300908_cloud-competitor-trend-ui](archive/2026-04/202604300908_cloud-competitor-trend-ui/)
  - 决策: cloud-competitor-trend-ui#D001(保持云端采集为唯一采集来源)
- **[browser_extension]**: 页面内“运营助手”浮层同步改为和 Popup 一致的分组布局；基础功能新增“配置竞对房型价 / 竞对建议价 / 快捷动作”横向切换，商家页补齐改价 Banner，页面内旧版登录表单改为设置页引导。
  - 文件: `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 将账号登录、店铺切换、当前配置和当前页面摘要整体收拢到设置页；Popup 登录卡改为“打开设置页”的引导卡，避免工作台与配置页职责混杂。
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/options.html`, `apps/frontend/extension/options.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: “基础功能”工作台继续细分为“配置竞对房型价 / 竞对建议价 / 快捷动作”三段横向切换；点击某一模块时仅显示该模块内容，其余基础模块隐藏。
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: Popup 工作台改为“基础功能 / 商家改价”两大分组切换，原先分散的功能卡片按业务语义归类展示，布局对齐页面浮层入口。
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 将 Popup 中的“当前页面 / 当前配置”展示迁移到设置页；Popup 仅保留工作台、快捷动作和结果区，设置页新增当前配置摘要与当前窗口最近访问业务页识别结果。
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/options.html`, `apps/frontend/extension/options.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: Popup 工作台新增横向功能导航，核心功能卡片改为单页切换式入口；点击按钮后直接切到对应功能页，不再整页纵向堆叠。
  - 文件: `apps/frontend/extension/popup.html`, `apps/frontend/extension/popup.js`, `apps/backend/tests/test_browser_extension_assets.py`, `.helloagents/modules/browser_extension.md`
- **[merchant_pricing]**: 继续修复 `storage_state` 模式下 HWHT 商家价格页返回 0 条房型的问题；后端在无头会话采集未识别到房型价时，会优先尝试触发“展开全部房型”后再解析页面文本。
  - 文件: `backend/app/services/fliggy_merchant_service.py`, `.helloagents/modules/browser_extension.md`
- **[browser_extension]**: 将页面内商家改价入口恢复为单链接模式；“读取房型”和“一键改价”重新只使用已保存的 `商家价格页 URL`，不再依赖页面内多平台改价链接配置。
  - 文件: `browser-extension/content.js`, `.helloagents/modules/browser_extension.md`
- **[merchant_pricing]**: 修复商家房型读取在 `prefer_cdp` 成功连接但解析结果为空时仍直接返回全 0 统计的问题；后端现在会把 CDP 空结果视为无效采集，并继续回退到 `storage_state` 会话链路。
  - 方案: [202604181200_merchant-pricing-cdp-empty-fallback](archive/2026-04/202604181200_merchant-pricing-cdp-empty-fallback/)
- **[browser_extension]**: 修复商家价格页“读取房型”在已到 `https://ebooking.hwht.com/price/manage` 但房型表延迟渲染时返回 0 条的问题；后端商家采集链路现在会在 CDP 和 storage_state 模式下短轮询等待可解析房型文本，再执行房型提取。
  - 方案: [202604181115_merchant-pricing-readiness-fix](archive/2026-04/202604181115_merchant-pricing-readiness-fix/)

### 测试
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/content.js`、`node --check apps/frontend/extension/popup.js` 与 `apps/backend/.venv/Scripts/python.exe -m pytest -q apps/backend/tests/test_browser_extension_assets.py`，确认统一 Popup iframe 入口后脚本语法和扩展资源断言通过（`2 passed`）。
  - 文件: `apps/frontend/extension/content.js`, `apps/frontend/extension/popup.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/content.js` 与 `apps/backend/.venv/Scripts/python.exe -m pytest -q apps/backend/tests/test_browser_extension_assets.py`，确认页面浮层排版对齐后脚本语法和扩展资源断言通过（`2 passed`）。
  - 文件: `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/content.js` 与 `apps/backend/.venv/Scripts/python.exe -m pytest -q apps/backend/tests/test_browser_extension_assets.py`，确认页面浮层商家改价入口同步后脚本语法和扩展资源断言通过（`2 passed`）。
  - 文件: `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/popup.js` 与 `node --check apps/frontend/extension/content.js`，确认 Popup 与页面浮层展示调整后脚本语法正常。
  - 文件: `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/popup.js`、`node --check apps/frontend/extension/content.js`、`node --check apps/frontend/extension/background.js`，并运行 `pytest -q tests/test_browser_extension_assets.py tests/test_plugin_api_routes.py tests/test_merchant_pricing_service.py`（`37 passed`）与完整后端测试（`170 passed`），未执行真实商家后台提交。
  - 文件: `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`, `apps/frontend/extension/background.js`, `apps/backend/tests/test_browser_extension_assets.py`

- **[browser_extension]**: 执行 `node --check apps/frontend/extension/background.js`、`node --check apps/frontend/extension/popup.js`、`node --check apps/frontend/extension/content.js` 与浏览器扩展资源断言，确认本地两小时采集同步云端逻辑可加载。
  - 文件: `apps/frontend/extension/background.js`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[market_collection]**: 执行 `pytest -q apps/backend/tests/test_competitor_guest_login_flow.py apps/backend/tests/test_competitor_room_price_schedule_service.py apps/backend/tests/test_plugin_api_routes.py apps/backend/tests/test_competitor_service.py`，确认 Linux DPAPI 降级、游客会话、定时调度和插件路由回归通过（`67 passed`）。
  - 文件: `apps/backend/tests/test_competitor_guest_login_flow.py`, `apps/backend/tests/test_competitor_room_price_schedule_service.py`, `apps/backend/tests/test_plugin_api_routes.py`, `apps/backend/tests/test_competitor_service.py`
- **[market_collection]**: 执行 `pytest -q apps/backend/tests/test_competitor_guest_login_flow.py apps/backend/tests/test_competitor_room_price_schedule_service.py apps/backend/tests/test_plugin_api_routes.py apps/backend/tests/test_competitor_service.py`，确认游客会话恢复、`storage_state` 抓取、定时调度分组和插件路由透传全部通过（`66 passed`）。
  - 文件: `apps/backend/tests/test_competitor_guest_login_flow.py`, `apps/backend/tests/test_competitor_room_price_schedule_service.py`, `apps/backend/tests/test_plugin_api_routes.py`, `apps/backend/tests/test_competitor_service.py`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/popup.js`、`node --check apps/frontend/extension/background.js` 与 `pytest -q apps/backend/tests/test_browser_extension_assets.py apps/backend/tests/test_competitor_service.py apps/backend/tests/test_plugin_api_routes.py`，确认云端趋势展示、插件提醒检查和相关趋势接口回归通过（`47 passed`）。
  - 文件: `apps/frontend/extension/popup.js`, `apps/frontend/extension/background.js`, `apps/frontend/extension/manifest.json`, `apps/backend/tests/test_browser_extension_assets.py`
- **[competitor_scheduler]**: 执行 `pytest -q tests/test_competitor_room_price_schedule_service.py tests/test_plugin_api_routes.py` 与 `pytest -q tests`，确认统一抓取去重、按店铺分发、趋势图店铺隔离回归和后端全量测试全部通过（`25 passed`、`168 passed`）。
  - 文件: `apps/backend/tests/test_competitor_room_price_schedule_service.py`, `apps/backend/tests/test_plugin_api_routes.py`, `apps/backend/app/services/competitor_room_price_schedule_service.py`, `apps/backend/app/services/competitor_service.py`
- **[competitor_scheduler]**: 执行 `pytest` 定向覆盖调度服务、插件趋势路由、竞对趋势聚合和插件资产断言；执行 `node --check` 验证 `background.js` 与 `popup.js` 语法；执行 Celery app 导入检查和 PowerShell 脚本语法检查。
  - 文件: `apps/backend/tests/test_competitor_room_price_schedule_service.py`, `apps/backend/tests/test_plugin_api_routes.py`, `apps/backend/tests/test_competitor_service.py`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/content.js` 与 `py -X utf8 -m unittest apps/backend/tests/test_browser_extension_assets.py`，确认页面内运营助手新版分组布局和资源断言通过。
  - 文件: `apps/frontend/extension/content.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/popup.js`、`node --check apps/frontend/extension/options.js` 与 `py -X utf8 -m unittest apps/backend/tests/test_browser_extension_assets.py`，确认设置页接管登录、Popup 基础功能子切换和资源断言通过。
  - 文件: `apps/frontend/extension/popup.js`, `apps/frontend/extension/options.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/popup.js` 与 `py -X utf8 -m unittest apps/backend/tests/test_browser_extension_assets.py`，确认 Popup 分组布局切换和资源断言通过。
  - 文件: `apps/frontend/extension/popup.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/popup.js`、`node --check apps/frontend/extension/options.js` 与 `py -X utf8 -m unittest apps/backend/tests/test_browser_extension_assets.py`，确认 Popup 收敛与设置页摘要迁移后的脚本和资源断言通过。
  - 文件: `apps/frontend/extension/popup.js`, `apps/frontend/extension/options.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[browser_extension]**: 执行 `node --check apps/frontend/extension/popup.js` 与 `py -X utf8 -m unittest apps/backend/tests/test_browser_extension_assets.py`，确认 Popup 横向功能导航语法正常且插件资源断言通过。
  - 文件: `apps/frontend/extension/popup.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[merchant_pricing]**: 执行 `py -X utf8 -m unittest backend.tests.test_fliggy_merchant_service` 与 `py -X utf8 -m unittest backend.tests.test_merchant_pricing_service`，确认“展开全部房型”补丁与上层商家定价服务回归通过。
  - 文件: `backend/tests/test_fliggy_merchant_service.py`, `backend/tests/test_merchant_pricing_service.py`
- **[browser_extension]**: 执行 `node --check browser-extension/content.js` 与 `py -X utf8 -m unittest backend.tests.test_browser_extension_assets`，确认页面内商家入口已回退为单链接模式且插件资源断言通过。
  - 文件: `browser-extension/content.js`, `backend/tests/test_browser_extension_assets.py`
- **[merchant_pricing]**: 执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -X utf8 -m pytest -q backend/tests/test_fliggy_merchant_service.py` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -X utf8 -m pytest -q backend/tests/test_merchant_pricing_service.py`，结果分别为 `24 passed` 与 `15 passed`。
  - 文件: `backend/tests/test_fliggy_merchant_service.py`, `backend/tests/test_merchant_pricing_service.py`
- **[browser_extension]**: 执行 `py -X utf8 -m unittest backend.tests.test_fliggy_merchant_service` 与 `py -X utf8 -m unittest backend.tests.test_merchant_pricing_service`，确认商家房型读取服务和上层商家定价服务均通过回归。
  - 文件: `backend/tests/test_fliggy_merchant_service.py`, `backend/tests/test_merchant_pricing_service.py`

## [Unreleased] - 2026-04-16

### ??
- **[browser_extension]**: ?? Popup ???????????????????? `manualRoomMappings` ??????????????? `merchant_price_mappings`??????????????????????????????????????????? `0 ?` ?????????????
  - ??: `browser-extension/content.js`, `browser-extension/popup.js`

### ??
- **[browser_extension]**: ?? `node --check browser-extension/content.js`?`node --check browser-extension/popup.js`?`py -X utf8 -m unittest backend.tests.test_browser_extension_assets`??????
  - ??: `browser-extension/content.js`, `browser-extension/popup.js`, `backend/tests/test_browser_extension_assets.py`

## [Unreleased] - 2026-04-15

### 修复
- **[scripts]**: 统一项目启动/状态/停止脚本的 PID 识别链路；`start_project.ps1` 现会在健康检查成功后回写实际监听 `8000` 的服务 PID，`status_project.ps1` 以端口监听进程为准并显示 stale/mismatch 提示，`stop_project.ps1` 同时兜底 pid 文件与端口进程，避免状态误报与停服遗漏。
  - 文件: `start_project.ps1`, `status_project.ps1`, `stop_project.ps1`

### 测试
- **[scripts]**: 执行 `status_project.ps1` → `stop_project.ps1` → `status_project.ps1` → `start_project.ps1` → `status_project.ps1`，确认停服后状态为 `stopped`，重启后 `PID` 与 `backend/.flask.pid` 一致，且 `/health`、`/plugin/service-status` 均返回 `200`。
  - 文件: `.helloagents/CHANGELOG.md`

## [0.6.1] - 2026-04-14

### 新增
- **[browser_extension]**: Popup 新增独立“竞对建议价”卡片；先抓取配置竞对酒店房型价，再手工输入总房量、可售房量、当前售价和策略，即可调用新桥接接口 `/plugin/pricing/competitor-advice-preview`，结合数据库历史价与通义生成建议价、调价幅度、竞对对比和理由。
  - 文件: `browser-extension/popup.html`, `browser-extension/popup.js`, `browser-extension/background.js`, `backend/app/api/plugin_routes.py`, `backend/app/services/competitor_pricing_advice_service.py`, `backend/app/schemas/pricing.py`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check browser-extension/background.js`、`node --check browser-extension/popup.js`、`py -X utf8 -m py_compile backend/app/schemas/pricing.py backend/app/services/competitor_pricing_advice_service.py backend/app/api/plugin_routes.py`、`py -X utf8 -m unittest tests.test_browser_extension_assets tests.test_plugin_api_routes`；资源断言通过，插件路由测试在当前环境因缺 Flask 被跳过。
  - 文件: `backend/tests/test_browser_extension_assets.py`, `backend/tests/test_plugin_api_routes.py`
## [0.6.0] - 2026-04-14

### 新增
- **[browser_extension]**: 浏览器插件升级为“先登录再使用”的多店铺模式；后端新增插件 Bearer Token 鉴权、当前店铺切换与店铺级竞对酒店配置接口，Popup/设置页/页面浮层统一感知当前账号与当前店铺，竞对酒店配置按店铺保存到数据库。
  - 方案: [202604141113_plugin-multi-shop-auth](archive/2026-04/202604141113_plugin-multi-shop-auth/)
  - 决策: plugin-multi-shop-auth#D001(插件登录态采用 Bearer Token), plugin-multi-shop-auth#D002(竞对酒店配置迁移到数据库)

### 快速修改
- **[browser_extension]**: 修复页面内运营助手登录态读取会触发 `configUpdatedAt` 自循环刷新的问题，避免 `/plugin/auth/me` 被高频轮询后最终超时卡住。 + 类型: 缺陷修复 + 文件: `browser-extension/background.js`- **[browser_extension]**: 修复竞对详情页抓取在 `hotel.alitrip.com` 等慢注入页面上过早发送房型价消息的问题；后台现在会先等待内容脚本接收端就绪，再读取 `GET_CURRENT_HOTEL_ROOM_PRICES`。 + 类型: 缺陷修复 + 文件: `browser-extension/background.js`
### 测试
- **[browser_extension]**: 执行 `node --check browser-extension/bridge.js`、`node --check browser-extension/content.js`、`node --check browser-extension/popup.js`、`py -X utf8 -m unittest backend.tests.test_browser_extension_assets`、`py -X utf8 -m unittest backend.tests.test_plugin_api_routes`；其中资源测试通过，插件路由测试在当前环境因缺 Flask 被整体跳过。
  - 文件: `backend/tests/test_browser_extension_assets.py`, `backend/tests/test_plugin_api_routes.py`

## [0.5.26] - 2026-04-14

### 修复
- **[browser_extension]**: 继续修复飞猪插件“按当前页采集”少采、错采和目标酒店漏采的问题；内容脚本现在会排除“我浏览过的酒店”侧栏干扰，补充基于页面正文顺序的列表酒店/价格解析，并收紧价格上下文判断，避免把 `200米` 这类地址数字误识别为房价。
  - 文件: `browser-extension/content/page-context.js`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/page-context.js`、`node --check D:/agongzuo/AI PoC/browser-extension/popup.js`、`node --check D:/agongzuo/AI PoC/browser-extension/content.js`、`py -X utf8 -m unittest backend.tests.test_browser_extension_assets`，并在真实飞猪列表页通过 CDP 注入 `page-context.js` 验证已抓到 `郑州中油花园酒店（CBD会展中心店）` 与 `¥635`。
  - 文件: `.helloagents/CHANGELOG.md`

### 优化
- **[browser_extension]**: 当前页采集进一步优先使用飞猪真实 `list-row` 列表行做酒店名/价格绑定，正文顺序解析仅保留为兜底，减少列表页价格串位和营销标签混入酒店名的问题。
  - 文件: `browser-extension/content/page-context.js`, `.helloagents/modules/browser_extension.md`

## [0.5.25] - 2026-04-14

### 修复
- **[browser_extension]**: 修复浏览器插件“按当前页采集”对手工目标酒店漏采的问题；当前页快照不再为了手工目标改写列表页搜索状态，而是把目标酒店名作为 DOM 补抓提示一起采集当前页全部酒店。同时后端 `extension_page` 对命中手工目标的弱信号候选放宽保留条件，减少页面上肉眼可见酒店却被漏掉的情况。
  - 文件: `browser-extension/popup.js`, `browser-extension/content.js`, `browser-extension/content/page-context.js`, `backend/app/services/competitor_service.py`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 补充当前页目标酒店弱信号保留回归与扩展资源断言，并执行 `py -X utf8 -m unittest backend.tests.test_competitor_service`、`py -X utf8 -m unittest backend.tests.test_browser_extension_assets`。
  - 文件: `backend/tests/test_competitor_service.py`, `backend/tests/test_browser_extension_assets.py`

## [0.5.24] - 2026-04-13

### ??
- **[merchant_pricing]**: ??? `collect_mode/debug_url` ???????/??????????????????????????`refresh_merchant_mapping_prices` ???????????????????????? `NameError`?
  - ??: `backend/app/services/merchant_pricing_service.py`, `backend/app/api/routes.py`

## [0.5.23] - 2026-04-13

### ??
- **[browser_extension]**: ?????????????/?????? `collect_mode` ? `debug_url` ????????????????????????????? `cdp_current_page` ????????????????????????? payload??? schema?plugin route ? merchant pricing service ????????????
  - ??: `browser-extension/background.js`, `backend/app/schemas/pricing.py`, `backend/app/api/plugin_routes.py`, `backend/app/services/merchant_pricing_service.py`

### ??
- **[merchant_pricing]**: ?? `node --check D:/agongzuo/AI PoC/browser-extension/background.js`?`python -m pytest -q backend/tests/test_plugin_api_routes.py -k 'merchant_pricing_preview or merchant_pricing_direct_submit'`???????/??????? `collect_mode/debug_url`?
  - ??: `backend/tests/test_plugin_api_routes.py`, `.helloagents/CHANGELOG.md`

## [0.5.22] - 2026-04-13

### ??
- **[browser_extension]**: ?????????????????/????????????????????? 30 ?????????????`background.js` ????????????????????????????????????? `????: /plugin/pricing/merchant-preview`?
  - ??: `browser-extension/background.js`

### ??
- **[browser_extension]**: ?? `node --check D:/agongzuo/AI PoC/browser-extension/background.js`???? `start_fliggy_extension_edge.ps1` ??????????
  - ??: `browser-extension/background.js`, `.helloagents/CHANGELOG.md`

## [0.5.21] - 2026-04-13

### ??
- **[merchant_pricing]**: ????????????????? `prefer_cdp/cdp_current_page` ?????? `storage_state_used` ????? `KeyError`????? `/plugin/pricing/merchant-preview` ?? 500 ???????????? `storage_state_used` ????????
  - ??: `backend/app/services/fliggy_merchant_service.py`

### ??
- **[merchant_pricing]**: ?? CDP ???? `storage_state_used` ????????? `python -m pytest -q backend/tests/test_fliggy_merchant_service.py -k preview_fliggy_merchant_prices`?
  - ??: `backend/tests/test_fliggy_merchant_service.py`, `.helloagents/CHANGELOG.md`

## [0.5.20] - 2026-04-13

### ??
- **[browser_extension]**: ????????????????????/??/status/gid/hid???????????????????????? `last_seen_price`?????????????????????
  - ??: `browser-extension/content.js`

### ??
- **[browser_extension]**: ?? `node --check D:/agongzuo/AI PoC/browser-extension/content.js`???? `start_fliggy_extension_edge.ps1` ??????????
  - ??: `browser-extension/content.js`, `.helloagents/CHANGELOG.md`

## [0.5.19] - 2026-04-13

### ??
- **[browser_extension]**: ??????????????????? background ???? `content.js` ????????? `TypeError: Failed to fetch` ????fallback ??????? `bridge.js`?? bridge ???? `/pricing/merchant-mappings`?`/pricing/merchant-mappings/refresh-prices` ??????????????????????????
  - ??: `browser-extension/bridge.js`, `browser-extension/content.js`

### ??
- **[browser_extension]**: ?? `node --check D:/agongzuo/AI PoC/browser-extension/bridge.js`?`node --check D:/agongzuo/AI PoC/browser-extension/content.js`???? `start_fliggy_extension_edge.ps1` ??????????
  - ??: `browser-extension/bridge.js`, `browser-extension/content.js`, `.helloagents/CHANGELOG.md`

## [0.5.18] - 2026-04-13

### ??
- **[browser_extension]**: ??????????????? background ????????????/??????????? `Unsupported message type: MERCHANT_MAPPING_REFRESH` ????`content.js` ?????????? background ??????????? HTTP ?? `/pricing/merchant-mappings` ? `/pricing/merchant-mappings/refresh-prices`??????????????????????
  - ??: `browser-extension/content.js`

### ??
- **[browser_extension]**: ?? `node --check D:/agongzuo/AI PoC/browser-extension/content.js`???? `start_fliggy_extension_edge.ps1` ????????? `D:/agongzuo/fliggy-extension`?
  - ??: `browser-extension/content.js`, `.helloagents/CHANGELOG.md`

## [0.2.4] - 2026-04-11

### ??
- **[market_collection]**: ????????????? `/plugin/competitor/room-prices` ? 500 ???????? `competitor_service.py` ?? JS ?? `split('\n')` ????????????????????? `Playwright page.evaluate` ?????????????????????????????
  - ??: `backend/app/services/competitor_service.py`
  - ??: ?? `page.evaluate(_FLIGGY_ROOM_JS)` ?????`pytest backend/tests/test_plugin_api_routes.py -k competitor_room_prices -q` ??????????? 200?

﻿## [0.5.17] - 2026-04-09

### 新增
- **[browser_extension]**: 浏览器插件设置页新增“竞对酒店配置”，支持保存多条“酒店名称 + 详情页 URL”；Popup 新增“抓取配置房型价”入口，可直接批量抓取配置酒店下所有可见房型/价型的实时价格，并通过新桥接接口 `/plugin/competitor/room-prices` 返回结果。
  - 文件: `browser-extension/options.html`, `browser-extension/options.js`, `browser-extension/popup.html`, `browser-extension/popup.js`, `browser-extension/background.js`, `backend/app/api/plugin_routes.py`, `backend/app/services/competitor_service.py`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 补充插件房型价桥接接口与资源断言回归，并执行 `node --check D:/agongzuo/AI PoC/browser-extension/background.js`、`node --check D:/agongzuo/AI PoC/browser-extension/popup.js`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m py_compile D:/agongzuo/AI PoC/backend/app/api/plugin_routes.py D:/agongzuo/AI PoC/backend/app/services/competitor_service.py`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py`。
  - 文件: `backend/tests/test_plugin_api_routes.py`, `backend/tests/test_browser_extension_assets.py`
## [0.5.16] - 2026-04-09

### 优化
- **[browser_extension]**: 浏览器插件 `extension_page` 当前页采集新增“指定酒店优先搜索”前置步骤；当列表页存在可用搜索框时，内容脚本会先把目标酒店名输入并触发搜索，再执行自动滚动和多页采集，尽量把结果范围收窄到指定酒店附近。
  - 文件: `browser-extension/content/page-context.js`, `browser-extension/content.js`, `browser-extension/popup.js`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/page-context.js`、`node --check D:/agongzuo/AI PoC/browser-extension/content.js`、`node --check D:/agongzuo/AI PoC/browser-extension/popup.js`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py`，结果 `2 passed`。
  - 文件: `backend/tests/test_browser_extension_assets.py`
## [0.5.15] - 2026-04-09

### 优化
- **[browser_extension]**: 将浏览器插件 `extension_page` 当前页采集升级为异步多页快照；内容脚本现在会先自动滚动补抓当前列表页的懒加载酒店，再按页尝试点击“下一页”并汇总候选酒店，避免只采到首屏十几条卡片时漏掉目标酒店。
  - 文件: `browser-extension/content/page-context.js`, `browser-extension/content.js`, `browser-extension/popup.js`, `browser-extension/background.js`, `backend/app/services/competitor_service.py`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/page-context.js`、`node --check D:/agongzuo/AI PoC/browser-extension/content.js`、`node --check D:/agongzuo/AI PoC/browser-extension/popup.js`、`node --check D:/agongzuo/AI PoC/browser-extension/background.js`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m py_compile D:/agongzuo/AI PoC/backend/app/services/competitor_service.py D:/agongzuo/AI PoC/backend/app/api/plugin_routes.py`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py`，结果 `12 passed`。
  - 文件: `backend/tests/test_plugin_api_routes.py`, `backend/tests/test_browser_extension_assets.py`
## [0.5.14] - 2026-04-09

### 修复
- **[browser_extension]**: 继续修复浏览器插件 `extension_page` 当前页采集仍会误抓 SEO 聚合块和航线价的问题；`page-context` 现在改为优先从真实酒店详情链接反推卡片容器，泛酒店链接仅作兜底，同时前端会直接过滤航线日期文本、链接过多的大容器和弱酒店名候选，减少 `郑州酒店信息`、`三亚 - 郑州05月19日810` 这类噪声进入后端。
  - 文件: `browser-extension/content/page-context.js`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/page-context.js`。
  - 文件: `browser-extension/content/page-context.js`
## [0.5.13] - 2026-04-09

### 修复
- **[browser_extension]**: 修复浏览器插件当前页城市识别仍优先信 URL 参数的问题；现在 `page-context` 会优先读取页面当前可见城市，再回退 URL 参数和标题推断，并在采集结果摘要中直接展示当前识别城市，便于定位飞猪前端切城但 URL 未及时刷新的场景。
  - 文件: `browser-extension/content/page-context.js`, `browser-extension/content/result-view.js`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/page-context.js` 与 `node --check D:/agongzuo/AI PoC/browser-extension/content/result-view.js`。
  - 文件: `browser-extension/content/page-context.js`, `browser-extension/content/result-view.js`
## [0.5.12] - 2026-04-09

### 修复
- **[browser_extension]**: 继续修复浏览器插件 `extension_page` 当前页采集噪声过多和错城市误采问题；前端页面提取现在会排除“国内酒店推荐 / 北京酒店信息”这类聚合文案块，后端会在当前页城市与指定酒店城市明显冲突时返回明确提示，避免在北京列表页继续采“郑州中油花园酒店”这类目标。
  - 文件: `browser-extension/content/page-context.js`, `browser-extension/content/result-view.js`, `backend/app/services/competitor_service.py`, `backend/tests/test_competitor_service.py`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/page-context.js`、`node --check D:/agongzuo/AI PoC/browser-extension/content/result-view.js` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_competitor_service.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py`，结果 `32 passed`。
  - 文件: `backend/tests/test_competitor_service.py`, `backend/tests/test_plugin_api_routes.py`, `backend/tests/test_browser_extension_assets.py`
## [0.5.11] - 2026-04-09

### 修复
- **[browser_extension]**: 继续修复浏览器插件 `extension_page` 当前页采集的目标酒店漏匹配问题；后端“指定酒店”过滤不再只看候选 `name`，也会同时检查 `signals.title` 与 `signals.snippet`，减少列表卡片标题被截短时的漏命中。同时结果区会优先展示 `target_hotel_name_mismatch` 样例并扩展更多明细，方便直接看到真正未命中的酒店候选。
  - 文件: `backend/app/services/competitor_service.py`, `browser-extension/content/result-view.js`, `backend/tests/test_competitor_service.py`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/result-view.js` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_competitor_service.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py`，结果 `31 passed`。
  - 文件: `backend/tests/test_competitor_service.py`, `backend/tests/test_plugin_api_routes.py`, `backend/tests/test_browser_extension_assets.py`
## [0.5.10] - 2026-04-09

### 修复
- **[browser_extension]**: 修复浏览器插件 `extension_page` 当前页采集会在“指定酒店”过滤前就被 `max_hotels` 截断的问题；现在会先保留足够候选再做目标酒店筛选，避免只有 1 个指定酒店时把真实目标提前截掉。同时补充插件结果区的过滤样例详情，直接展示被过滤酒店名、价格和原因，便于定位页面规则问题。
  - 文件: `backend/app/services/competitor_service.py`, `browser-extension/content/result-view.js`, `backend/tests/test_competitor_service.py`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/result-view.js` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_competitor_service.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py`，结果 `30 passed`。
  - 文件: `backend/tests/test_competitor_service.py`, `backend/tests/test_plugin_api_routes.py`, `backend/tests/test_browser_extension_assets.py`
## [0.5.9] - 2026-04-09

### 修复
- **[browser_extension]**: 修复浏览器插件 `extension_page` 当前页采集中“指定酒店”名称命中过严的问题；后端筛选现在同时兼容核心店名、分店尾缀和更短的候选卡片名，像 `郑州中油花园酒店` 与 `中油花园酒店（CBD会展中心店）` 这类名称差异也能正确命中并保留价格结果。
  - 文件: `backend/app/services/competitor_service.py`, `backend/tests/test_competitor_service.py`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/page-context.js` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_competitor_service.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py`，结果 `29 passed`。
  - 文件: `backend/tests/test_competitor_service.py`, `backend/tests/test_plugin_api_routes.py`, `backend/tests/test_browser_extension_assets.py`
## [0.5.8] - 2026-04-09

### 修复
- **[browser_extension]**: 修复浏览器插件“按当前页采集”在部分飞猪列表页拿不到候选酒店卡片、结果直接 `Raw Rows: 0` 的问题；前端页面快照提取已改为更宽的卡片选择器、更稳的价格信号打分，并在必要时回退到页面文本附近的酒店名/价格配对，优先把更可信的价格传给后端 `extension_page` 链路。
  - 文件: `browser-extension/content/page-context.js`, `browser-extension/README.md`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 执行 `node --check D:/agongzuo/AI PoC/browser-extension/content/page-context.js` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py`。
  - 文件: `backend/tests/test_browser_extension_assets.py`, `backend/tests/test_plugin_api_routes.py`
## [0.5.7] - 2026-04-09

### 优化
- **[browser_extension]**: 插件“读取竞对价格”从读取历史快照改为实时抓取当前已登录飞猪页面后再展示，并默认同步保存到 `competitor_snapshots`；Popup 与右下角浮层都会把当前页上下文和目标酒店一起传给插件后端，实时结果仍复用现有展示结构返回。
  - 文件: `browser-extension/background.js`, `browser-extension/popup.js`, `browser-extension/content.js`, `backend/app/api/plugin_routes.py`, `browser-extension/README.md`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 新增插件实时抓取最新价接口回归测试，并执行 `node --check D:/agongzuo/AI PoC/browser-extension/background.js`、`node --check D:/agongzuo/AI PoC/browser-extension/popup.js`、`node --check D:/agongzuo/AI PoC/browser-extension/content.js`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py`。
  - 文件: `backend/tests/test_plugin_api_routes.py`, `backend/tests/test_browser_extension_assets.py`
## [0.5.6] - 2026-04-09

### 优化
- **[browser_extension]**: 右下角“运营助手”浮层补出插件功能入口，除保留原有页面识别、最新价格、当前页采集和设置外，新增游客抓价、最新价格页面、建议价分析、改价工作台、商家连接、商家抓价、价格映射与执行改价等快捷入口，让页面内图标也能承接插件核心能力展示。
  - 文件: `browser-extension/content.js`, `browser-extension/README.md`, `.helloagents/modules/browser_extension.md`

### 测试
- **[browser_extension]**: 扩展页面浮层能力入口断言，并执行 `node --check D:/agongzuo/AI PoC/browser-extension/content.js` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py`。
  - 文件: `backend/tests/test_browser_extension_assets.py`
## [0.5.5] - 2026-04-06

### 优化
- **[browser_extension]**: 浏览器插件补入真实商家改价动作，Popup 现在可直接执行“抓取改价预览”“一键按建议价推 OTA”，并在结果区对预览房型勾选、编辑最终价后直接执行“按当前最终价推 OTA”，不再只提供页面跳转；同时收紧当前页价格卡片提取逻辑，并将显式价格信号透传到后端；本轮进一步把价格提取升级为按语义打分，优先选择“每晚/起/预订”类价格，尽量避开优惠券、立减、原价等干扰值，降低自动抓价误判。
  - 文件: `backend/app/api/plugin_routes.py`, `backend/app/services/competitor_service.py`, `browser-extension/background.js`, `browser-extension/popup.html`, `browser-extension/popup.js`, `browser-extension/content/page-context.js`, `browser-extension/README.md`

### 测试
- **[browser_extension]**: 扩展插件资源与桥接接口测试，新增商家改价预览/直提桥接断言；并执行 `node --check D:/agongzuo/AI PoC/browser-extension/background.js`、`node --check D:/agongzuo/AI PoC/browser-extension/popup.js`、`node --check D:/agongzuo/AI PoC/browser-extension/content/page-context.js`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py`，结果 `8 passed`。
  - 文件: `backend/tests/test_browser_extension_assets.py`, `backend/tests/test_plugin_api_routes.py`
## [0.5.4] - 2026-04-06

### 优化
- **[browser_extension]**: 将浏览器插件 Popup 重构为统一入口工作台；轻量动作继续在插件内直接执行，市场能力与商家改价等重型流程改为通过 `OPEN_PROJECT_PAGE` 统一跳转到现有项目页面，形成“插件统一入口 + 原有页面承接复杂流程”的覆盖方式。
  - 文件: `browser-extension/background.js`, `browser-extension/popup.html`, `browser-extension/popup.js`, `browser-extension/README.md`

### 测试
- **[browser_extension]**: 扩展浏览器插件资源断言，新增统一入口工作台与项目页跳转协议检查；并执行 `node --check D:/agongzuo/AI PoC/browser-extension/background.js`、`node --check D:/agongzuo/AI PoC/browser-extension/popup.js`、`node --check D:/agongzuo/AI PoC/browser-extension/content.js`、`node --check D:/agongzuo/AI PoC/browser-extension/content/result-view.js`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py`，结果 `6 passed`。
  - 文件: `backend/tests/test_browser_extension_assets.py`
## [0.5.3] - 2026-04-06

### 修复
- **[browser_extension]**: 修复浏览器插件“按当前页采集”只在前端本地筛选展示、未真正调用后端插件接口的问题；现在 Popup 与页面浮层都会通过 `RUN_COLLECT` 走 `background.js -> /plugin/fliggy/collect` 的真实采集链路，并在插件内展示真实采集结果。
  - 文件: `browser-extension/content.js`, `browser-extension/popup.js`, `browser-extension/content/result-view.js`

### 测试
- **[browser_extension]**: 更新浏览器插件资源断言，校验 Popup 与页面浮层都已接入 `RUN_COLLECT`；并执行 `node --check browser-extension/background.js`、`node --check browser-extension/content.js`、`node --check browser-extension/popup.js`、`node --check browser-extension/content/result-view.js`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py`，结果 `6 passed`。
  - 文件: `backend/tests/test_browser_extension_assets.py`
## [0.5.2] - 2026-04-06

### 测试
- **[fliggy_plugin]**: 补充 `merchant_credentials_save` 桥接断言，确认插件会将商家凭据写入请求正确转发到 `POST /merchant/credentials`；同时按 `.mcp.json` 实测拉起 `fliggy_ops_mcp_server.py`，`startup_ok=True`，验证真实 MCP stdio 启动链路可用。
  - 文件: `backend/tests/test_fliggy_ops_mcp_server.py`, `plugins/fliggy-ops/.mcp.json`, `plugins/fliggy-ops/scripts/fliggy_ops_mcp_server.py`
## [0.5.1] - 2026-04-06

### 修复
- **[fliggy_plugin]**: 修复 `fliggy-ops` 桥接层将商家采价预览/采集默认锁定为 `cdp_current_page` 的问题；现在默认改为 `prefer_cdp`，会在 `9222` 不可用时回退到已保存的商家会话。
  - 文件: `plugins/fliggy-ops/scripts/fliggy_ops_mcp_server.py`

### 测试
- **[fliggy_plugin]**: 新增桥接层默认值回归断言，并执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest D:/agongzuo/AI PoC/backend/tests/test_fliggy_ops_mcp_server.py`；同时实测 `merchant_price_preview`、`merchant_pricing_preview`、`merchant_pricing_generate(preview_only=true)` 均返回 `200 success`。
  - 文件: `backend/tests/test_fliggy_ops_mcp_server.py`
## [0.5.0] - 2026-04-06

### 新增
- **[fliggy_plugin]**: 补齐 `fliggy-ops` 插件 MCP bridge 对当前项目主要能力的覆盖，新增房态分析、定价推荐、商家凭据、商家会话、商家映射、商家改价流程和控制台页面快捷打开工具。
  - 方案包: [202604060913_fliggy-ops-plugin-coverage](archive/2026-04/202604060913_fliggy-ops-plugin-coverage/)
  - 决策: fliggy-ops-plugin-coverage#D001(优先扩展 MCP bridge，而不是新增独立插件 API 门面)

### 测试
- **[fliggy_plugin]**: 执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest D:/agongzuo/AI PoC/backend/tests/test_fliggy_ops_mcp_server.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py`，结果 `10 passed`；并验证 backend 健康可用，MCP server 进程可正常启动。
  - 文件: `backend/tests/test_fliggy_ops_mcp_server.py`, `backend/tests/test_plugin_api_routes.py`
## [0.4.23] - 2026-04-03

### 修复
- **[browser_extension]**: 修复浏览器插件“按当前页采集”仍错误走 `cdp_current_page` 并强依赖 `http://127.0.0.1:9222` 的问题；现在插件优先走 `extension_page` 模式，直接从当前标签页提取候选酒店卡片并交给后端归一化与保存。
  - 文件: `browser-extension/background.js`, `browser-extension/content.js`, `browser-extension/content/page-context.js`, `browser-extension/popup.js`, `backend/app/api/plugin_routes.py`, `backend/app/schemas/competitor.py`, `backend/app/services/competitor_service.py`

### 测试
- **[browser_extension]**: 执行 `node --check browser-extension/background.js`、`node --check browser-extension/content.js`、`node --check browser-extension/popup.js`、`node --check browser-extension/content/page-context.js`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q backend/tests/test_plugin_api_routes.py`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q tests/test_browser_extension_assets.py`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q tests/test_app_route_smoke.py`，结果通过。
  - 文件: `backend/tests/test_plugin_api_routes.py`, `backend/tests/test_browser_extension_assets.py`, `backend/tests/test_app_route_smoke.py`
## [0.4.22] - 2026-04-03

### 优化
- **[browser_extension]**: 将飞猪运营助手整理为更适合浏览器插件使用的结构，新增 Popup 总入口、内容脚本拆分和页面浮层装配层，并保持现有插件接口兼容。
  - 方案包: [202604030904_browser-extension-pluginization](archive/2026-04/202604030904_browser-extension-pluginization/)
  - 决策: browser-extension-pluginization#D001(保留现有插件骨架并做职责拆分)
  - 决策: browser-extension-pluginization#D002(Popup 作为总入口，页面浮层作为就地操作层)
  - 决策: browser-extension-pluginization#D003(后端接口优先复用，新增接口只做最小增补)

### 测试
- **[browser_extension]**: 执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q D:/agongzuo/AI PoC/backend/tests/test_browser_extension_assets.py D:/agongzuo/AI PoC/backend/tests/test_plugin_api_routes.py D:/agongzuo/AI PoC/backend/tests/test_app_route_smoke.py`，结果 `7 passed`。
  - 文件: `backend/tests/test_browser_extension_assets.py`, `backend/tests/test_plugin_api_routes.py`, `backend/tests/test_app_route_smoke.py`
## [0.4.21] - 2026-03-30

### 优化
- **[tests/pricing-service-snapshot-cleanup]**: 继续清理定价服务测试快照中残留的占位文本，将竞店名、原因列表和上下文摘要恢复为可读快照，减少断言失败时的误导信息。
  - 文件: `backend/tests/test_pricing_service.py`

### 测试
- **[tests/pricing-service-snapshot-cleanup]**: 执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q backend/tests/test_pricing_service.py` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q`，结果分别为 `4 passed` 与 `131 passed`。
  - 文件: `backend/tests/test_pricing_service.py`

## [0.4.20] - 2026-03-30

### 优化
- **[tests/pricing-service-readability]**: 清理定价服务测试中的占位文本，将竞店名、原因列表和上下文摘要恢复为可读快照，降低断言失败时的排查成本。
  - 文件: `backend/tests/test_pricing_service.py`

### 测试
- **[tests/pricing-service-readability]**: 执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q backend/tests/test_pricing_service.py` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q`，结果分别为 `4 passed` 与 `131 passed`。
  - 文件: `backend/tests/test_pricing_service.py`

## [0.4.19] - 2026-03-30

### 修复
- **[tests/question-mark-cleanup]**: 继续清理最近层测试文件中的真实问号占位，包括市场 Web 断言和商家定价测试数据，恢复可读错误提示与测试快照文本。
  - 文件: `backend/tests/test_web_console_market_routes.py`, `backend/tests/test_merchant_pricing_service.py`

### 测试
- **[tests/question-mark-cleanup]**: 执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q backend/tests/test_web_console_market_routes.py`、`D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q backend/tests/test_merchant_pricing_service.py` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q`，结果分别为 `7 passed`、`12 passed` 与 `131 passed`。
  - 文件: `backend/tests/test_web_console_market_routes.py`, `backend/tests/test_merchant_pricing_service.py`

## [0.4.18] - 2026-03-30

### 优化
- **[tests/merchant-pricing-readability]**: 清理商家定价测试中的乱码占位字符串，统一替换为可读的房型名、价型名、备注和消息文本，降低失败排查与后续维护成本。
  - 文件: `backend/tests/test_merchant_pricing_service.py`

### 测试
- **[tests/merchant-pricing-readability]**: 执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q backend/tests/test_merchant_pricing_service.py` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q`，结果分别为 `12 passed` 与 `131 passed`。
  - 文件: `backend/tests/test_merchant_pricing_service.py`

## [0.4.17] - 2026-03-30

### 修复
- **[web/market-float-message]**: 修复竞对市场页面中 `my_price` 非数字时的错误提示乱码，统一恢复为 `必须是数字`，避免表单校验失败时继续向用户展示 `?????`。
  - 文件: `backend/app/web/market.py`

### 测试
- **[web/market-float-message]**: 新增 `my_price` 非数字的 Web 回归测试，并执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q`，结果 `131 passed`。
  - 文件: `backend/tests/test_web_console_market_routes.py`

## [0.4.16] - 2026-03-30

### 修复
- **[web/market-i18n-recovery]**: 修复竞对市场 Web 路由中的中文提示与默认文案被错误写成 `????` 的回归，恢复用户可读错误信息和默认酒店名称。
  - 文件: `backend/app/web/market.py`

### 测试
- **[web/market-i18n-recovery]**: 收紧市场控制台中文文案断言，并执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q`，结果 `130 passed`。
  - 文件: `backend/tests/test_web_console_market_routes.py`

## [0.4.15] - 2026-03-30

### 修复
- **[market/bounds-hardening]**: 为竞对趋势、最新价、房态分析与飞猪采集入口补齐数值边界校验，统一拦截负数、超大值和可售房数大于总房数的非法输入，避免异常参数继续进入业务层。
  - 文件: `backend/app/api/routes.py`, `backend/app/web/market.py`

### 测试
- **[market/bounds-hardening]**: 新增 API 参数边界回归测试，扩展 Web 市场控制台边界测试，并执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q`，结果 `130 passed`。
  - 文件: `backend/tests/test_competitor_api_bounds.py`, `backend/tests/test_web_console_market_routes.py`

## [0.4.14] - 2026-03-30

### 修复
- **[api/error-handling]**: 修复 API 未知异常会直接回显内部异常文本的问题；现在 JSON 接口统一返回通用 `Internal server error`，同时服务端记录异常日志，HTML 页面继续返回友好错误页。
  - 文件: `backend/app/main.py`

### 测试
- **[api/error-handling]**: 新增全局异常处理回归测试，覆盖 API 隐藏内部异常细节与 HTML 页面保留友好提示；并执行全量测试回归。
  - 文件: `backend/tests/test_app_error_handling.py`
## [0.4.13] - 2026-03-30

### 修复
- **[web/auth]**: 修复登录 `next_url` 的开放重定向风险；现在只允许站内相对路径跳转，外部绝对地址、协议地址和非法路径都会回退到首页。
  - 文件: `backend/app/web/routes.py`

### 测试
- **[web/auth]**: 新增登录跳转安全回归测试，覆盖合法站内跳转、站外跳转拦截和登录页 `next` 参数净化；并执行全量测试回归。
  - 文件: `backend/tests/test_web_login_routes.py`
## [0.4.12] - 2026-03-30

### 文档
- **[docs/history-alignment]**: 收敛历史方案文档 `workflow-approval-dashboard-plan.md` 中对缺失文件的“当前已实现”式描述，将 `store_service.py`、`audit_service.py`、`workflow_service.py`、`streamlit_app.py` 与旧任务层引用统一改为历史方案说明，避免继续误导排查与维护。
  - 文件: `backend/docs/workflow-approval-dashboard-plan.md`
## [0.4.11] - 2026-03-30

### 修复
- **[market_collection/tests]**: 将竞对游客登录路由测试改为匹配当前真实行为；该接口已明确废弃游客自动登录，现固定返回 400 与移除提示，不再错误断言为 200 成功。
  - 文件: `backend/tests/test_competitor_service.py`

### 测试
- **[market_collection/tests]**: 执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q backend/tests/test_competitor_service.py` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q`，分别得到 `15 passed` 与 `119 passed`。
  - 文件: `backend/tests/test_competitor_service.py`
## [0.4.10] - 2026-03-30

### 修复
- **[project/stability-baseline]**: 恢复后端测试基线，补入 `pytest` 依赖，新增 Flask 应用与关键路由冒烟测试，并收敛 README 到当前真实实现，避免继续按历史漂移能力排查。
  - 方案包: [202603301626_project-stability-baseline](archive/2026-03/202603301626_project-stability-baseline/)
  - 决策: project-stability-baseline#D001(优先恢复测试基线与文档真实性)
  - 决策: project-stability-baseline#D002(以最小冒烟测试锁定应用导入与关键路由注册)

### 测试
- **[project/stability-baseline]**: 执行 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest -q tests/test_app_route_smoke.py` 与 `D:/agongzuo/AI PoC/backend/.venv/Scripts/python.exe -m pytest --collect-only -q`，分别得到 `2 passed` 与 `119 tests collected`。
  - 文件: `backend/tests/test_app_route_smoke.py`
## [0.4.9] - 2026-03-30

### 清理
- **[cleanup/run-dir]**: 删除后端 `.run` 目录下的临时巡检脚本与运行日志残留，继续收缩本地运行垃圾，不触碰业务代码、配置或虚拟环境。
  - 文件: `backend/.run/`
## [0.4.8] - 2026-03-30

### 清理
- **[cleanup/runtime-garbage]**: 清理后端运行日志、PID、测试缓存与浏览器状态目录，收缩本地运行垃圾，不触碰业务代码、配置或虚拟环境。
  - 文件: `backend/.flask.err.log`, `backend/.flask.out.log`, `backend/.flask.pid`, `backend/flask.stderr.log`, `backend/flask.stdout.log`, `backend/.streamlit.err.log`, `backend/.streamlit.pid`, `backend/__pycache__/`, `backend/.pytest_cache/`, `backend/.playwright/`, `backend/.browsers/`, `backend/.chromium-cdp-profile/`, `backend/.edge-cdp-profile/`

## [0.4.7] - 2026-03-30

### 清理
- **[cleanup/dead-files]**: 删除零引用的审批存储服务 `store_service.py`，移除一次性人工登录脚本、结果文件与根目录错误输出残留，收缩历史遗留垃圾代码与临时产物。
  - 文件: `backend/app/services/store_service.py`, `backend/.manual_hwht_login.py`, `backend/.manual_login_result.json`, `$resultFile`

## [0.4.6] - 2026-03-23

### 新增
- **[market_collection]**: 历史竞对快照清洗脚本新增 `--sql-preview` 模式，可在正式执行前输出候选 `UPDATE` / `DELETE` 语句预览，并保持与 `--apply` 互斥。
  - 文件: `backend/scripts/clean_competitor_snapshots.py`

### 测试
- **[market_collection]**: 新增清洗脚本 SQL 预览单元测试，并执行 `python -m unittest tests.test_clean_competitor_snapshots_script tests.test_competitor_service`。
  - 文件: `backend/tests/test_clean_competitor_snapshots_script.py`, `backend/tests/test_competitor_service.py`
## [0.4.5] - 2026-03-23

### 修复
- **[market_collection]**: 飞猪酒店名规范化补充无金额残缺营销尾词清理，支持移除单独尾随的 `立减` / `立省`，并保持抓取归一与历史快照清洗共用同一规则。
  - 文件: `backend/app/services/competitor_service.py`

### 测试
- **[market_collection]**: 补充残缺营销尾词回归测试，并执行 `python -m unittest backend.tests.test_competitor_service`。
  - 文件: `backend/tests/test_competitor_service.py`
## [0.4.4] - 2026-03-21

### 新增
- **[market_collection]**: 新增历史竞对快照清洗脚本 `clean_competitor_snapshots.py`，支持按 `shop_id`、时间范围和来源过滤旧 `competitor_snapshots`，默认 dry-run 预览，并在显式开关下执行名称/来源修正与无效快照删除。
  - 方案包: [202603211805_competitor-snapshot-cleanup-script](archive/2026-03/202603211805_competitor-snapshot-cleanup-script/)
  - 决策: competitor-snapshot-cleanup-script#D001(复用现有 competitor_service 规则，而不是在脚本里另写一套历史清洗规则)
  - 决策: competitor-snapshot-cleanup-script#D002(无效快照采用“默认预览 + 显式删除开关”策略)

### 测试
- **[market_collection]**: 新增历史竞对快照来源归一、名称修正和无效 URL 识别回归测试，并执行 `python -m unittest tests.test_competitor_service tests.test_competitor_guest_login_flow` 与 `python -m py_compile backend/scripts/clean_competitor_snapshots.py`。
  - 文件: `backend/tests/test_competitor_service.py`, `backend/scripts/clean_competitor_snapshots.py`
## [0.4.3] - 2026-03-21

### 优化
- **[market_collection]**: 飞猪列表块解析增强了候选容器选择、结构信号评分和空名称回退，降低对整页文本回退的依赖，并提升多样式酒店卡片的命中率。
  - 方案包: [202603211726_fliggy-list-block-parser-hardening](archive/2026-03/202603211726_fliggy-list-block-parser-hardening/)
  - 决策: fliggy-list-block-parser-hardening#D001(优先增强 DOM 候选块识别，而不是重写整条回退链路)

### 测试
- **[market_collection]**: 新增弱结构酒店卡片和多酒店卡片混噪声场景回归测试，并执行 `python -m unittest tests.test_competitor_service tests.test_competitor_guest_login_flow`。
  - 文件: `backend/tests/test_competitor_guest_login_flow.py`

## [0.4.2] - 2026-03-21

### 修复
- **[market_collection]**: 飞猪酒店抓取新增名称规范化，清理会员价、立减等营销尾词与不可见字符，统一提取、入库和最新价展示口径。
  - 方案包: [202603210851_fliggy-hotel-name-normalization](archive/2026-03/202603210851_fliggy-hotel-name-normalization/)
  - 决策: fliggy-hotel-name-normalization#D001(在提取阶段执行酒店名规范化，确保抓取与展示口径一致)

### 测试
- **[market_collection]**: 新增酒店名规范化回归测试，并执行 `python -m unittest tests.test_competitor_service tests.test_competitor_guest_login_flow`。
  - 文件: `backend/tests/test_competitor_service.py`, `backend/tests/test_competitor_guest_login_flow.py`

## [0.4.1] - 2026-03-20

### 修复
- **[market_collection]**: 飞猪游客采集新增酒店卡片过滤与结果统计，过滤机票/航线等非酒店价格项，并在 Flask 操作台结构化展示有效酒店、过滤统计与最新竞对价。
  - 方案包: [202603201505_fliggy-hotel-filter-console](archive/2026-03/202603201505_fliggy-hotel-filter-console/)
  - 决策: fliggy-hotel-filter-console#D001(在服务层过滤非酒店价格项，避免脏数据入库)

### 测试
- **[market_collection]**: 补充飞猪过滤规则与结果统计测试，并执行 `python -m unittest backend.tests.test_competitor_guest_login_flow` 与 `python -m compileall backend/app`。
  - 文件: `backend/tests/test_competitor_guest_login_flow.py`

## [0.4.0] - 2026-03-20

### 新增
- **[market_collection]**: 飞猪游客采集新增 `cdp_current_page` 模式，可连接本机 Chrome 调试端口，直接接管当前已登录的飞猪酒店列表标签页，并在当前页继续翻页抓取竞对酒店价格。
  - 方案包: [202603201133_fliggy-cdp-current-page-collect](archive/2026-03/202603201133_fliggy-cdp-current-page-collect/)
  - 决策: fliggy-cdp-current-page-collect#D001(采用 CDP 直接接管当前标签页，而非复制登录态新开页)

### 测试
- **[market_collection]**: 新增 CDP 标签页选择与采集模式路由测试，并执行 `python -m unittest backend.tests.test_competitor_guest_login_flow` 与 `python -m compileall backend/app`。
  - 文件: `backend/tests/test_competitor_guest_login_flow.py`
## [0.3.9] - 2026-03-19

### 变更
- **[web/console-consolidation]**: 将原 Streamlit 控制台核心能力整合进 Flask Web，补齐首页总览、运营总览、商家连接配置、商家会话登录、商家价格抓取、价格映射、商家 AI 定价、月度计划、自动改价、营收与评论等统一页面入口。
  - 文件: `backend/app/main.py`, `backend/app/web/common.py`, `backend/app/web/routes.py`, `backend/app/web/ops.py`, `backend/app/web/pricing.py`, `backend/app/templates/base.html`, `backend/app/templates/index.html`, `backend/app/templates/ops/overview.html`, `backend/app/templates/ops/summary.html`, `backend/app/templates/pricing/*.html`, `backend/app/static/app.css`

### 测试
- **[web/console-consolidation]**: 新增 Flask Web 控制台路由回归测试，覆盖统一首页、运营总览和商家定价子页面的渲染与核心表单提交流程；并执行 `python -m compileall backend/app` 与本地测试客户端冒烟验证。
  - 文件: `backend/tests/test_web_console_pricing_routes.py`

### 文档
- **[docs/flask-first-entry]**: 更新后端 README 与启动说明，明确 Flask 为唯一推荐入口，Streamlit 仅保留兼容性参考用途。
  - 文件: `backend/README.md`, `启动说明，功能概述.txt`
## [0.2.4] - 2026-03-18

### 新增
- **[streamlit/pricing]**: 商家价格管理页新增“一键直接改价”入口，调用独立直推接口并展示直推结果，保留原有人工确认提交流程
  - 文件: `backend/streamlit_app.py`, `backend/tests/test_streamlit_app.py`

## [0.2.3] - 2026-03-18

### 新增
- **[pricing]**: 新增独立直推接口 `/pricing/merchant-direct-submit`，对已映射房型生成建议后直接调用平台调价 API，保持与普通预览/确认接口隔离
  - 文件: `backend/app/schemas/pricing.py`, `backend/app/services/merchant_pricing_service.py`, `backend/app/api/routes.py`

### 行为
- **[pricing]**: 直推模式改为失败即停；任一房型推价失败后立即停止后续提交，并返回已成功项、失败项和未提交数量
  - 文件: `backend/app/services/merchant_pricing_service.py`

### 测试
- **[pricing]**: 补充直推服务 fail-fast 场景与直推路由测试，并回归商家调价与自动调价现有用例
  - 文件: `backend/tests/test_merchant_pricing_service.py`, `backend/tests/test_auto_pricing_service.py`

## [0.2.2] - 2026-03-18

### 新增
- **[pricing]**: 新增商家调价编排接口，支持基于已抓取价格与库存生成建议，并可按映射完整项直接提交到已配置的调价 API
  - 文件: `backend/app/schemas/pricing.py`, `backend/app/services/merchant_pricing_service.py`, `backend/app/api/routes.py`

### 修复
- **[pricing]**: 修复 `collect_auto_pricing_context` 在规则关闭分支引用未定义变量的问题，避免自动调价上下文收集异常
  - 文件: `backend/app/services/auto_pricing_service.py`

### 测试
- **[pricing]**: 补充商家调价编排服务/路由测试，并回归自动调价服务测试
  - 文件: `backend/tests/test_merchant_pricing_service.py`, `backend/tests/test_auto_pricing_service.py`

﻿## [0.3.8] - 2026-03-16

### 变更
- **[merchant-pricing/one-click-preview]**: 商家价格预览接口补齐默认 HWHT URL、会话失效识别与自动辅助登录重试；现在点击一次获取价格即可在会话缺失或失效时自动拉起人工登录，然后继续返回预览结果，并附带 `auto_login_performed/credential_saved` 状态。
  - 文件: `backend/app/services/fliggy_merchant_service.py`, `backend/app/api/routes.py`, `backend/app/schemas/competitor.py`
- **[streamlit/merchant-pricing-one-click]**: 商家价格管理页改成“一键获取价格”入口，新增首次可填的商家账号密码输入，默认直连 HWHT 登录页和价格页，自动保存可复用凭据并在成功后清空页面密码。
  - 文件: `backend/streamlit_app.py`

### 测试
- **[merchant-pricing]**: 新增会话失效识别与自动登录重试回归测试，并更新预览路由测试到 `fetch_fliggy_merchant_price_preview`；目标回归 `17 passed`。
  - 文件: `backend/tests/test_fliggy_merchant_service.py`
## [0.3.7] - 2026-03-16

### ä¿®å¤
- **[merchant-login/form-ready]**: ç»å½åå¢å è¡¨åæè½½ç­å¾ï¼é¿å HWHT ç»å½é¡µå¼æ­¥æ¸²ææ¶è¿æ©å¡«åå¯¼è´è´¦å·å¯ç åæäº¤æé®å¨é¨æªå½ä¸­ã
  - æä»¶: `backend/app/services/fliggy_merchant_service.py`, `backend/.manual_hwht_login.py`

## [0.3.6] - 2026-03-16

### ä¿®å¤
- **[merchant-price-parse/hwht]**: ä¿®å¤ `ebooking.hwht.com` ææ¬ååºè§£æè¢«ä¹±ç æ±¡æçé®é¢ï¼æ¢å¤æ¿åè¯å«ãä»·ååæ¸æ´ãGID/æ¥åæ°å­è¿æ»¤ä¸ `æ©é¤1/æ©é¤2` åªå£°è·³è¿ï¼é¿åå°èææ¬è¯¯å¤ä¸ºçå®ä»·åã
  - æä»¶: `backend/app/services/fliggy_merchant_service.py`

### æµè¯
- **[merchant-price-parse]**: æ¢å¤ HWHT ææ¬åå½æµè¯æ­è¨ï¼æ ¡éªåªä¿ç 3 ä¸ªçå® `æ åä»·-*` é¡¹ï¼ä¸ä»·æ ¼è½å¨ `200/180/190`ã
  - æä»¶: `backend/tests/test_fliggy_merchant_service.py`

## [0.3.5] - 2026-03-16

### 修复
- **[merchant-login/manual-window]**: 修复人工辅助登录轮询时反复新开验证页的问题；现在人工等待阶段只观察当前 Chromium 页面，不再持续打开新的价格页标签。
  - 文件: ackend/app/services/fliggy_merchant_service.py

### 测试
- **[merchant-login]**: 补充当前页认证判定测试，并将人工等待单测改为覆盖非开页轮询路径。
  - 文件: ackend/tests/test_fliggy_merchant_service.py
## [0.3.4] - 2026-03-16

### ??
- **[merchant-login/manual-assist]**: ?????????????????????????????????????? headed ??????????????????????????????????????
  - ??: `backend/app/services/fliggy_merchant_service.py`

### ??
- **[merchant-login]**: ??????????????????????????????????
  - ??: `backend/tests/test_fliggy_merchant_service.py`

## [0.3.3] - 2026-03-16

### 变更
- **[streamlit/merchant-mapping]**: 价格映射管理页补齐“同步最新商家价”入口，直接对接 `/pricing/merchant-mappings/refresh-prices`，可回填映射表 `last_seen_price` 并展示同步结果，减少在“商家价格管理”和“价格映射管理”之间来回切换。
  - 文件: `backend/streamlit_app.py`

### 测试
- **[streamlit]**: 更新 Streamlit 状态初始化测试，覆盖新增的 `merchant_mapping_refresh_resp` 会话状态。
  - 文件: `backend/tests/test_streamlit_app.py`

## [0.3.2] - 2026-03-15

### 变更
- **[merchant-pricing/audit]**: 新增 `merchant_pricing_audits` 审计表与 helper，明确记录商家后台价格只读预览(`preview`)、AI 建议预演(`dry_run`)和人工确认正式提交(`formal_submit`)三段状态，并在相关接口返回 `audit/audit_mode`。
  - 文件: `backend/app/services/merchant_pricing_audit_service.py`, `backend/app/services/fliggy_merchant_service.py`, `backend/app/services/merchant_pricing_service.py`
- **[streamlit/merchant-pricing]**: Streamlit 定价中心新增“商家价格管理”页，支持商家连接配置回填、只读价格预览、AI 建议生成和人工确认后正式提交。
  - 文件: `backend/streamlit_app.py`

### 测试
- **[merchant-pricing]**: 补充商家价格预览、AI dry-run 与 formal-submit 审计相关测试，目标回归 `16 passed`。
  - 文件: `backend/tests/test_fliggy_merchant_service.py`, `backend/tests/test_merchant_pricing_service.py`
## [0.3.1] - 2026-03-14

### 修复
- **[streamlit/multi-tenant-headers]**: 修复 Streamlit 控制台请求未携带 `X-Tenant-Id/X-Shop-Id` 的问题；侧边栏新增 `tenant_id` 输入，请求封装统一补齐多租户头，避免在查询房价/竞对房型历史等接口时返回 `Missing X-Tenant-Id header`。
  - 文件: `backend/streamlit_app.py`

### 测试
- **[streamlit]**: 新增请求封装单测，验证 `_api_get()` 会自动注入多租户请求头。
  - 文件: `backend/tests/test_streamlit_app.py`
## [0.3.0] - 2026-03-14

### 变更
- **[merchant-price-capture]**: 新增飞猪商家后台登录抓取能力，支持保存商家会话、抓取登录后价格与房型，并将结果回填到当前价格和房型历史输入链路，同时在 Streamlit 控制台补齐商家登录与商家价格抓取入口。
  - 方案包: [202603141341_merchant-price-capture](archive/2026-03/202603141341_merchant-price-capture/)
  - 任务: merchant-price-capture#D001(最小闭环接入方案已完成并归档)

## [0.2.9] - 2026-03-14

### 变更

- **[cleanup/temp-files]**: 清理项目内明显冗余的缓存与历史运行残留，删除 `.pytest_cache`、源码 `__pycache__`、`.logs`、`.run` 与两份 `.venv_broken_*` 备份目录。
  - 文件: `backend/.pytest_cache`, `backend/.logs`, `backend/.run`, `backend/app/**/__pycache__`, `backend/scripts/__pycache__`, `backend/tests/__pycache__`, `backend/.venv_broken_20260313_113520`, `backend/.venv_broken_20260313_151828`, `backend/.streamlit.pid`, `backend/.streamlit*.log`, `backend/.uvicorn*.log`
- **[database/table-comments]**: 新增数据库表注释脚本，已为当前 MySQL 库中 19 张业务表写入业务分类注释，并在后端 README 补充执行说明。
  - 文件: `backend/scripts/apply_table_comments.py`, `backend/README.md`
- **[web/ui-cleanup]**: 精简 Flask Web 控制台的非操作性内容；登录页移除提示侧栏和账号创建说明，全局移除迁移提示与页脚说明，首页和操作中心删除说明性文案。
  - 文件: `backend/app/templates/base.html`, `backend/app/templates/login.html`, `backend/app/templates/index.html`, `backend/app/templates/ops/overview.html`, `backend/app/static/app.css`
- **[web/error-handling]**: 调整 Flask 全局错误处理；API 请求继续返回 JSON，SSR 页面错误改为 HTML 页面，避免 Web 路由异常时直接吐 JSON。
  - 文件: `backend/app/main.py`, `backend/app/templates/error.html`
- **[docs/readme]**: 修复后端 README 登录说明段的乱码、坏掉的 Markdown 代码块和多租户说明中的异常字符。
  - 文件: `backend/README.md`
- **[docs/config-cleanup]**: 修复 README 中残留的多租户乱码说明，并补充 `.env.example` 与启动说明中的 `APP_ENV` / `FLASK_SECRET_KEY` 本地配置提示。
  - 文件: `backend/README.md`, `backend/.env.example`, `启动说明，功能概述.txt`
- **[web/template-json]**: 修复 SSR 模板对 Jinja `tojson` 过滤器的错误参数使用，避免结果页渲染时出现 500。
  - 文件: `backend/app/templates/ops/action_execute.html`, `backend/app/templates/ops/ai_plan.html`, `backend/app/templates/ops/fliggy_sync.html`, `backend/app/templates/ops/shop_config.html`, `backend/app/templates/ops/market/competitor_collect.html`, `backend/app/templates/ops/market/competitor_latest_prices.html`, `backend/app/templates/ops/market/competitor_trends.html`, `backend/app/templates/ops/market/fliggy_collect.html`, `backend/app/templates/ops/market/rooms_analyze.html`, `backend/app/templates/ops/market/rooms_crawl.html`, `backend/app/templates/ops/market/rooms_history.html`, `backend/app/templates/ops/market/rooms_latest.html`
- **[web/approvals-template]**: 修复动作审批页对 `pending` 字典的模板访问方式，避免真实数据下因命中 `dict.items` 方法而返回 500。
  - 文件: `backend/app/templates/ops/approvals.html`
## [0.2.8] - 2026-03-13

### 修复
- **[scripts]**: 修复 `scripts/create_user.py` 直接运行时的 `ModuleNotFoundError: app`（自动将 `backend/` 加入 `sys.path`）。
  - 文件: `backend/scripts/create_user.py`

- **[multi-tenant/shop-schema]**: 修复旧 `shops` 表缺列导致的登录后页面报错（自动补齐 `name`、`fliggy_*`、`room_status_*` 等列）。
  - 文件: `backend/app/services/shop_service.py`



### 变更
- **[web/market]**: 接入“竞对市场”SSR 页面：注册 `market_bp`（`/ops/market/*`），补齐竞对采集/趋势/最新价、飞猪采集、房型抓取/最新/历史/分析等表单页，并在侧边栏增加入口。
  - 文件: `backend/app/main.py`, `backend/app/web/market.py`, `backend/app/templates/base.html`, `backend/app/templates/ops/market/competitor_collect.html`, `backend/app/templates/ops/market/competitor_trends.html`, `backend/app/templates/ops/market/competitor_latest_prices.html`, `backend/app/templates/ops/market/fliggy_collect.html`, `backend/app/templates/ops/market/rooms_crawl.html`, `backend/app/templates/ops/market/rooms_latest.html`, `backend/app/templates/ops/market/rooms_history.html`, `backend/app/templates/ops/market/rooms_analyze.html`
- **[web/ui-i18n]**: 将 Web 控制台页面标签/字段名（tenant/shop/user、告警摘要键名等）统一中文化展示。
  - 文件: ackend/app/templates/base.html, ackend/app/templates/login.html, ackend/app/templates/index.html`n
- **[web/ops]**: 新增第一批业务表单操作页：飞猪同步/AI计划/动作执行/动作审批/门店配置，并增加左侧菜单导航（`/ops/*`）。
  - 文件: `backend/app/web/ops.py`, `backend/app/web/common.py`, `backend/app/templates/base.html`, `backend/app/templates/ops/overview.html`, `backend/app/templates/ops/fliggy_sync.html`, `backend/app/templates/ops/ai_plan.html`, `backend/app/templates/ops/action_execute.html`, `backend/app/templates/ops/approvals.html`, `backend/app/templates/ops/shop_config.html`, `backend/app/static/app.css`, `backend/app/main.py`

- **[web/security]**: Web 表单新增 CSRF 校验（登录与操作页 POST）。
  - 文件: `backend/app/web/routes.py`, `backend/app/web/common.py`, `backend/app/templates/login.html`

- **[web/auth]**: 新增 Flask SSR Web 控制台（`/login`）、账号登录/登出与门店切换（`/switch-shop/<shop_id>`），并将 `tenant_id/shop_id` 写入 Cookie Session 作为系统访问入口。
  - 文件: `backend/app/main.py`, `backend/app/web/routes.py`, `backend/app/templates/base.html`, `backend/app/templates/login.html`, `backend/app/templates/index.html`, `backend/app/static/app.css`

- **[api/multi-tenant]**: 租户/门店解析优先读取 Session；必要时回退到 `X-Tenant-Id/X-Shop-Id`（可通过 `AUTH_ALLOW_HEADER_FALLBACK` 控制），继续承接既有多租户隔离与门店归属校验。
  - 文件: `backend/app/api/deps.py`, `backend/app/core/config.py`, `backend/.env.example`

- **[deps]**: 移除 Streamlit 依赖（前端不再使用 Streamlit 作为系统入口）。
  - 文件: `backend/requirements.txt`

- **[scripts]**: 新增账号创建/更新脚本（tenant/shop aware）。
  - 文件: `backend/scripts/create_user.py`, `backend/app/services/user_service.py`

### 测试
- **[tests]**: 新增 deps 的 Session/Header 行为单元测试。
  - 文件: `backend/tests/test_api_deps_session.py`

### 文档
- **[docs]**: 更新启动说明与后端 README，补充登录入口与创建账号步骤。
  - 文件: `启动说明，功能概述.txt`, `backend/README.md`

## [0.2.7] - 2026-03-13

### ??
- **[api]**: ?? Web ??? FastAPI ????? Flask??? app factory?Blueprint ????? JSON ?????
  - ??: `backend/app/main.py`, `backend/app/api/routes.py`, `backend/app/api/errors.py`

- **[multi-tenant]**: ?????(tenant)-??(shop)????????`shops` ??? `tenant_id`?????? `X-Tenant-Id` + `X-Shop-Id`???? shop ?? tenant?????????????????
  - ??: `backend/app/api/deps.py`, `backend/app/api/routes.py`, `backend/app/services/shop_service.py`

- **[deps/docs]**: ???????????? fastapi/uvicorn??? flask ??????????? docs ???????
  - ??: `backend/requirements.txt`, `backend/README.md`, `backend/docs/workflow-approval-dashboard-plan.md`

  - ??: `backend/streamlit_app.py`

### ??
- **[tests]**: ??????? FastAPI ?????????? Flask test_client ????????? Flask ??????????
  - ??: `backend/tests/test_auto_pricing_service.py`, `backend/tests/test_pricing_service.py`, `backend/tests/test_monthly_pricing_service.py`, `backend/tests/test_workflow_service.py`

## [0.2.6] - 2026-03-12

### 变更
- **[auto-pricing/workflow]**: 将自动调价从单步骤 workflow 壳升级为 7 步可追踪工作流（`collect_context`→`generate_recommendation`→`risk_check`→`wait_approval_or_execute`→`push_fliggy`→`verify_result`→`emit_report`），并在审批通过后自动续跑后续步骤（含 `verify_result`/`emit_report`）。
  - 文件: `backend/app/services/workflow_service.py`, `backend/app/services/auto_pricing_service.py`, `backend/tests/test_workflow_service.py`

- **[auto-pricing/push]**: 将飞猪调价推送从动作执行器中解耦：新增 `defer_channel_push`，使 `wait_approval_or_execute` 的执行阶段仅落库/执行本地更新，真实飞猪推送由 workflow 的 `push_fliggy` step 统一执行。
  - 文件: `backend/app/services/action_executor.py`, `backend/app/services/auto_pricing_service.py`, `backend/app/services/workflow_service.py`

﻿## [0.2.5] - 2026-03-11

### 新增
- **[streamlit]**: 新增中文“店铺配置”页，可按酒店查看并保存飞猪真实调价模板、房态默认值与基础店铺信息
  - 文件: `backend/streamlit_app.py`
- **[shop-config]**: 单店详情接口现可返回真实调价模板，保存店铺配置时若凭证字段留空会自动保留原值，避免前端编辑覆盖已有飞猪凭证
  - 文件: `backend/app/services/shop_service.py`, `backend/app/api/routes.py`

### 测试
- **[shop-config]**: 复用现有店铺、飞猪与执行器测试，验证配置页依赖的模板透传和空白凭证保留逻辑
  - 文件: `backend/tests/test_shop_service.py`, `backend/tests/test_fliggy_client.py`, `backend/tests/test_action_executor.py`
# CHANGELOG

- **[auto-pricing/report]**: `emit_report` step 新增专用落表 `auto_pricing_reports`（以 `workflow_run_id` 幂等），并提供报表查询接口 `GET /reports/auto-pricing` 供大盘/聚合消费。
  - 文件: `backend/app/services/workflow_service.py`, `backend/app/api/routes.py`, `backend/tests/test_workflow_service.py`


- **[streamlit]**: 运营总览新增“自动调价报表”tab，对接 `GET /reports/auto-pricing`，支持按 days/limit 查询并查看指标与明细。
  - 文件: `backend/streamlit_app.py`


- **[streamlit]**: 修复“自动化运营/工作流”页部分标签显示为 `????` 的问题，统一替换为中文文案，并修正报表 tab 错误分支的 `state.get('code')` 引号写法。
  - 文件: `backend/streamlit_app.py`


## [0.2.2] - 2026-03-11

### Added
- **[multi-shop]**: Added a shops config table, shop management APIs, and shop_id-scoped hotel config resolution.
  - Files: `backend/app/services/shop_service.py`, `backend/app/schemas/shop.py`, `backend/app/api/routes.py`
- **[scheduler]**: Room-status collection and daily revenue jobs now iterate enabled shops; legacy .env values remain the shop_id=1 fallback.
  - Files: `backend/app/tasks/jobs.py`, `backend/app/services/room_status_service.py`, `backend/app/services/store_service.py`, `backend/app/services/fliggy_client.py`
- **[streamlit]**: Streamlit sidebar now loads `/shops`, supports hotel switching, and falls back to manual `shop_id` when the backend list is unavailable.
  - Files: `backend/streamlit_app.py`

### Tests
- **[multi-shop]**: Added tests for the multi-shop config layer and Fliggy credential override behavior.
  - Files: `backend/tests/test_shop_service.py`, `backend/tests/test_fliggy_client.py`

## [0.2.1] - 2026-03-10

### 新增
- **[pricing]**: 单次定价建议升级为节前控房策略，支持节日日期、目标入住率、退订率、需求热度和竞对价格上限控制
  - 文件: `backend/app/services/pricing_policy.py`, `backend/app/services/pricing_service.py`, `backend/app/schemas/pricing.py`, `backend/app/api/routes.py`
- **[pricing]**: 月度调价计划复用节前分阶段逻辑，并在结果中保留 `event_policy` 上下文
  - 文件: `backend/app/services/monthly_pricing_service.py`, `backend/tests/test_monthly_pricing_service.py`
- **[streamlit]**: 首页定价快览与月度调价页接入节日日期、目标入住率、退订率、需求热度和竞对价格上限倍率，并新增节前控房策略卡片、三态预警高亮和节日前倒计时提醒条
  - 文件: `backend/streamlit_app.py`

### 测试
- **[pricing]**: 新增/更新节前动态提价与月度计划测试，覆盖 fallback 与 LLM 回退分支
  - 文件: `backend/tests/test_pricing_service.py`, `backend/tests/test_monthly_pricing_service.py`

## [0.2.0] - 2026-03-07

### 新增
- **[pricing]**: 新增未来 30 天月度调价计划能力，支持草稿生成、手工修改、确认后写入系统
  - 方案: [202603071117_monthly-pricing-confirmation](archive/2026-03/202603071117_monthly-pricing-confirmation/)
  - 决策: monthly-pricing-confirmation#D001(采用专用月度调价计划流而非复用通用动作载荷)
- **[streamlit]**: AI 定价页升级为“生成草稿 → 编辑最终价 → 确认改价”交互流
  - 方案: [202603071117_monthly-pricing-confirmation](archive/2026-03/202603071117_monthly-pricing-confirmation/)
  - 决策: monthly-pricing-confirmation#D003(确认提交后仅写入项目内计划表，不对接外部真实平台)




- **[streamlit]**: 修复 AI 定价快览与月度调价页中节日日期、目标入住率上下限、预估退订率默认不可编辑的问题，并保留“开启后才参与计算”的交互语义
  - 文件: `backend/streamlit_app.py`
- **[api]**: 修复定价推荐与月度计划接口未透传节前控房参数的问题，确保前端修改后的日期、入住率目标、退订率与需求热度真正生效
  - 文件: `backend/app/api/routes.py`
- **[streamlit]**: 将 Streamlit 默认后端地址从 `http://127.0.0.1:8001` 调整为 `http://127.0.0.1:8000`，避免本地默认配置导致生成建议时报连接拒绝`
- **[streamlit]**: 将 AI 定价页面默认后端地址恢复为 `http://127.0.0.1:8001`，并对当前会话中遗留的 `8000` 地址做自动纠正，避免误连到其它本地服务`
- **[streamlit]**: 恢复完整前端控制台，重新接回运营总览、自动化运营、竞对市场、定价中心、营收与评论等页面，并保留节前控房定价修复
  - 文件: `backend/streamlit_app.py`
- **[Streamlit 定价中心]**: 新增价格映射管理页与 merchant mapping API，支持补录 gid/hid 后再生成商家 AI 改价建议。 + 类型: 功能增强 + 文件: backend/streamlit_app.py, backend/app/api/routes.py, backend/app/schemas/pricing.py, backend/tests/test_merchant_pricing_service.py







## [0.2.3] - 2026-03-27

### 修复
- **[market_collection]**: 游客竞对抓价只保留 `cdp_current_page` 已登录页面接管链路，移除游客自动登录与保存会话回退入口。
  - 方案: [202603270853_fliggy-guest-cdp-only](archive/2026-03/202603270853_fliggy-guest-cdp-only/)
  - 决策: fliggy-guest-cdp-only#D001(游客抓价仅保留当前页接管)

### 优化
- **[market_collection]**: 飞猪游客采集控制台进一步最小化，只保留 `debug_url`、URL 关键字、翻页数、酒店数和结果保存开关，并在页面上明确“不会自动登录、不会新开浏览器、只接管当前已登录页”。
  - 文件: `backend/app/web/market.py`, `backend/app/templates/ops/market/fliggy_collect.html`, `backend/tests/test_web_console_market_routes.py`

### 测试
- **[market_collection]**: 回归飞猪游客控制台路由与 CDP 当前页采集链路，并执行 `py -3 -m unittest backend.tests.test_competitor_guest_login_flow backend.tests.test_web_console_market_routes` 与 `py -3 -m py_compile backend/app/web/market.py backend/tests/test_web_console_market_routes.py`。
  - 文件: `backend/tests/test_competitor_guest_login_flow.py`, `backend/tests/test_web_console_market_routes.py`























- **[browser_extension]**: 将页面内商家“读取房型”入口的请求模式恢复为 `cdp_current_page`，不再在 `content.js` 中强制 `prefer_cdp`，以回到原来的当前页接管主链路。
  - 文件: `browser-extension/content.js`
- **[merchant_pricing]**: 修复 HWHT 商家房型预览在 `storage_state` 过期后误落到淘宝统一登录页仍返回空列表成功的问题；现在会识别 `login.taobao.com/havanaone/login` 和“密码登录/短信登录/手机扫码登录/忘记账号”等登录页信号，直接按登录失效处理。
  - 文件: `backend/app/services/fliggy_merchant_service.py`, `backend/tests/test_fliggy_merchant_service.py`
- **[merchant_pricing]**: 商家改价工作流改为本地浏览器读取本店房型价，自动同步竞对房型价后按房型级竞对低/均/高价生成建议价，前端保留最终价编辑与人工确认提交。
  - 文件: `apps/backend/app/api/plugin_routes.py`, `apps/backend/app/schemas/pricing.py`, `apps/backend/app/services/merchant_pricing_service.py`, `apps/backend/app/services/competitor_pricing_advice_service.py`, `apps/frontend/extension/background.js`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`
- **[merchant_pricing]**: 调整建议价本店价格来源优先级，匹配到后台价格映射时优先使用 `last_seen_price`，当前页读取价仅作为回退；当前页读取失败但后台映射可用时仍可生成建议。
  - 文件: `apps/backend/app/schemas/pricing.py`, `apps/backend/app/services/merchant_pricing_service.py`, `apps/frontend/extension/background.js`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`
- **[browser_extension]**: 设置页新增“后台价格映射（数据库）”管理区，支持展示、编辑并保存 `last_seen_price` 到云端数据库，作为后续商家建议价的优先本店价格来源。
  - 文件: `apps/frontend/extension/options.html`, `apps/frontend/extension/options.js`, `apps/backend/tests/test_browser_extension_assets.py`
- **[competitor_trends]**: 将竞对酒店折线图默认窗口从近 7 天调整为近 48 小时，并把默认价格点上限提高到 120。
  - 文件: `apps/backend/app/api/plugin_routes.py`, `apps/backend/app/services/competitor_service.py`, `apps/frontend/extension/background.js`, `apps/frontend/extension/popup.js`, `apps/frontend/extension/content.js`
