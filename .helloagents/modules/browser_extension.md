# 模块: browser_extension

## 职责

- 提供飞猪运营助手的浏览器插件入口，承接当前项目中适合插件使用的核心链路。
- 通过右上角 `popup.html` / `popup.js` 承接本地完整工作台；通过设置页承接账号登录、店铺切换、当前配置摘要与当前页面摘要。
- 在飞猪/淘宝相关页面中注入页面浮层；页面浮层 iframe 加载同一个本地 `popup.html?embedded=1`，避免 HTTPS 飞猪页面嵌入 HTTP 云端 UI 被浏览器混合内容策略拦截。
- 通过 background 统一管理登录态、店铺上下文、消息协议、本地轻量配置和对 Flask 插件接口的请求转发。

## 行为规范

- 插件维持 Manifest V3 结构，主数据依赖本地 Flask 服务；浏览器本地存储只保留基础连接配置、登录态摘要和迁移兜底状态。
- `popup.html` / `popup.js` 是右上角默认入口和页面浮层共用的本地完整工作台：
  - 房型价抓取后新增独立“竞对建议价”卡片，支持手工输入总房量、可售房量、当前售价和策略，并基于本次抓取结果 + 数据库历史价调用后端独立建议价接口，返回建议价、调价幅度、竞对对比和理由。
  - 未登录时不再在 Popup 内展示账号表单，而是显示“打开设置页”的轻量引导卡。
  - 工作台内的核心功能按“基础功能 / 商家改价”两大分组切换展示，减少单功能碎片化切页。
  - “基础功能”组内再拆成“配置竞对房型价 / 竞对建议价 / 快捷动作”三段横向子切换；点击一个时只显示当前模块内容，其他两个模块隐藏。
  - Popup 不再展示“当前页面 / 当前配置”详情，这两块摘要迁移到设置页，由设置页直接读取当前生效配置和最近访问业务页上下文。
  - 轻量动作直接执行。
- 商家改价主流程支持按不同房型结合竞对价生成建议价，用户可逐条修改最终价，并在提交前查看确认摘要；确认后才会推送 OTA。
  - 默认商家改价目标页为飞猪 `https://hotel.fliggy.com/ebooking/hotelBaseInfoUv.htm#/ebk-rp/roomsVsManage`，生成建议价和一键回填不会真实改价，只有二次确认后才提交。
  - 房型价抓取支持直接读取设置页里维护的多条竞对酒店详情页配置，批量抓取每家酒店下所有可见房型/价型的实时价格。
  - 竞对趋势图支持在“主流房型最低价”和“竞对酒店最低价”之间切换；主流房型维度按“房型分类 + 竞对酒店”拆分曲线，酒店维度按竞对酒店拆分曲线，两类趋势均通过 `/plugin/competitor/room-price-trends` 获取，并继续显示规则/LLM 建议摘要。
  - 趋势图下方会展示“曲线明细”列表：主流房型维度逐条显示主流房型、竞对酒店、竞对酒店来源、配置链接、最新最低价、最新采集、变化和点数；酒店最低价维度逐条显示竞对酒店对应曲线，避免用户只看图例时无法确认曲线来源。
  - 趋势卡片中的“最新采集”以云端 `hotel_room_prices` 的最新采集时间为准；浏览器本地 alarm 只作为“插件提醒检查”状态展示，不再被描述为云端采集调度。
  - 竞对房型价明细的每条房型行直接显示所属竞对酒店，避免多酒店批量抓取后房型来源不清。
- `options.html` / `options.js` 现在同时承担账号登录页：在设置页内完成账号登录、会话刷新、退出登录、当前店铺切换，并展示当前账号、当前配置和当前页面摘要。
- `popup-shell.html` / `popup-shell.js` 保留为云端 UI 实验入口；当前不作为默认入口，等待 `https://api.aihuawise.com/ops-assistant` 可用后再切回云端 UI。
- 页面浮层的布局也与 Popup 收敛：使用“基础功能 / 商家改价”分组展示，基础功能内再使用“配置竞对房型价 / 竞对建议价 / 快捷动作”横向子切换；商家区也改为和 Popup 一致的“按房型建议价主流程 + 高级备用统一目标价”层级；面板尺寸按 Popup 设置为 `400px × 780px`，标题区、状态卡、卡片、导航、按钮、输入框和工作台底部“返回结果”位置按 Popup 主排版对齐，避免页面内运营助手继续停留在旧版纵向堆叠样式。
- 当前页面浮层的业务界面通过 iframe 加载本地完整 `popup.html?embedded=1`；`content.js` 保留页面内启动按钮、浮层容器、当前页识别、当前页采集、本地商家房型读取、本地回填和协议转发等能力。
- `manifest.json` 的 `web_accessible_resources` 需要同时暴露 `popup.html`、`popup.js` 和 `content/result-view.js`，否则页面浮层 iframe 可加载 HTML 但无法加载 Popup 依赖脚本，表现为右下角面板空白。
- 云端 UI 与插件通过 `postMessage` 固定协议通信：请求类型为 `FLIGGY_OPS_CLOUD_REQUEST`，响应类型为 `FLIGGY_OPS_CLOUD_RESPONSE`，插件事件类型为 `FLIGGY_OPS_CLOUD_EVENT`；当前协议代码保留给 `popup-shell` 与未来 HTTPS 云端 UI 使用。
- `plugin.runtime` 只允许转发白名单内的 runtime 消息类型，避免云端页面获得任意扩展消息调用能力；云端 iframe 来源固定校验为 `http://api.aihuawise.com`。
- 页面浮层通用卡片不再使用 `white-space: pre-wrap`，只在结果区等文本输出容器保留换行展示，避免 HTML 模板缩进被渲染成大片空白导致导航卡片高度异常。
- 页面浮层采用紧凑版间距：header、导航、卡片、Banner、按钮、输入框、趋势图图例、summary 和 workflow 列表都压缩了 margin/padding；主卡片与嵌套卡片的内边距进一步缩小，使卡片高度更接近文字实际占用空间。
- 页面浮层的“竞对建议价”卡片与 Popup 同步展示竞对趋势：支持刷新竞对趋势图、切换主流房型最低价/竞对酒店最低价、查看折线图、曲线明细、竞对酒店来源和配置链接。
- 页面浮层的商家改价主流程与 Popup 同步提供“读取当前页房型价 -> 生成房型建议价 -> 一键回填建议价 -> 确认最终价并提交”；其中“读取当前页房型价”使用当前标签页链路读取本店房型价，避免页面浮层继续依赖隐藏商家连接 URL。
- 页面浮层不再在面板内直接承接插件账号登录表单，而是统一引导到设置页处理登录、当前配置和当前页面摘要。
- `background.js` 是统一代理层：负责配置读写、Bearer Token 注入、店铺切换、竞对酒店配置数据库读写、采集参数拼装、商家改价动作代理、竞对酒店详情页房型价抓取代理、独立竞对建议价请求拼装和运行时消息分发；插件 alarm 仅定时拉取云端趋势接口并基于云端趋势快照触发通知，不再本地打开飞猪页面执行采集。
  - 商家改价现在优先走本地已登录浏览器接管：`background.js` 定位已打开的飞猪商家后台标签页，`content.js` 读取当前页房型价并通过 `merchant_items` 传给后端生成建议价；二次确认后，真实填价和保存由同一个本地商家后台标签页执行，后端不再作为默认真实改价执行环境。
- 当前页识别逻辑从 `content.js` 中拆出到 `content/page-context.js`；结果渲染从 `content.js` 中拆出到 `content/result-view.js`。
- 插件当前以 `/plugin/auth/login`、`/plugin/auth/logout`、`/plugin/auth/me`、`/plugin/auth/shops`、`/plugin/auth/switch-shop` 完成账号登录与店铺切换，并通过 `/plugin/competitor/hotels` 按当前店铺读写竞对酒店配置。
- 插件继续复用现有 `/plugin/service-status`、`/plugin/competitor/latest-prices`、`/plugin/competitor/room-price-trends`、`/plugin/fliggy/collect`、`/plugin/pricing/merchant-preview`、`/plugin/pricing/competitor-workflow-preview`、`/plugin/pricing/competitor-advice-preview` 等后端接口，仍然复用现有后端服务而非新增重型插件业务层；其中商家建议价接口可接收插件本地采集的 `merchant_items`，真实改价默认不再调用云端直提，而由本地 content script 接管已登录商家后台页面完成。
- 插件内目前覆盖三类能力：
  - 登录与店铺上下文：账号登录、会话刷新、退出登录、切换当前店铺、按店铺读取竞对酒店配置。
  - 直接动作：服务状态、当前页识别、当前页采集、实时竞对最新价格、页面浮层、设置页。
  - 价格与商家链路：竞对房型价抓取、按房型生成建议价、人工调整最终价后确认提交、统一目标价备用提交、商家连接、价格映射刷新。
- 页面内商家改价入口当前恢复为单链接模式：读取房型和确认提交仅使用“商家价格页 URL”，默认指向飞猪 `roomsVsManage`，不再使用页面内多平台改价链接配置。
- 页面内商家“读取房型”入口已恢复到原本的 `cdp_current_page` 主链路，不再在内容脚本里强制写死 `prefer_cdp`；这样会优先接管当前已打开的商家价格页，而不是先走 `prefer_cdp -> storage_state` 回退。
- 商家房型读取继续走既有后端桥接链路；当商家价格页已到目标 URL 但房型表延迟渲染时，后端会在 CDP 与 storage_state 采集路径下短轮询等待可解析房型文本；HWHT 页面在无头会话下若仍未出现房型价，会先尝试触发“展开全部房型”再解析；若 `prefer_cdp` 成功连接但仍未解析到任何房型，也会继续回退到已保存会话，避免插件静默显示全 0 结果。
- 对 HWHT 的 `storage_state` 会话继续增加登录页识别兜底：若无头页实际落到淘宝统一登录页（如 `login.taobao.com/havanaone/login`，或页面出现“密码登录/短信登录/手机扫码登录/忘记账号”等文案），后端直接判定为登录失效，而不是返回空房型成功结果。
- 插件继续遵守当前飞猪游客采集约束：不自动登录飞猪、不新开浏览器；页面内插件采集优先使用当前页 DOM 快照，旧的 `cdp_current_page` 仅保留给历史脚本链路。
- 当前竞对酒店配置以后端数据库为主存，浏览器本地 `competitorHotels` 仅用于首次登录后的单店迁移兜底；登录态下 Popup / Content 优先信任 runtime 配置，避免把旧本地配置混回当前店铺。


- ??????????????????? `merchant_price_mappings` ????????Popup ????????????????????????????????????????????? `manualRoomMappings`?

## 依赖关系

- `browser-extension/manifest.json`：定义 MV3 清单、权限和内容脚本加载顺序。
- `browser-extension/background.js`：统一处理登录态、店铺切换、竞对酒店配置、本地 API 请求和运行时消息分发。
- `browser-extension/bridge.js`：在内容脚本降级链路下继续携带 Bearer Token 与当前店铺上下文访问后端接口。
- `browser-extension/content/page-context.js`：识别当前飞猪页面上下文并提取价格卡片。
- `browser-extension/content/result-view.js`：提供页面浮层和 popup 共用的结果格式化与 HTML 渲染辅助。
- `browser-extension/content.js`：装配页面浮层本地 Popup iframe，并在内容脚本中响应 `GET_PAGE_CONTEXT` / `GET_PAGE_SNAPSHOT` / `OPEN_PANEL`，同时保留云端 UI 固定消息协议代码。
- `browser-extension/popup.html` / `browser-extension/popup.js`：插件默认本地完整工作台，负责分组导航、基础功能子导航、直接动作和商家改价直连动作；未登录时只保留跳转设置页的闸门卡。
- `browser-extension/popup-shell.html` / `browser-extension/popup-shell.js`：云端 UI 壳实验入口，负责加载云端 UI、校验 `http://api.aihuawise.com` 来源、转发白名单 runtime 消息、桥接当前活动业务页和本地备用入口。
- `browser-extension/options.html` / `browser-extension/options.js`：维护账号登录、当前店铺切换、当前配置/当前页面摘要，以及当前登录店铺的插件配置与多条竞对酒店详情页配置。
- `backend/app/static/ops-assistant/index.html` / `style.css` / `app.js`：云端 UI 静态页面，通过 `/ops-assistant` 暴露给插件 iframe，使用固定协议调用插件壳能力。
- `backend/app/main.py`：暴露 `/ops-assistant` 和 `/ops-assistant/<asset>`，HTML 使用 `no-store`，静态资源使用长期缓存。
- `backend/app/api/plugin_routes.py`：提供插件使用的后端接口，包括插件鉴权、店铺级竞对酒店配置、实时最新价、当前页采集、商家改价桥接和竞对酒店房型价抓取。
- `backend/app/api/deps.py`：统一解析插件 Bearer Token、当前店铺上下文，并兼容原有 Session/Header 解析逻辑。
- `backend/app/services/plugin_auth_service.py`：负责插件 Bearer Token 生命周期、当前店铺切换和登录态查询。
- `backend/app/services/competitor_hotel_config_service.py`：负责店铺级竞对酒店配置表初始化、查询、替换保存与排序去重。
- `backend/tests/test_browser_extension_assets.py`：覆盖插件资源结构与核心入口断言。
- `backend/tests/test_plugin_api_routes.py`：覆盖插件鉴权、店铺级竞对酒店配置和插件桥接接口行为断言。
