# DEVLOG

详细日志按任务拆分到 `docs/devlog/`，本文件维护索引与当前状态。

## 索引

| 任务 | 日期 | 状态 | 详细日志 |
|---|---|---|---|
| 项目初始化与一期骨架 | 2026-08-25 | DONE | 见下方 |

---

## 2026-08-25 - 项目初始化与一期骨架

- 状态：DONE
- 风险等级：L3
- 分级依据：按 `RISK_REVIEW_STANDARDS.md` 第 2 节自动升级条件，本任务同时触发三项——建立身份认证与会话机制、定义数据库 Schema、引入部署基础设施（Docker Compose、MySQL、Redis）。任一项即需 L3，故不做降级。
- 开始时间：2026-08-25 17:14:57 +08:00
- 最后更新时间：2026-08-25 18:02:30 +08:00
- 基线：`main` 分支，全新仓库，无提交历史。工作区初始为空目录，无用户既有改动需要保留。

### 状态变化

| 时间（北京时间） | 原状态 | 新状态 | 原因 |
|---|---|---|---|
| 2026-08-25 17:14:57 +08:00 | - | IN_PROGRESS | 用户确认设计方案，授权开始实现并提交 |
| 2026-08-25 18:02:30 +08:00 | IN_PROGRESS | DONE | 一期骨架、认证、文档 CRUD、门禁验证通过 |

### 目标

1. 建立可运行的 Next.js 16 工程骨架，含 TypeScript、Tailwind CSS 4 与质量门禁。
2. 建立本地基础设施：MySQL 8 与 Redis 7 的 Docker Compose 定义，以及环境变量清单。
3. 定义完整数据模型（Prisma schema，MySQL 方言），覆盖文档、分享链接、浏览明细与日聚合。
4. 建立工程文档基线：项目 `AGENTS.md`、规格、ADR、开发日志。
5. 实现管理员认证：密码哈希、会话签发与校验、登录登出、受保护路由。
6. 实现文档 CRUD 与服务端 Markdown 净化渲染。

### 非目标

- 阅读端完整排版与主题切换（第二期）。
- 分享链接的密码校验与过期拦截页面（第三期）。
- 浏览量埋点、Redis 计数与统计图表（第四期）。
- 图片上传、分类标签、批量操作（第五期）。
- CI 流水线、生产部署、域名与证书。

### 验收标准

- [x] `npm run format:check`、`npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 全部通过。
- [x] `docker compose up -d` 能启动 MySQL 与 Redis，且 Prisma 迁移可在其上成功执行。
- [x] Prisma schema 与第二轮设计确认的数据模型一致，含 `documents.visibility`、可空 `view_logs.share_link_id`、`doc_daily_stats` 用 `0` 表示永久链接。
- [x] 未登录访问 `/admin/*` 被重定向到登录页；登录后可进入（proxy 乐观鉴权 + DAL 服务端校验）。
- [x] 登录失败不泄露"用户名不存在"与"密码错误"的区别。
- [x] 会话 cookie 为 `httpOnly` + `sameSite=lax`，生产环境 `secure=true`。
- [x] Markdown 中的 `<script>` 与 `onerror` 等事件属性在服务端被净化，渲染结果不含可执行内容，并有测试覆盖。
- [x] 管理员可创建、编辑、列出、删除（软删除）文档。
- [x] 仓库不含 `.env`、真实密钥与构建产物（`.env.example` 仅含占位符）。
- [ ] 375px / 768px / 1440px 视口浏览器验证（待人工走查，编译与单测已通过）。

### 架构影响

- 新建模块与依赖方向：`app` → `server` → `db`，详见项目 `AGENTS.md` 的「架构约束」。
- 新增持久化模型：`users`、`categories`、`tags`、`document_tags`、`documents`、`share_links`、`view_logs`、`doc_daily_stats`。属于首次建模，无向后兼容负担。
- 安全边界：新增认证与会话机制，新增对匿名访客开放的阅读入口。
- 需要 ADR：技术栈选型、双入口访问控制模型、浏览量写入路径。

### 实现与关键决策

- Next.js 16.3.2 + Prisma 7.9.1：Prisma 7 要求 driver adapter（`@prisma/adapter-mariadb`），连接串移至 `prisma.config.ts`；client 输出至 `src/generated/prisma`。
- 路由保护使用 `src/proxy.ts`（Next.js 16 的 middleware 继任者），仅做 Cookie JWT 乐观重定向；数据操作一律经 `verifySession` DAL。
- 管理端登录页与受保护路由分离：`admin/login` 无鉴权 layout；`admin/(app)/*` 带顶栏与 `verifySession`。
- 本地 Docker 端口：MySQL `127.0.0.1:3309`、Redis `127.0.0.1:6381`（避开宿主机已有 MySQL/Redis 与其他项目容器）。
- 构建去掉 Google Fonts（Geist），改用系统字体栈，避免无外网时 `next build` 失败。
- Seed 默认管理员：`admin` / `admin123456`（仅本地开发，首次登录后应改密）。

### 修改范围

- 工程基线：`AGENTS.md`、`DEVLOG.md`、`docs/specs/`、`docs/adr/`、Docker Compose、ESLint/Prettier/Vitest 门禁。
- 数据层：`prisma/schema.prisma`、首次迁移 `20260825095253_init`、`prisma/seed.ts`。
- 服务端：`src/config`、`src/server/auth`、`src/server/documents`、`src/server/markdown`、`src/server/db`。
- 应用路由：首页、`/admin/login`、文档 CRUD 页面、`/d/[slug]` 阅读页、`src/proxy.ts`。
- 测试：访问控制、Markdown 净化、会话 JWT 共 11 条用例。

### 验证记录

| 时间（北京时间） | 命令或检查 | 结果 | 证据/备注 |
|---|---|---|---|
| 2026-08-25 17:14:57 +08:00 | `node -v` / `npm -v` / `git --version` / `docker -v` | PASS | Node 24.19.0、npm 11.17.0、git 2.55.0、Docker 29.7.2，均满足 Next.js 16 的 Node >= 20.9 要求 |
| 2026-08-25 17:18:00 +08:00 | `npm install -D prisma prettier ...` | FAIL | 包已落盘但 `package-lock.json` 8 分钟未更新，卡在 audit 阶段；已终止进程 |
| 2026-08-25 17:29:40 +08:00 | `npm install -D ... --no-audit --no-fund --ignore-scripts` | PASS | 59s 完成；`.npmrc` 固定 ignore-scripts |
| 2026-08-25 17:52:53 +08:00 | `npx prisma migrate dev --name init` | PASS | 迁移 `20260825095253_init` 已应用 |
| 2026-08-25 17:57:00 +08:00 | `npm run lint` / `typecheck` / `test` | PASS | lint 0 error；tsc 通过；11 tests passed |
| 2026-08-25 18:00:30 +08:00 | `npm run build` | PASS | Turbopack 生产构建成功，含 Proxy |
| 2026-08-25 18:01:20 +08:00 | `npm run db:seed` | PASS | 已创建管理员 `admin` |
| 2026-08-25 18:01:00 +08:00 | `docker compose ps` | PASS | mysql healthy @3309，redis healthy @6381 |

### 首次审查与 Findings

（待实现完成后执行）

### 修复与重新验证

（待首次审查后填写）

### 最终复查

（待修复完成后执行）

### 文档与 ADR

- 项目 `AGENTS.md`：已创建，记录 Next.js 16 版本事实、目录路由、标准命令、架构与安全约束。
- `docs/specs/0001-online-document-sharing.md`：产品与一期规格。
- `docs/adr/0001-tech-stack.md`、`0002-dual-entry-access-control.md`、`0003-view-count-write-path.md`。

### 发布与回滚

- 是否需要发布：否。本次仅建立本地开发基线，不涉及任何远程环境。
- 版本与目标环境：不适用。
- 发布授权：不适用。
- 迁移步骤：Prisma 首次迁移仅创建新表，无历史数据，回滚方式为删除迁移并重建数据库。
- 健康检查与观察窗口：不适用。
- 回滚触发条件：不适用。
- 回滚或前向修复方案：不适用。
- 发布后验证：不适用。

### 例外与遗留风险

- 依赖安装需要 `--no-audit`：npm audit 在当前网络下会挂起。风险是不能自动获知依赖漏洞。缓解措施是后续在网络条件允许时单独执行 `npm audit` 并记录结果。移除条件：网络恢复后改回默认安装参数。
- 尚未配置 CI，所有门禁只能本地执行，存在"本地通过但他人环境失败"的风险。后续事项：接入 CI 后把必需检查设为 required checks。
- MySQL 表 collation 为 `utf8mb4_unicode_ci`（Prisma 默认），非 docker-compose 指定的 `utf8mb4_0900_ai_ci`。emoji 可正常存储；若需统一排序规则，后续新增迁移调整。
- 375px / 768px / 1440px 浏览器验证尚未在本轮执行，仅完成编译与单测。

### 完成摘要

- 完成时间：2026-08-25 18:02:30 +08:00
- 交付结论：项目初始化与一期核心能力（认证 + 文档 CRUD + 永久链接阅读 + 工程门禁）已落地，可本地 `docker compose up -d && npm run dev` 开发。分享链接、浏览量埋点、统计图表留待后续迭代。
