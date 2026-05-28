# 任务清单: merchant-ai-pricing-panel

```yaml
@feature: merchant-ai-pricing-panel
@created: 2026-03-15
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 14/14 (100%) | 更新: 2026-03-15 19:20:00
当前: 已完成商家价格审计、目标测试与知识库同步，方案包可归档
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 14 | 0 | 0 | 14 |

---

## 任务列表

### 1. 数据与配置层
- [√] 1.1 在 `backend/app/services/shop_service.py` 中修复旧 `shops` 表 schema 漂移兼容，确保历史库可安全读写配置。
- [√] 1.2 新增商家凭据存储模型与读写服务（独立表），支持账号、加密密码、登录/价格页地址与 selectors。
- [√] 1.3 新增商家价格项映射模型，支持房型/价码到 `gid/hid` 的业务键映射。

### 2. 商家登录与抓价
- [√] 2.1 在 `backend/app/services/fliggy_merchant_service.py` 中修正登录成功判定，避免“有 cookie 即成功”的误判。
- [√] 2.2 为当前商家后台补充专用 selectors 与抓价标准化输出，正确命中真实价格主表。
  - 依赖: 2.1
- [√] 2.3 新增只读抓价接口，返回标准化价格项和映射状态，不触发真实改价。
  - 依赖: 1.2
  - 依赖: 1.3
  - 依赖: 2.2

### 3. AI 建议与改价闭环
- [√] 3.1 复用 `auto_pricing_service`，新增面向商家价格项的建议价预览接口，结合历史数据与库存生成待确认清单。
- [√] 3.2 在 `workflow_service` / `action_executor` 中接入人工确认后的提交链路，确保真实推价仍走现有渠道模板渲染与推送能力。
  - 依赖: 3.1
- [√] 3.3 明确 dry-run、预览和正式提交三种状态的审计记录输出。
  - 依赖: 3.2

### 4. Streamlit 面板
- [√] 4.1 在 `backend/streamlit_app.py` 中新增“商家连接”页面，支持配置账号、密码、地址、selectors 和会话刷新。
- [√] 4.2 在 `backend/streamlit_app.py` 中新增“价格管理”页面，展示抓取价格、AI 建议、风险信息与待确认改价清单。
  - 依赖: 2.3
  - 依赖: 3.1
- [√] 4.3 在 `backend/streamlit_app.py` 中新增人工确认提交交互，并展示提交结果与失败原因。
  - 依赖: 3.2
  - 依赖: 4.2

### 5. 测试与知识库同步
- [√] 5.1 新增/更新后端测试，覆盖凭据存储、登录判定、价格抓取、建议预览与确认提交链路。
- [√] 5.2 更新 `.helloagents` 知识库与 `CHANGELOG.md`，同步本次新能力、数据模型和风险边界。
  - 依赖: 1.1
  - 依赖: 5.1

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-03-15 15:10:00 | design | completed | 已确认采用方案A，并生成实施方案包 |
| 2026-03-15 16:10:00 | 1.1 | completed | 修复 `shops` 旧 schema 漂移兼容，并补充回归测试 |
| 2026-03-15 16:22:00 | 1.2 | completed | 新增 `merchant_connection_service.py`，支持 DPAPI 加密密码存储与掩码读取 |
| 2026-03-15 16:28:00 | 1.3 | completed | 新增 `merchant_price_mapping_service.py`，支持房型/价码到 `gid/hid` 映射 |
| 2026-03-15 16:35:00 | 2.1 | completed | 登录成功判定改为验证业务页/成功态，不再接受 cookie-only 误判 |
| 2026-03-15 17:05:00 | 2.2 | completed | 内置 ebooking.hwht.com 专用 selectors，并新增正文文本回退解析，优先识别 标准价-* 价格项 |
| 2026-03-15 17:12:00 | 2.3 | completed | 新增 /merchant/fliggy/prices/preview 只读接口，返回标准化价格项与映射状态 |
| 2026-03-15 17:42:00 | 3.1 | completed | 新增 merchant_pricing_service.py 与 /pricing/merchant-preview，按价格项生成 AI 建议预览清单 |
| 2026-03-15 17:55:00 | 3.2 | completed | 新增 /pricing/merchant-confirm，复用 create_action + approve_action + FliggyClient.push_price 完成确认后提交流程 |
| 2026-03-15 18:55:00 | 4.1-4.3 | completed | Streamlit 已接入商家连接回填、只读价格预览、AI 建议与人工确认提交流程 |
| 2026-03-15 19:05:00 | 3.3 | completed | 新增 merchant_pricing_audits 审计表，明确 preview/dry_run/formal_submit 三段状态并回传 audit 结果 |
| 2026-03-15 19:10:00 | 5.1 | completed | 补充商家价格预览与确认提交审计测试，目标回归 16 passed |
| 2026-03-15 19:20:00 | 5.2 | completed | 已同步 CHANGELOG 与 context，补充商家 AI 改价能力与风险边界说明 |

---

## 执行备注

> 真实改价提交必须保留人工确认闸门；凭据不可明文回显；商家页抓价与渠道推价保持解耦。
> 当前商家后台登录含验证码，线上验收需在会话刷新后再做一轮真实页面核验。









