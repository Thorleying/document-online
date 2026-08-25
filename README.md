# document-online

在线文档阅读与分享平台。管理员在后台以 Markdown 撰写文档，通过永久链接或受控分享链接对外发布。

## 前置条件

- Node.js >= 20.9
- Docker（本地 MySQL 8 + Redis 7）

## 首次启动

```bash
# 1. 依赖
npm install
npm run db:generate

# 2. 环境变量（复制后按需改端口/密钥）
cp .env.example .env
# Windows 务必确认 DATABASE_URL 使用 127.0.0.1，不要用 localhost

# 3. 基础设施
docker compose up -d

# 4. 数据库
npm run db:deploy
npm run db:seed

# 5. 确认数据库连通（dev 报 pool timeout 时先跑这步）
npm run db:ping

# 6. 开发
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。管理后台：[http://localhost:3000/admin/login](http://localhost:3000/admin/login)（seed 默认账号见 `prisma/seed.ts`）。

## 常见错误

### `pool timeout: failed to retrieve a connection from pool`

MySQL 未启动或 `DATABASE_URL` 不可达。按顺序检查：

1. `docker compose ps` — mysql 容器是否为 healthy
2. `.env` 中 `DATABASE_URL` 端口是否与 `MYSQL_PORT` 一致
3. **Windows**：连接串主机用 `127.0.0.1`，不要用 `localhost`
4. `npm run db:ping` — 通过后再 `npm run dev`

## 门禁命令

| 命令 | 说明 |
|------|------|
| `npm run verify` | format + lint + typecheck + test（**不**连库） |
| `npm run db:ping` | 探测 MySQL 连通性 |
| `npm run verify:full` | verify + db:ping + build（提交前推荐） |

`npm run dev` 会自动执行 `predev` → `db:ping`，数据库未就绪时会提前给出上述提示，而不是 Prisma pool timeout。

## 更多信息

工程约定见 [AGENTS.md](./AGENTS.md)。
