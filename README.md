# 考研智学系统 · 公开演示站（kaoyan-study-showcase）

一个完全隔离、隐私安全的交互式考研学习工作台公开演示。页面内的全部数据均为虚构合成内容，不包含任何真实学校、专业、分数、学习历史、路径或凭据；运行时无后端、无数据库、无账号体系、无 AI 调用、无第三方网络请求。

- 公开地址：https://shane-jay-tech.github.io/kaoyan-study-showcase/
- 交付物：交互网页 · PDF 产品案例 · ZIP 离线演示包

## 功能视图

| 视图 | 内容 |
| --- | --- |
| 今日 | 下一步行动、四项学习指标、任务完成交互、近 14 天活动 |
| 计划 | 容量感知的时段分组计划、延期决策与原因记录 |
| 练习 | 三题短练习，确定性示例反馈与解析 |
| 复习 | 两次间隔复测的错题闭环（通过一轮 → 观察 → 关闭） |
| 洞察 | 学科正确率、时长分布、复习压力与证据化建议 |
| 产品案例 | 产品判断、架构与验证说明，以及 PDF / ZIP 下载入口 |

## 技术栈

React 19 · TypeScript · Vite · Vitest · Lucide 图标 · 纯 CSS / SVG 图表

## 本地开发

```bash
npm install        # 按 package-lock.json 安装依赖
npm run dev        # 本地开发服务器
npm run typecheck  # TypeScript 类型检查
npm run lint       # ESLint 代码检查
npm test           # Vitest 单元测试
npm run build      # 生产构建（base 为 /kaoyan-study-showcase/）
npm run preview    # 本地预览构建产物
```

## 架构与隐私边界

- **唯一数据所有者**：`src/data/demo-fixtures.ts` —— 全部为虚构合成内容。
- **唯一可变状态所有者**：`src/lib/demo-state.ts` 的 reducer；派生指标一律由选择器计算，不重复存值。
- **hash 路由**：路由编码在 URL hash 中，任意静态托管（含 GitHub Pages）下深层视图可直达，无需服务器改写。
- **内存态演示**：状态仅存于内存，刷新页面即回到初始合成场景，不写任何持久化存储。
- **零运行时网络**：无 API 客户端、无分析脚本、无远程字体/图片、无 Service Worker、无认证流程。
- **未来边界**：若日后引入敏感数据路径，必须先增加显式认证，并将「未认证」与「无权限」作为两种不同的拒绝原因；任何 schema 迁移必须幂等、保留旧行，并从旧时间戳回填缺失/为零/为空的日期列。

## 验证

交付前依次执行：类型检查、代码检查、单元测试、生产构建、桌面与移动端浏览器流程、隐私扫描、PDF 与 ZIP 完整性校验。所有命令结果按「通过 / 失败 / 跳过」如实报告；失败即停止交付并修复回归。

## 发布产物与命令

公开站提供两个可下载交付物（入口在「产品案例」页）：

- `public/downloads/考研智学系统-产品案例.pdf` — 约六页 A4、可选中文本、含页码与公开地址。
- `public/downloads/考研智学系统-交互演示包.zip` — 离线构建 + Node 启动器 + Windows 启动脚本 + 跨平台说明 + PDF + 截图 + SHA-256 完整性清单。

产物由发布脚本生成（脚本只消费本项目自己的构建产物与虚构内容，不扫描、不打包任何私有系统）：

```bash
npm run build               # 1. 生产构建（base 为 /kaoyan-study-showcase/）
npm run generate:case-study # 2. 截图 + PDF → public/screenshots、public/downloads（需先 build）
npm run package:demo        # 3. 离线 ZIP + SHA-256 清单 + release-manifest.json（需先 generate）
npm run build               # 4. 最终构建，把 public/ 下的下载物带入 dist
npm run audit:privacy       # 5. 隐私扫描（源码 / dist / PDF 文本 / ZIP 内容 / 截图 OCR 尽力而为）
npm run verify:artifacts    # 6. 校验 PDF 页数与文本、ZIP 完整性、清单哈希、解压后本地启动
```

脚本说明：

- `scripts/serve.mjs` — Node 核心模块静态服务器，同时用于离线包与本地产物生成。
- `scripts/generate-case-study.mjs` — 用 Playwright 对构建产物截图，并渲染 PDF 打印模板。
- `scripts/package-demo.mjs` — 以 `--base ./` + `VITE_OFFLINE_PACKAGE=1` 构建离线副本并打包。
- `scripts/privacy-audit.mjs` — denylist + 人工审核 allowlist 扫描，含私有系统标识符、联系方式、凭据、绝对路径与虚构成果措辞。
- `scripts/verify-artifacts.mjs` — 交付前最终校验，任一检查失败即非零退出。
- `scripts/release-helper.py` — PDF 检查/渲染（PyMuPDF）与 ZIP 创建/校验（标准库）辅助脚本；PyMuPDF 不可用时 PDF 相关命令明确失败，不静默降级。

产物可用性（`src/data/release-artifacts.json`，由脚本更新）会驱动「产品案例」页的下载按钮：产物未生成时按钮显示「暂未生成」并禁用；离线演示包内不包含自身的 ZIP 副本，因此离线包内的 ZIP 下载入口按设计禁用，PDF 下载始终可用。
