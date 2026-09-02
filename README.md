# 考研学习工作台 · 公开镜像站

一个完全隔离、隐私安全的交互式考研学习工作台公开演示，面向产品展示与招聘面试案例。页面内全部数据均为虚构合成内容，不包含任何真实学校、专业、分数、学习历史、路径或凭据；运行时无后端、无数据库、无账号体系、无 AI 调用、无第三方网络请求。

- 公开地址：https://shane-jay-tech.github.io/kaoyan-study-showcase/
- 交付物：交互网页 · PDF 产品案例 · ZIP 离线演示包
- 上游关系：视觉与流程忠实镜像本地私有系统 `kaoyan-system`，但数据、状态与运行边界完全隔离

## 技术架构

- React 19 + TypeScript + Vite
- Vitest 单元测试 + Playwright 浏览器回归
- Lucide 图标、纯 CSS / SVG 图表
- GitHub Pages 静态托管，hash 路由支持任意静态服务器深链直达
- 内存态演示：状态仅存于内存，刷新页面即回到初始合成场景，不写任何持久化存储

## 环境要求

- Node.js ≥ 20.19.0
- npm
- 产物生成脚本的可选依赖：Playwright Chromium、PyMuPDF（`release-helper.py`）

安装依赖：

```bash
npm install
```

## 本地开发与验证

```bash
npm run dev        # 本地开发服务器
npm run typecheck  # TypeScript 类型检查
npm run lint       # ESLint 代码检查
npm test           # Vitest 单元测试
npm run test:browser # Playwright 浏览器流程
npm run build      # 生产构建（base 为 /kaoyan-study-showcase/）
npm run preview    # 本地预览构建产物
```

## 功能视图

| 视图 | 内容 |
| --- | --- |
| 首页 | 下一步行动、今日任务、闭环健康、训练容量、活动趋势、轨道掌握与阶段策略，全部由内存状态实时计算 |
| 计划 | 跨日任务模板、容量约束、开始/完成/延后/跳过/拆分、证据复盘与周复盘 |
| 学习 | 专业主线、语言训练、公共基础三轨；43 个知识点、章节进度、微课核对与掌握验证练习 |
| 练习 | 单选/多选/简答/默写四种题型；本地确定性评分、采分点反馈、用时、逐题回顾与错题回写 |
| 复盘 | 知识卡与词汇卡 0-5 分级、确定性间隔、失败卡暂停/恢复、错题延迟复测、主观表达重写结项 |
| 数据与诊断 | 正确率、活动趋势、薄弱点、能力结构与分步诊断；诊断报告可回写计划 |
| 系统与目标 | 目标容量、只读健康、考试草稿和内容治理 |
| 产品案例 | 当前系统结构、公开边界、验证说明，以及 PDF / ZIP 下载入口 |

## 架构与隐私边界

- **唯一数据所有者**：`src/data/public-source-mirror.ts` —— 全部为泛化固定示例。
- **兼容导出**：`src/data/demo-fixtures.ts` 仅保留旧 compact 组件所需的 re-export，不维护第二份数据。
- **唯一可变状态所有者**：`src/lib/demo-state.ts` 的 reducer；派生指标一律由选择器计算，不重复存值。
- **hash 路由**：路由编码在 URL hash 中，任意静态托管（含 GitHub Pages）下深层视图可直达，无需服务器改写。
- **零运行时网络**：无 API 客户端、无分析脚本、无远程字体/图片、无 Service Worker、无认证流程。
- **未来边界**：若日后引入敏感数据路径，必须先增加显式认证，并将「未认证」与「无权限」作为两种不同的拒绝原因；任何 schema 迁移必须幂等、保留旧行，并从旧时间戳回填缺失/为零/为空的日期列。

## 发布产物与命令

公开站提供两个可下载交付物（入口在「产品案例」页）：

- `public/downloads/考研智学系统-产品案例.pdf` — 源码结构、状态关系、隐私边界、验证方式与界面截图，可选中文本。
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

交付纪律：所有命令结果按「通过 / 失败 / 跳过」如实报告；失败即停止交付并修复回归，不以任何措辞暗示未通过的检查已通过。

脚本说明：

- `scripts/serve.mjs` — Node 核心模块静态服务器，同时用于离线包与本地产物生成。
- `scripts/generate-case-study.mjs` — 用 Playwright 对构建产物截图，并渲染 PDF 打印模板。
- `scripts/package-demo.mjs` — 以 `--base ./` + `VITE_OFFLINE_PACKAGE=1` 构建离线副本并打包。
- `scripts/privacy-audit.mjs` — denylist + 人工审核 allowlist 扫描，含私有系统标识符、联系方式、凭据、绝对路径与虚构成果措辞。
- `scripts/verify-artifacts.mjs` — 交付前最终校验，任一检查失败即非零退出。
- `scripts/release-helper.py` — PDF 检查/渲染（PyMuPDF）与 ZIP 创建/校验（标准库）辅助脚本；PyMuPDF 不可用时 PDF 相关命令明确失败，不静默降级。

产物可用性（`src/data/release-artifacts.json`，由脚本更新）会驱动「产品案例」页的下载按钮：产物未生成时按钮显示「暂未生成」并禁用；离线演示包内不包含自身的 ZIP 副本，因此离线包内的 ZIP 下载入口按设计禁用，PDF 下载始终可用。

## 目录

```text
src/data/              合成公开数据与产物可用性
src/lib/               demo 状态与派生选择器
src/components/        视图组件
scripts/               发布、隐私审计与产物校验脚本
public/downloads/      案例 PDF 与离线 ZIP（脚本生成）
docs/                  设计、计划与 Aegis 工作记录
tests/                 Vitest / Playwright 测试
```
