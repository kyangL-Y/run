# 任务清单: plugin-multi-shop-auth

> **@status:** completed | 2026-04-14 11:39

```yaml
@feature: plugin-multi-shop-auth
@created: 2026-04-14
@status: completed
@mode: R3
```

<!-- LIVE_STATUS_BEGIN -->
状态: completed | 进度: 14/14 (100%) | 更新: 2026-04-14 12:20:00
当前: 开发、测试与知识库同步完成，待归档方案包
<!-- LIVE_STATUS_END -->

## 进度概览

| 完成 | 失败 | 跳过 | 总数 |
|------|------|------|------|
| 14 | 0 | 0 | 14 |

---

## 任务列表

### 1. 插件鉴权与店铺上下文
- [√] 1.1 在 `backend/app/services/` 下新增插件鉴权服务，支持登录、token 校验、登出、切换当前店铺
- [√] 1.2 在 `backend/app/api/plugin_routes.py` 中新增 `/plugin/auth/login`、`/plugin/auth/logout`、`/plugin/auth/me`、`/plugin/auth/shops`、`/plugin/auth/switch-shop`
- [√] 1.3 在 `backend/app/api/deps.py` 中补充插件 token 解析，兼容现有 Header 校验逻辑

### 2. 店铺级竞对酒店配置持久化
- [√] 2.1 在 `backend/app/services/` 下新增竞对酒店配置表初始化与 CRUD 服务
- [√] 2.2 在 `backend/app/api/plugin_routes.py` 中新增店铺级竞对酒店配置查询与保存接口
- [√] 2.3 为竞对酒店配置服务补数据库约束与排序、去重、启用状态规则

### 3. 插件背景代理改造
- [√] 3.1 在 `browser-extension/background.js` 中新增登录态存储、当前用户、当前店铺、token 注入逻辑
- [√] 3.2 在 `browser-extension/background.js` 中新增登录、登出、读取当前会话、获取店铺列表、切换店铺的消息处理
- [√] 3.3 将现有竞对酒店配置读取逻辑改为走后端数据库接口，不再以本地 `competitorHotels` 为主

### 4. Popup 与设置页重构
- [√] 4.1 在 `browser-extension/popup.html` / `popup.js` 中增加登录页、当前用户摘要、店铺切换入口
- [√] 4.2 在 `browser-extension/options.html` / `options.js` 中改为“当前店铺竞对配置页”，保存到数据库
- [√] 4.3 在 `browser-extension/content.js` 中增加未登录提示和当前店铺上下文展示

### 5. 现有业务链路接入登录态
- [√] 5.1 让按当前页采集、竞对房型价抓取、商家连接、价格映射请求统一走 token + 当前店铺
- [√] 5.2 处理店铺切换后的缓存失效、页面状态刷新、手工目标复位

### 6. 迁移、测试与收尾
- [√] 6.1 提供一次性本地竞对酒店配置导入当前店铺的兼容迁移逻辑
- [√] 6.2 补充后端 API、配置服务、插件资源与核心登录流测试
- [√] 6.3 同步知识库与变更记录，清理遗留说明文本

---

## 执行日志

| 时间 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-14 11:15:00 | design | completed | 已确定方案 A，进入开发实施前规划完成 |
| 2026-04-14 11:40:00 | 1-5 | completed | 插件鉴权、多店铺切换、店铺级竞对配置与业务链路接入完成 |
| 2026-04-14 12:05:00 | 6.2 | completed | 补充插件资源断言与插件鉴权/店铺级竞对配置 API 测试 |
| 2026-04-14 12:20:00 | 6.3 | completed | 已同步知识库、README 与 CHANGELOG，准备归档方案包 |

---

## 执行备注

> 第一阶段优先打通“登录 -> 读取可访问店铺 -> 切换店铺 -> 读取当前店铺竞对配置”主链路，再接入现有采集与改价能力，避免一次性大改导致难以定位问题。
