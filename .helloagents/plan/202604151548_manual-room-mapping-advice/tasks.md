# 任务清单: manual-room-mapping-advice

```yaml
@feature: manual-room-mapping-advice
@created: 2026-04-15
@status: in_progress
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: pending | 进度: 0/8 (0%) | 更新: 2026-04-15 15:50:00
当前: 方案设计完成，等待进入开发实施
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 7 | 0 | 0 | 8 |

---

## 任务列表

### 1. 扩展配置模型与设置页
- [?] 1.1 在 `browser-extension/background.js` 中新增 `manualRoomMappings` 的 normalize、shop 维度读写和配置合并逻辑
- [?] 1.2 在 `browser-extension/options.html`、`browser-extension/options.js` 中新增“我的房型映射”编辑器，支持维护房型名称、类型、当前价、竞对匹配词和启用状态
  - 依赖: 1.1

### 2. 建议价请求接线
- [?] 2.1 在 `browser-extension/background.js` 中扩展 `buildCompetitorPricingAdvicePayload`，自动附带当前店铺的手工房型配置
- [?] 2.2 在 `browser-extension/popup.js` 与 `browser-extension/content.js` 中调整建议价入口校验：存在手工房型配置时不再强制填写单一当前售价，并更新提示文案
  - 依赖: 2.1

### 3. 后端接口与服务
- [?] 3.1 在 `backend/app/schemas/pricing.py` 与 `backend/app/api/plugin_routes.py` 中新增 `manual_room_mappings` 请求模型和透传逻辑
- [?] 3.2 在 `backend/app/services/competitor_pricing_advice_service.py` 中新增手工房型归一化入口，并在有配置时替代本店快照生成 `merchant_rooms`
  - 依赖: 3.1
- [?] 3.3 在 `backend/app/services/competitor_pricing_advice_service.py` 中实现“显式竞对房型映射优先，模糊匹配兜底”的匹配策略与返回摘要
  - 依赖: 3.2

### 4. 验证与知识库同步
- [?] 4.1 在 `backend/tests/test_competitor_pricing_advice_service.py` 及相关插件测试中补充手工房型映射的回归测试
- [?] 4.2 同步 `.helloagents/modules/` 文档与 `.helloagents/CHANGELOG.md`，完成接口/前端冒烟验证并准备归档
  - 依赖: 4.1

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-15 15:50:00 | design | pending | 已确认采用方案 A，方案包已创建并填充详细规划 |

---

## 执行备注

> 本轮按用户确认的方案 A 规划：手工房型映射优先保存在插件设置中，建议价请求透传到后端，后端优先按手工映射生成房型级建议价；未配置时保留旧的本店快照兜底路径。