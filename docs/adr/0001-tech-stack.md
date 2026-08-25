# ADR-0001：采用 Next.js 全栈 + MySQL + Redis 作为技术栈

- 状态：Accepted
- 决策时间：2026-08-25 17:32:05 +08:00
- 负责人：项目所有者
- 关联 Spec/Ticket：`docs/specs/0001-online-document-sharing.md`
- 替代/被替代 ADR：无

## 背景

项目需要同时提供两种性质相反的界面：面向匿名读者的阅读页，要求首屏快、可被搜索引擎抓取、能整页缓存；以及面向管理员的后台，要求重交互、表格与图表密集。团队规模是一个人，运维预算接近零，部署目标是自有云服务器。

约束条件：
- 服务器已有 MySQL 运维经验，无 PostgreSQL 经验。
- 部署方式为 Docker Compose 单机，不使用 Serverless。
- 阅读页必须服务端渲染，否则分享到社交平台无法生成预览卡片，搜索引擎也抓不到内容。

## 决策

采用单一 Next.js 16 应用承载阅读端与管理端，配套 MySQL 8 与 Redis 7，全部以 Docker Compose 部署。

具体选型：

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16（App Router，Turbopack 默认） |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 4 |
| ORM | Prisma |
| 数据库 | MySQL 8（`utf8mb4_0900_ai_ci`） |
| 缓存 | Redis 7 |
| 会话 | jose 签发 JWT，存 httpOnly cookie |
| 密码 | bcryptjs |
| 校验 | zod |
| Markdown | unified + remark + rehype，含 `rehype-sanitize` |
| 部署 | Docker Compose + Caddy（自动申请证书） |

## 备选方案

1. **Spring Boot + Vue3 + MySQL**：后端 Spring Boot，管理端 Vue3，阅读端另起 Nuxt3 做 SSR。
2. **Nuxt3 全栈 + SQLite**：单文件数据库，运维成本最低。
3. **Next.js + PostgreSQL**：与本决策相同，仅数据库不同。

## 选择理由

选 Next.js 全栈而非方案 1：方案 1 需要三个部署单元（Java 后端、Vue 管理端、Nuxt 阅读端），类型契约要手工对齐，对一个人维护的项目是持续成本。Next.js 一个项目同时满足 SSR 阅读页与 SPA 式管理端，类型从数据库经 Prisma 一路贯通到前端。方案 1 的优势（团队熟悉、企业合规）在单人自有服务器的场景下不成立。

选 MySQL 而非 PostgreSQL：技术上 PostgreSQL 的窗口函数与 JSONB 更适合统计聚合，Prisma 对其支持也更成熟。但项目所有者只有 MySQL 运维经验，而本项目的聚合查询复杂度很低（按天分组求和），MySQL 8 的窗口函数完全够用。运维熟悉度在这里比理论最优更重要——出问题时能自己排查，比查询语句优雅要值钱。

保留 Redis 而非用应用内存计数：浏览量计数、接口限流、分享链接密码会话三处都需要跨请求的共享状态。应用内存方案在多实例部署时会丢计数、重启时会丢未落盘增量。Redis 在 Docker Compose 里只是十行配置，代价远小于它消除的问题。

选 bcryptjs 而非 argon2：argon2id 是 OWASP 的首选，但 Node 的 argon2 绑定需要原生编译，在 Windows 开发机与 Linux 容器之间容易出现二进制不匹配。bcryptjs 是纯 JavaScript 实现，跨平台行为一致，零原生依赖。代价是比原生实现慢，但登录是低频操作，而且较慢的哈希本身就是一种速率限制。

## 影响与风险

- 正面影响：单一代码库、单一部署单元、端到端类型安全；阅读页可用 SSR 与整页缓存；本地开发只需 `docker compose up -d` 加 `npm run dev`。
- 负面影响：绑定 Next.js 的版本演进节奏，其大版本破坏性变更较多（16 版已将 `middleware` 改名 `proxy`、请求 API 全面异步化）。缓解方式是项目 `AGENTS.md` 记录版本事实，并要求写代码前读 `node_modules/next/dist/docs/`。
- 安全影响：Next.js Server Actions 与 Route Handlers 等同于公开接口，必须逐个做授权校验，不能依赖界面隐藏。已写入项目 `AGENTS.md` 的安全约束。
- 性能影响：Node 单进程模型下，Markdown 解析属于 CPU 密集操作，因此渲染结果在保存时落库，请求路径上不解析。
- 成本与运维影响：单机 Docker Compose 三个容器（应用、MySQL、Redis），资源占用小。需要自行负责数据库备份。

## 迁移与回滚

首次选型，无迁移。若将来需要更换数据库，Prisma 的 schema 与迁移是 MySQL 方言绑定的，切换到 PostgreSQL 需要重写迁移并做一次数据搬迁；业务代码因经由 Prisma 访问，改动面较小。

## 验证方式

- `npm run build` 成功产出生产构建。
- `docker compose up -d` 后 Prisma 迁移在真实 MySQL 容器上执行成功。
- 阅读页在禁用 JavaScript 的浏览器中仍能显示完整正文，以此证明 SSR 生效。

## 后续事项

- 接入 CI 并把必需检查设为 required checks。
- 网络条件允许时执行一次 `npm audit` 并记录依赖漏洞结论。
- 上线前补充数据库定时备份任务与恢复演练。
