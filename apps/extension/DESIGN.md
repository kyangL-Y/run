# 飞猪运营助手浏览器插件设计文档

## 设计目标

`apps/extension/` 是飞猪运营助手的浏览器扩展模块，目标是在 Chrome/Edge 中提供本地完整工作台、页面内运营浮层和受控后端桥接能力。扩展需要在飞猪、淘宝、携程、美团等运营页面中识别当前上下文，读取价格相关页面信息，并把登录态、店铺上下文和 API 请求统一交给扩展后台脚本处理。

模块设计优先保证可本地加载、可人工确认、可回退到现有业务页面，不在浏览器扩展中塞入重型后端逻辑。

## 方案选择

当前采用 Manifest V3 原生扩展结构：

- `manifest.json` 声明扩展权限、host permissions、content scripts 和 web accessible resources。
- `background.js` 作为 service worker，统一处理配置、登录态、店铺上下文、后端 API 代理和跨标签页操作。
- `popup.html` / `popup.js` 作为右上角默认入口，也供页面浮层 iframe 以 embedded 模式复用。
- `content.js` 负责页面浮层、当前页识别、页面快照、本地商家后台读取/回填和云端协议转发。
- `bridge.html` / `bridge.js` 作为内容脚本降级桥，在 runtime 消息不可用时继续调用受控后端能力。
- `options.html` / `options.js` 承担账号登录、店铺切换、基础配置和竞对酒店配置维护。
- `content/page-context.js` 与 `content/result-view.js` 分别承接页面识别和结果渲染辅助。

选择原生 JS 与静态 HTML/CSS，是为了让扩展可以直接作为未打包目录加载，减少 PoC 阶段构建依赖。

## 关键决策

- 默认 Popup 使用本地完整工作台，页面右下角浮层通过 iframe 加载同一套 `popup.html?embedded=1`，避免 HTTPS 业务页面嵌入 HTTP 云端 UI 被浏览器拦截。
- 云端 UI 壳保留在 `popup-shell.html` / `popup-shell.js`，当前只作为实验入口；切回默认入口前必须具备 HTTPS 域名。
- `background.js` 负责 Bearer Token 注入，content script 和 popup 尽量通过 runtime 消息请求能力，减少散落的 API 调用。
- `bridge.js` 只接受扩展自身和受支持业务平台 origin 发来的 bridge 请求，响应时回发到请求 origin，不再使用通配符 target。
- `content.js` 向 `bridge.html` 发送消息时指定扩展 origin，并只接收来自扩展 origin 的 bridge 响应。
- 云端 `postMessage` 协议固定为 `fliggy-ops-cloud-ui/v1`，并使用来源、source、协议和请求类型共同校验。
- 所有真实改价或平台回填必须保留人工确认，不自动提交未勾选项。

## 已知限制

- `background.js`、`content.js` 和 `popup.js` 文件体积较大，后续应按消息协议、渲染、平台适配和商家工作流逐步拆分。
- 浏览器扩展没有独立测试目录，当前基础验证依赖 `node --check` 和人工加载扩展。
- HTTP 后端与云端 UI 地址仍存在于配置中，生产化前应切换到 HTTPS 并重新审视 token 传输风险。
- `chrome.storage.sync` 中仍可能存在历史迁移配置，敏感凭据的长期存储策略需要单独加固。

## 变更历史

- 2026-06-02: 新增扩展模块设计文档，并记录 bridge 来源校验与消息目标收紧决策。
