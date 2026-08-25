"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteSession } from "@/server/auth/session";
import { verifyPassword } from "@/server/auth/password";
import { prisma } from "@/server/db/client";

const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export type LoginFormState =
  | {
      errors?: { username?: string[]; password?: string[]; form?: string[] };
    }
  | undefined;

/**
 * 管理员登录。失败时统一提示，不区分用户名不存在与密码错误。
 */
export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { username, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { username, status: "ACTIVE" },
    select: { id: true, passwordHash: true },
  });

  const valid =
    user !== null && (await verifyPassword(password, user.passwordHash));

  if (!valid) {
    return { errors: { form: ["用户名或密码错误"] } };
  }

  await createSession(user.id.toString());
  redirect("/admin/documents");
}

/** 登出并清除会话。 */
export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/admin/login");
}
