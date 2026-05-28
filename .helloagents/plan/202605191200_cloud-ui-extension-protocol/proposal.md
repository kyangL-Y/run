# 方案: cloud-ui-extension-protocol

## 类型

implementation

## 背景

页面内“运营助手”此前由插件本体承载本地 UI。这样每次调整页面样式或业务按钮都需要重新发布插件，其他电脑也必须重新加载扩展。

本阶段目标是把页面内业务 UI 迁移到云端，插件本体只保留稳定能力边界：权限、页面采集、页面回填、运行时消息代理和本地 Popup 备用入口。

## 决策

cloud-ui-extension-protocol#D001: 页面内助手加载 `http://api.aihuawise.com/ops-assistant`，插件侧通过 `fliggy-ops-cloud-ui/v1` 固定 `postMessage` 协议开放受控能力。

## 范围

- 修改 `apps/frontend/extension/content.js`，将页面内浮层 iframe 从本地 `popup.html` 改为云端 UI。
- 保留 `popup.html` / `popup.js` 作为浏览器右上角本地备用入口。
- 在 `content.js` 中增加云端 UI 消息协议、来源校验、runtime 消息白名单和页面能力动作。
- 更新 `manifest.json` 版本与描述。
- 更新插件 README、知识库模块文档和资产测试。

## 验收

- 页面内“运营助手”按钮仍可打开面板。
- 面板 iframe 指向 `http://api.aihuawise.com/ops-assistant`。
- 云端 UI 只能从 `http://api.aihuawise.com` 通过 `fliggy-ops-cloud-ui/v1` 协议调用插件能力。
- Popup 仍保持本地入口，不改业务文件。
- `test_browser_extension_assets.py` 通过。
