# 项目上下文

## 基本信息

- 项目类型：酒店运营 AI PoC
- 主要代码目录：`backend/`、`browser-extension/`
- 主要技术栈：Flask、SQLAlchemy、Chrome/Edge Extension（Manifest V3）

## 当前任务上下文

- 最新目标：将当前已跑通的飞猪核心链路整理为更适合浏览器插件使用的结构。
- 插件主入口已恢复为：右上角 `popup.html` / `popup.js` 本地完整工作台，页面浮层 iframe 加载同一个 `popup.html?embedded=1`；`popup-shell` 和 `/ops-assistant` 云端 UI 暂作为 HTTP 测试入口保留。
- 当前插件核心链路保留：页面识别、服务状态、读取竞对价格、按当前页采集；其中“按当前页采集”已改为浏览器插件优先使用当前标签页 DOM 快照的 `extension_page` 模式。
- 插件多店铺基线：插件请求优先走 `Authorization: Bearer <token>`，后端从插件 token 解析当前 tenant/shop；原有 `X-Tenant-Id` + `X-Shop-Id` 仍保留为兼容兜底。
- 当前店铺的竞对酒店配置已迁移到数据库表 `competitor_hotels`，浏览器本地 `competitorHotels` 只保留首次登录后的迁移兜底。
- 安全边界：商家凭据仅以 Windows DPAPI 加密存储；真实改价必须保留人工确认闸门；飞猪游客采集继续要求当前浏览器页面已登录，插件当前页采集不再要求本机 `9222` 调试端口。

## 已识别关键模块

- `browser-extension/manifest.json`：定义浏览器插件入口、权限和内容脚本加载顺序。
- `browser-extension/background.js`：统一插件登录态、店铺切换、店铺级竞对配置、本地 API 请求和消息协议。
- `browser-extension/bridge.js`：内容脚本降级链路的 Bearer Token 桥接代理。
- `browser-extension/content/page-context.js`：定义飞猪页面上下文识别逻辑。
- `browser-extension/content/result-view.js`：定义插件结果渲染辅助函数。
- `browser-extension/content.js`：注入右下角运营助手浮层，加载本地完整 Popup iframe，并提供当前页读取/回填能力。
- `browser-extension/popup.html` / `browser-extension/popup.js`：右上角默认本地完整工作台。
- `browser-extension/popup-shell.html` / `browser-extension/popup-shell.js`：云端 UI 壳实验入口，当前不作为默认 Popup。
- `backend/app/static/ops-assistant/`：后端内置云端 UI 页面，供 `/ops-assistant` 访问。
- `backend/app/api/plugin_routes.py`：提供插件使用的后端鉴权、店铺级竞对酒店配置、服务状态、竞对价格和当前页采集接口，并兼容 `extension_page` 页面快照采集模式。
