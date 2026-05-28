> **@status:** completed | 2026-03-14 14:11

﻿# 任务清单: merchant-price-capture

```yaml
@feature: merchant-price-capture
@created: 2026-03-14
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: in_progress | 进度: 0/10 (0%) | 更新: 2026-03-14 13:42:00
当前: 1.1 填充方案包并准备实施文件清单
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 10 | 0 | 0 | 10 |

---

## 任务列表

### 1. 方案与上下文准备

- [ ] 1.1 填充方案包并固定实施任务
- [ ] 1.2 复核现有自动定价、审批、推价链路的复用边界

### 2. 控制台连接修复与配置扩展

- [ ] 2.1 在 `backend/streamlit_app.py` 中修复默认后端地址为 `http://127.0.0.1:8000`
- [ ] 2.2 在 `backend/app/schemas/shop.py` 与 `backend/app/services/shop_service.py` 中扩展门店商家抓取配置字段

### 3. 商家登录与价格抓取实现

- [ ] 3.1 在 `backend/app/schemas/competitor.py` 中新增商家登录与商家价格抓取请求模型
- [ ] 3.2 在 `backend/app/services/competitor_service.py` 中实现飞猪商家登录会话保存
- [ ] 3.3 在 `backend/app/services/competitor_service.py` 中实现复用会话的价格抓取
- [ ] 3.4 在 `backend/app/api/routes.py` 中暴露商家登录与抓取 API

### 4. 自动定价接入与验证

- [ ] 4.1 在 `backend/app/services/auto_pricing_service.py` 中优先接入商家抓取结果
- [ ] 4.2 在 `backend/streamlit_app.py` 中增加商家登录抓取界面并衔接现有定价入口
- [ ] 4.3 补充测试与 README/知识库同步

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-03-14 13:42:00 | 1.1 | in_progress | 方案 A 已确认，开始实施 |

---

## 执行备注

> 记录执行过程中的重要说明、决策变更、风险提示等

- 本次只实现“人工确认后改价”，不放开无确认自动改价。
- 若飞猪商家后台必须扫码/短信验证，则优先采用保存会话方案。
