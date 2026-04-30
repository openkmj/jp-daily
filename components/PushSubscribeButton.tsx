"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const padded = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

type State =
  | "checking"
  | "unsupported"
  | "denied"
  | "idle"
  | "busy"
  | "subscribed";

export function PushSubscribeButton() {
  const [state, setState] = useState<State>("checking");
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (!VAPID_PUBLIC) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          setEndpoint(sub.endpoint);
          setState("subscribed");
        } else {
          setState("idle");
        }
      })
      .catch(() => setState("idle"));
  }, []);

  const subscribe = async () => {
    setState("busy");
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "idle");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const key = urlBase64ToUint8Array(VAPID_PUBLIC);
      const buffer = new ArrayBuffer(key.byteLength);
      new Uint8Array(buffer).set(key);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: buffer,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) throw new Error("서버 등록 실패");
      setEndpoint(sub.endpoint);
      setState("subscribed");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState("idle");
    }
  };

  const unsubscribe = async () => {
    setState("busy");
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        if (endpoint) {
          await fetch("/api/push/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint }),
          });
        }
      }
      setEndpoint(null);
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState("subscribed");
    }
  };

  if (state === "checking") {
    return <p className="text-sm text-zinc-500">확인 중…</p>;
  }
  if (state === "unsupported") {
    return (
      <p className="text-sm text-zinc-500">
        이 브라우저에선 알림을 지원하지 않아요. iOS면 홈 화면에 추가한 PWA에서만 동작합니다.
      </p>
    );
  }
  if (state === "denied") {
    return (
      <p className="text-sm text-zinc-500">
        알림이 차단되어 있어요. 시스템/브라우저 설정에서 허용해주세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {state === "subscribed" ? (
        <button
          type="button"
          onClick={unsubscribe}
          disabled={state !== "subscribed"}
          className="w-full cursor-pointer rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          알림 끄기
        </button>
      ) : (
        <button
          type="button"
          onClick={subscribe}
          disabled={state === "busy"}
          className="w-full cursor-pointer rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {state === "busy" ? "처리 중…" : "알림 켜기"}
        </button>
      )}
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <p className="text-xs text-zinc-500">
        {state === "subscribed"
          ? "✓ 매일 오전 9:30 / 저녁 10:30에 알림이 와요."
          : "매일 오전 9:30 (학습) · 저녁 10:30 (복습) 알림."}
      </p>
    </div>
  );
}
