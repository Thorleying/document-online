import "server-only";

/**
 * doc_daily_stats.share_link_id 中表示「永久链接入口」的常量。
 *
 * 该表用 (documentId, shareLinkId, statDate) 作复合主键，MySQL 主键列不允许
 * NULL，因此永久链接入口用 0 表示（0 不对应任何真实的 share_links 行）。
 * 业务代码一律引用本常量，不得直接写字面量 0。见 prisma/schema.prisma 注释。
 */
export const PERMANENT_ENTRY_SHARE_LINK_ID = BigInt(0);
