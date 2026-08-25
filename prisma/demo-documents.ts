/** 演示文档 Markdown 源文本，供 seed 使用。 */

export const DEMO_PRODUCT_ROADMAP = `# 2026 产品路线图

> 本文档面向内部产品、研发与运营团队，梳理 2026 年度核心方向与里程碑。

## 年度主题

**「可信分享，专注阅读」** —— 在信息过载的时代，让文档传播更可控、阅读更沉浸。

## Q1：基础能力完善

- 完成 Markdown 渲染与 HTML 净化管线
- 永久链接 \`/d/{slug}\` 与分享链接 \`/s/{token}\` 双通道
- 管理端文档 CRUD 与访问控制

### 关键指标

| 指标 | 目标 |
| --- | --- |
| 首屏加载 | < 1.2s (P75) |
| 渲染安全 | 零 XSS 事件 |
| 管理端任务完成率 | > 95% |

## Q2：增长与分发

1. 微信内 H5 阅读体验优化（HTTPS + 备案）
2. Open Graph 与摘要卡片
3. 浏览量 Redis 计数与 UV 去重

## Q3：协作与治理

- 多管理员与角色权限
- 文档版本历史与 diff
- 分类、标签与全文搜索

## Q4：商业化探索

> 预留企业私有化部署与 SSO 接入能力，具体方案待 Q3 评审。

---

如有疑问，请联系产品负责人或在周会文档中留言。
`;

export const DEMO_API_GUIDE = `# REST API 设计指南

面向后端与全栈工程师的接口约定，适用于 DocShare 及关联微服务。

## 基本原则

1. **资源导向**：URL 表示资源，HTTP 动词表示动作
2. **版本前缀**：\`/api/v1/\` 固定，破坏性变更升 major
3. **统一错误体**：\`{ "code": "...", "message": "..." }\`

## 认证

管理端接口使用 **HttpOnly Cookie** 会话；公开只读接口无需认证。

\`\`\`http
GET /api/v1/documents HTTP/1.1
Cookie: docshare_session=...
\`\`\`

## 分页

列表接口采用 cursor 分页，响应包含 \`nextCursor\`：

\`\`\`json
{
  "items": [],
  "nextCursor": "eyJpZCI6MTIzfQ"
}
\`\`\`

## 状态码

- \`200\` 成功
- \`201\` 创建成功
- \`400\` 参数错误
- \`401\` 未登录
- \`403\` 无权限
- \`404\` 资源不存在（含 private 文档对外隐藏）

## 变更流程

任何公共接口变更须：

1. 更新 OpenAPI 规格
2. 补充集成测试
3. 在 DEVLOG 记录兼容性说明
`;

export const DEMO_SECURITY_CHECKLIST = `# 上线前安全清单

发布到生产环境前，请逐项确认。

## 认证与会话

- [ ] \`SESSION_SECRET\` 为随机 32+ 字节，未提交到 Git
- [ ] 生产 Cookie 启用 \`secure: true\`
- [ ] 密码仅存 bcrypt 哈希

## 内容安全

- [ ] Markdown 经 \`rehype-sanitize\`，未开启 \`allowDangerousHtml\`
- [ ] 阅读页不拼接未净化 HTML

## 访问控制

- [ ] private 文档经 \`/d/{slug}\` 返回 404
- [ ] 分享 token 使用 \`nanoid(22)\`，不可枚举

## 基础设施

- [ ] MySQL \`utf8mb4\` 字符集
- [ ] 数据库定期备份
- [ ] Redis 限流策略已启用（第四期）

> **提醒**：proxy 层仅做乐观重定向，每个写操作须在服务端独立鉴权。
`;

export const DEMO_ONBOARDING = `# 客户 Onboarding 手册

**内部文档 · 仅通过分享链接访问**

## 第一周：账号与环境

1. 创建管理员账号并修改默认密码
2. 配置 \`.env.local\` 与 Docker 基础设施
3. 执行 \`npm run db:migrate\` 与 \`db:seed\`

## 第二周：首批文档

- 撰写 3 篇公开文档作为官网内容
- 为敏感材料创建 private 文档 + 分享链接
- 验证 375 / 768 / 1440 三档视口

## 常见问题

**Q：分享链接过期怎么办？**  
A：在管理端重新生成 token，旧链接立即失效。

**Q：浏览量不准？**  
A：第四期接入 Redis 后，允许最多一个回写周期的延迟。
`;

export const DEMO_RETRO_TEMPLATE = `# 周回顾模板（草稿）

## 本周完成

- 

## 阻塞与风险

- 

## 下周计划

- 

## 数据快照

| 文档数 | 浏览量 |
| --- | --- |
|  |  |
`;

export const DEMO_ARCHIVED_SPEC = `# 旧版规格 v1（已归档）

此文档已被 \`0001-online-document-sharing.md\` 取代，仅保留只读参考。

## 变更摘要

- 移除自增 ID 分享方案
- 访问控制收敛至 \`access.ts\`
- 浏览量改为 Redis + 异步回写
`;
