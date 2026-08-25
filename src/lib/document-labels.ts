import {
  DocumentStatus,
  DocumentVisibility,
  UserRole,
} from "@/generated/prisma/enums";

/** DocumentStatus → 中文展示标签（全站唯一来源）。 */
export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: "草稿",
  [DocumentStatus.PUBLISHED]: "已发布",
  [DocumentStatus.ARCHIVED]: "已归档",
};

/** DocumentVisibility → 中文展示标签（全站唯一来源）。 */
export const DOCUMENT_VISIBILITY_LABELS: Record<DocumentVisibility, string> = {
  [DocumentVisibility.PRIVATE]: "私有",
  [DocumentVisibility.PUBLIC]: "公开",
};

/** UserRole → 中文展示标签（全站唯一来源）。 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "管理员",
  [UserRole.EDITOR]: "编辑",
  [UserRole.VIEWER]: "访客",
};
