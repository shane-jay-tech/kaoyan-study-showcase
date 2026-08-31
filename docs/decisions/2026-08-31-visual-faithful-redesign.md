# 当前产品视觉忠实复刻与全量脱敏

日期：2026-08-31
状态：已验证并发布（GitHub Pages）

## 原始需求

用户认为已发布的公开站与当前学习产品不够相像，希望外观展示和当前产品一致，同时不保留任何隐私信息。确认范围为全站逐页复刻，使用现有公开镜像改造。

## 决策

采用“现有公开镜像 + 当前产品视觉基线 + 脱敏适配”的路线：重做公开 AppShell、全局视觉 tokens、共享页面 primitives 和所有公开 route composition；继续使用现有公开 fixture 与内存 reducer；不搬运私有 JSX、API、数据库、认证或运行时资源。

## 选择标准

- 正确性：视觉/结构/状态关系能由当前产品源码基线复核。
- 隐私：具体院校、专业、目标、历史、题库、路径、ID、时间戳、URL 和凭据不进入公开运行时或附件。
- 隔离：公开站保持静态、无网络、无持久化、无私有依赖。
- 可维护：保持一个 fixture owner、一个 reducer owner、一个路由 owner、一个样式 owner。
- 可验证：每个路由有桌面/手机/窄平板检查，附件从最终 build 生成并做新鲜哈希校验。

## 备选方案

1. 直接在公开镜像上重做现有 owner：采用。能满足视觉和行为目标，不扩大隐私边界。
2. 搬运私有 JSX 后做数据适配：驳回。会引入服务端、认证、API 和私有组件耦合，泄漏面和维护成本不可接受。
3. 只做截图/CSS 仿制：驳回。无法稳定保留全站路由状态和交互闭环。

## 架构完整性

- canonical fixture：`src/data/public-source-mirror.ts`
- canonical state：`src/lib/demo-state.ts`
- canonical route/navigation：`src/components/AppShell.tsx`
- canonical visual system：`src/styles.css`
- 旧 compact 文件只作为兼容载体保留，不能重新获得 active route 或 fixture ownership。
- 不新增服务 adapter、网络 fallback、数据库或持久化 owner。

## 边界与未决证据

- 公开仓库和固定 Pages 地址保持不变。
- 私有产品只读检查；未认证访问保持拒绝，不使用 ambient session 或绕过权限。
- 由于没有授权的私有渲染截图，视觉证据以源码基线、公开 DOM/截图和尺寸/token 断言为主；最终报告需明确这个残余风险。
- 认证、迁移和 readiness 不属于静态公开镜像的执行路径，最终审计标为 `NOT APPLICABLE`，不伪造通过。

## 记录

- Aegis spec：`docs/aegis/specs/2026-08-31-visual-faithful-redesign.md`
- Aegis plan：`docs/aegis/plans/2026-08-31-visual-faithful-redesign.md`
- Aegis work：`docs/aegis/work/2026-08-31-visual-faithful-redesign/`
- 模型参与：总指挥完成源码基线、设计决策和计划；未声称其他模型参与。
- 评审结果：设计与计划自审通过；无 BLOCKER/CRITICAL 结论。
- 当前执行路线：inline，原因是多个路由共享同一 `MirrorPages.tsx` 与 `styles.css`，串行 owner 变更更可控。

## 最终验证记录

- 本地回归：`npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd test`（31 tests）、`npm.cmd run test:browser`（9 passed，1 intentional desktop skip）和 `npm.cmd run build` 均通过。
- 交付物：PDF 5 页且可选文本，ZIP 离线包可解压并启动；`npm.cmd run verify:artifacts` 全部检查通过。
- 脱敏：`npm.cmd run audit:privacy` 在源码、dist、PDF 文本、ZIP 清单/内容共 74 个文本面通过；截图 OCR 因环境缺少 `tesseract + chi_sim` 如实记为 SKIP。
- 线上：GitHub Actions run `33410145708` 成功，部署 job `99547571982` 成功；桌面/移动线上 17 路由均可见、无外部请求、无控制台或页面错误、无横向溢出。
- 线上附件：manifest、PDF、ZIP 与本地最终构建哈希一致；线上 PDF `631536` bytes，ZIP `2124587` bytes。
- 适用性：公开镜像无敏感数据路径，认证、迁移、readiness 检查均为 `NOT APPLICABLE`，没有伪造通过结果。
- 残余风险：没有授权的私有系统登录态渲染截图，因此无法完成像素级私有页面对照；当前视觉结论基于只读源码基线、公开 DOM/截图和尺寸/token 断言。
