"use client";

import { nanoid } from "nanoid";
import { useEffect, useRef } from "react";

const VISITOR_ID_STORAGE_KEY = "docshare_visitor_id";

type ViewTrackerProps =
  { slug: string; token?: never } | { token: string; slug?: never };

function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const created = nanoid();
    window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, created);
    return created;
  } catch {
    // localStorage 不可用（隐私模式等）时退化为一次性标识。
    return nanoid();
  }
}

/**
 * 阅读页匿名埋点：挂载时向 /api/view 上报一次浏览。
 * 失败静默忽略，不影响阅读体验。
 */
export function ViewTracker({ slug, token }: ViewTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    // 防 React 严格模式下 effect 双调导致重复上报。
    if (fired.current) {
      return;
    }
    fired.current = true;

    void fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        token,
        visitorId: getVisitorId(),
        referer: document.referrer || undefined,
      }),
      keepalive: true,
    }).catch(() => {
      // 埋点尽力而为，网络失败不提示用户。
    });
  }, [slug, token]);

  return null;
}
