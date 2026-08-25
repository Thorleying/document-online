<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 项目工程约定

本文件仅记录本项目特有事实，继承用户全局 `AGENTS.md`、开发规范和架构规范。上方 `nextjs-agent-rules` 托管块由 `next dev` 自动写入，不要删除。

## 项目概览

- 项目用途：在线文档阅读与分享。管理员在后台以 Markdown 撰写文档，通过永久链接或受控分享链接对外发布，并统计浏览量。
- 主要技术栈：Next.js 16（App Router + Turbopack）、React 19、TypeScript 5、Tailwind CSS 4、Prisma + MySQL 8、Redis、jose、bcryptjs、zod。
- 包管理器/构建系统：npm（`package-lock.json` 为准），Turbopack 为默认构建器。
- 主要入口：`src/app`（路由）、`src/server`（服务端领域与基础设施）、`prisma/schema.prisma`（数据模型）。

## Next.js 16 版本事实

写任何 Next.js 代码前先读 `node_modules/next/dist/docs/`。已确认与训练数据不同的点：

- `middleware.ts` 已更名为 `proxy.ts`，导出函数名为 `proxy`，运行时固定为 Node.js。
- `cookies()`、`headers()`、`draftMode()`、`params`、`searchParams` 只能异步访问，同步访问已移除。
- `next lint` 已移除，用 ESLint CLI；`next build` 不再自动跑 lint。
- ESLint 使用扁平配置（`eslint.config.mjs`）。
- 页面与路由的 props 类型用 `next typegen` 生成的 `PageProps<'/路由'>`、`LayoutProps`、`RouteContext` helper。
- `revalidateTag` 必须传第二个 `cacheLife` 参数。

## 目录路由

- `src/app/(reader)/`：公开阅读端，无需登录。`d/[slug]` 为永久链接，`s/[token]` 为分享链接。
- `src/app/(admin)/admin/`：后台管理端，全部需要登录。
- `src/app/api/`：Route Handlers。对外埋点接口在 `api/view`。
- `src/server/`：服务端专属代码，每个入口文件带 `import 'server-only'`。禁止被客户端组件导入。
  - `src/server/auth/`：密码哈希、会话签发校验、DAL（`verifySession`）。
  - `src/server/documents/`：文档领域逻辑与访问控制判定。
  - `src/server/markdown/`：Markdown 渲染与 HTML 净化。
  - `src/server/db/`：Prisma client 单例。
- `src/components/`：共享 UI 组件，不含业务规则。
- `src/lib/`：纯函数工具、共享类型与常量，不做 I/O。
- `src/config/`：类型化配置，环境变量的唯一读取点。
- `prisma/`：schema 与迁移。
- `docs/specs/`、`docs/adr/`、`docs/devlog/`：规格、架构决策、详细开发日志。

## 环境前置条件

- 运行时：Node.js >= 20.9（当前开发机 24.19.0），TypeScript >= 5.1。
- 必需服务：MySQL 8（`utf8mb4` / `utf8mb4_0900_ai_ci`）、Redis 7。本地用 `docker compose up -d` 启动。
- 环境变量（仅列名称与用途，真实值放 `.env.local`，该文件不入库）：
  - `DATABASE_URL`：MySQL 连接串，Prisma 使用。
  - `SESSION_SECRET`：会话 JWT 签名密钥，至少 32 字节随机值，用 `openssl rand -base64 32` 生成。
  - `REDIS_URL`：Redis 连接串，用于浏览量计数与限流。
  - `APP_BASE_URL`：站点对外基地址，用于生成分享链接与 og 标签。
- `.env.example` 保存变量清单和格式说明，禁止写入真实密钥。

## 标准命令

- 安装：`npm install`
- 开发：`npm run dev`
- 格式化：`npm run format`；检查用 `npm run format:check`
- Lint：`npm run lint`
- 类型检查：`npm run typecheck`
- 单元测试：`npm test`；监听模式 `npm run test:watch`
- 构建：`npm run build`
- 数据库迁移（开发）：`npm run db:migrate`
- 数据库迁移（部署）：`npm run db:deploy`
- Prisma client 生成：`npm run db:generate`
- 基础设施：`docker compose up -d` / `docker compose down`
- 提交前必跑：`npm run format:check && npm run lint && npm run typecheck && npm test`

## 架构约束

- 模块与依赖方向：`app` → `server` → `db`。`server` 不得导入 `app`；`lib` 与 `config` 不得导入 `server`。禁止循环依赖。
- 分层职责：Server Component 与 Route Handler 只做请求解析和输出映射；用例编排、权限判定和业务不变量在 `src/server/<domain>/`；Prisma 访问只出现在 `src/server/`。
- 访问控制的唯一权威位置是 `src/server/documents/access.ts`。阅读端页面不得自行拼装可见性判断。
- 状态与角色定义：以 `prisma/schema.prisma` 的 enum 为唯一来源，TypeScript 侧从 `@prisma/client` 导入，禁止在业务代码写裸字符串。
- 配置、URL、超时、阈值和功能开关：唯一来源是 `src/config/`，经 zod 校验后导出类型化对象。业务代码禁止直接读 `process.env`。
- DTO、领域对象与持久化模型：Prisma 模型不得直接跨越到客户端组件；在 `src/server/<domain>/dto.ts` 中显式映射后再传出。
- 文件、类、函数体量阈值与注释豁免：遵循全局 `CODE_STYLE_STANDARDS.md`（单文件 800 行、函数 80 行）。ESLint 的 `max-lines` 与 `max-lines-per-function` 机械执行。React 组件与 `page.tsx`/`layout.tsx` 默认导出免写契约注释，其余导出函数必须有 TSDoc。
- 数据所有权：`documents` 与 `share_links` 由 `src/server/documents/` 拥有；`view_logs` 与 `doc_daily_stats` 由 `src/server/analytics/` 拥有，其他模块只能通过其公共接口读写。
- 公共接口：`src/app/api/view` 是对匿名访客开放的唯一写接口，变更需同步埋点脚本与限流策略。
- ADR/规格位置：`docs/adr/NNNN-<slug>.md`、`docs/specs/`。

## 安全约束

- Markdown 渲染必须经过 `src/server/markdown/` 的净化管线，`remark-rehype` 禁止开启 `allowDangerousHtml`，`rehype-sanitize` 在 `rehype-stringify` 之前执行。客户端不得直接渲染未净化的 HTML。
- 分享链接 token 使用 `nanoid(22)` 生成，禁止使用自增 ID 或可枚举值。
- 会话 cookie 必须 `httpOnly`、`sameSite: 'lax'`、`path: '/'`，生产环境 `secure: true`。
- 每个受保护操作在服务端独立做授权判定；`proxy.ts` 只做基于 cookie 的乐观重定向，不能作为唯一防线。
- 密码只存 bcrypt 哈希，日志和 `DEVLOG.md` 不得出现密码、token、连接串。

## 修改约束

- 生成文件：`src/generated/prisma/`（Prisma client）、`.next/`、`next-env.d.ts`、`.next/types/`。不要手工编辑。
- 谨慎修改区域：`prisma/migrations/` 已提交的迁移文件不可改写，只能新增迁移。
- 兼容性与迁移要求：Schema 变更按 expand-migrate-contract 分阶段执行，破坏性变更必须写迁移顺序与回滚方案。

## 语气与角色模式

- 本项目文档与提交信息使用中性工程语气，不使用角色化表达。
- 代码注释、提交信息、ADR 与 Spec 一律不使用角色语气。

## Commit 规范

- 格式：Conventional Commits，`type(scope): subject`。
- 默认 type：`feat`、`fix`、`refactor`、`perf`、`test`、`docs`、`style`、`build`、`ci`、`chore`、`revert`。
- scope 命名：`auth`、`documents`、`share`、`analytics`、`reader`、`admin`、`db`、`infra`、`config`。
- 标题长度：不超过 72 字符。
- Body/Footer：涉及用户可见行为、公共接口、数据模型、配置、迁移、性能或安全影响时必须写 body，说明原因、取舍和验证证据。
- 提交前必跑：`npm run format:check && npm run lint && npm run typecheck && npm test`。
- 禁止提交：`.env.local`、真实密钥、`node_modules/`、`.next/`、本地数据库卷、构建产物、调试代码。

## 项目完成标准

- 必需检查：format:check、lint、typecheck、test、build 全部通过。
- CI required checks：尚未配置 CI，暂以本地必需检查为准。
- 代码体量与注释门禁：ESLint `max-lines`（800）与 `max-lines-per-function`（80）；超阈值必须在 `DEVLOG.md` 登记例外。
- 风险等级专项门禁：涉及认证、访问控制、Schema 迁移的改动按 L3 处理，需补安全审查结论与迁移回滚方案。
- 人工或浏览器验证：阅读端和管理端的用户可见改动必须在 375px、768px、1440px 视口实际渲染验证，仅编译通过不算完成。
- 发布前要求：域名与 HTTPS 就绪、ICP 备案完成、数据库备份任务可用。

## 已知基线问题

- 尚未配置 CI 流水线，所有门禁目前只能本地执行。
- 尚未接入 Redis，浏览量计数与限流为第四期内容。
- 尚未申请域名与证书，分享链接暂时只能在本地 `localhost` 验证；微信内打开需 HTTPS。
