# 任务清单: streamlit-flask-consolidation

```yaml
@feature: streamlit-flask-consolidation
@created: 2026-03-19
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 21/21 (100%) | 更新: 2026-03-19 10:05:00
当前: Flask 统一控制台整合、文档同步与关键路由验证已完成
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 21 | 0 | 0 | 21 |

---

## 任务列表

### 1. 信息架构与公共壳层整合
- [√] 1.1 在 `backend/app/templates/base.html` 中重构侧边导航，补齐总览、商家定价、营收评论等统一入口。
- [√] 1.2 在 `backend/app/templates/index.html` 与 `backend/app/web/routes.py` 中扩展首页总览承载能力，纳入健康检查、房态、告警、日报等聚合信息。
- [√] 1.3 在 `backend/app/web/common.py` 中补充页面级公共辅助能力，支持统一消息回显、表单解析与上下文注入。

### 2. 操作总览能力补齐
- [√] 2.1 在 `backend/app/web/ops.py` 中新增或调整总览相关路由，承接健康检查、房态、告警、日报的页面请求。
- [√] 2.2 在 `backend/app/templates/ops/` 下新增或改造对应模板，完成概览能力从 Streamlit 到 Flask 的映射。
- [√] 2.3 校准首页、操作中心与总览页之间的职责边界，避免重复入口与重复展示。

### 3. 商家定价蓝图搭建
- [√] 3.1 新增 `backend/app/web/pricing.py`，建立商家定价与自动改价的独立蓝图。
- [√] 3.2 在 `backend/app/main.py` 中注册新蓝图，并将其纳入 Web 入口白名单与导航体系。
- [√] 3.3 在 `backend/app/templates/pricing/` 下建立基础模板骨架与复用片段。

### 4. 商家连接与抓取链路迁移
- [√] 4.1 在 `backend/app/web/pricing.py` 与 `backend/app/templates/pricing/merchant_credentials.html` 中实现商家连接配置页面。
- [√] 4.2 在 `backend/app/web/pricing.py` 与 `backend/app/templates/pricing/merchant_session.html` 中实现商家会话登录与状态回显页面。
- [√] 4.3 在 `backend/app/web/pricing.py` 与 `backend/app/templates/pricing/merchant_collect.html` 中实现商家价格抓取/预览入口。

### 5. 商家映射与 AI 改价链路迁移
- [√] 5.1 在 `backend/app/web/pricing.py` 与 `backend/app/templates/pricing/merchant_mapping.html` 中实现价格映射管理页面。
- [√] 5.2 在 `backend/app/web/pricing.py` 与 `backend/app/templates/pricing/merchant_pricing.html` 中实现 AI 建议、人工确认、直接提交工作流。
- [√] 5.3 为商家定价链路设计显式表单与轻量状态传递方案，替代 `Streamlit session_state`。

### 6. 营收、评论、月度计划与自动改价页面补齐
- [√] 6.1 在 `backend/app/web/pricing.py` 或新增对应 Web 模块中实现月度计划、自动改价规则/执行/历史页面。
- [√] 6.2 在 `backend/app/templates/` 下新增营收记录、营收汇总、评论分析、评论历史对应模板，并挂接现有服务层能力。
- [√] 6.3 将上述页面接入统一导航，并确保与当前门店上下文一致。

### 7. 下线与验收
- [√] 7.1 更新 `backend/README.md`、`启动说明，功能概述.txt` 与必要知识库记录，明确 Flask 为唯一入口。
- [√] 7.2 评估并清理 `Streamlit` 遗留入口说明与 `/auth/streamlit-login` 等过渡能力，确保不再作为系统主入口。
- [√] 7.3 启动 Flask 并完成关键流程联调验证，至少覆盖总览、商家定价、竞对市场、营收评论四类核心场景。

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-03-19 09:06:00 | 方案设计 | completed | 已确定采用渐进式页面补齐方案，并创建实施方案包。 |
| 2026-03-19 09:45:00 | 开发实施 | completed | Flask 总览页、运营总览页、商家定价蓝图及各子页面已落地。 |
| 2026-03-19 10:05:00 | 验证与文档同步 | completed | 已完成 `compileall`、控制台路由冒烟、README/启动说明/变更记录同步。 |

---

## 执行备注

> 记录执行过程中的重要说明、决策变更、风险提示等

- 当前方案按“先整合页面入口，再补复杂业务链路，最后下线 Streamlit”推进。
- 商家定价链路是本次迁移的最高风险区，开发阶段必须优先保证其状态流转与提交流程可用。
- 已保留 `backend/streamlit_app.py` 作为兼容性参考文件，但主入口和新增页面已统一切换到 Flask Web。
