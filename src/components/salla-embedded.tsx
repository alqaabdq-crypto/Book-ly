"use client";

import { useEffect, useState } from "react";

/**
 * The live half of the Salla app page. The Salla dashboard shows a loading
 * overlay over our iframe until the app calls `embedded.ready()` from
 * @salla.sa/embedded-sdk, so this component:
 *
 *   1. initialises the SDK (the postMessage bridge to the dashboard),
 *   2. reads the short-lived `?token=` and has our server introspect it,
 *   3. renders the result, then
 *   4. calls `ready()` (also on failure, so a problem shows as a message
 *      instead of an endless spinner).
 *
 * Outside Salla (opened directly) there is no host to answer `init()`, so it is
 * raced against a timeout and the page still renders its "open from Salla" note.
 */

export type SallaEmbeddedCopy = {
  openFromSalla: string;
  waiting: string;
  checking: string;
  step1: string;
  step2: string;
  step3: string;
  link: string;
  manage: string;
  linkedTo: string; // contains {salon}
};

type Session =
  | { kind: "checking" }
  | { kind: "outside" }
  | { kind: "waiting" }
  | { kind: "installed"; ticket: string; linked: { ar: string; en: string } | null };

export function SallaEmbedded({ locale, copy }: { locale: string; copy: SallaEmbeddedCopy }) {
  const [session, setSession] = useState<Session>({ kind: "checking" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { embedded } = await import("@salla.sa/embedded-sdk");

      await Promise.race([
        embedded.init().catch(() => undefined),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);

      const token = embedded.auth.getToken() ?? new URLSearchParams(window.location.search).get("token");
      let next: Session = { kind: "outside" };

      if (token) {
        const res = await fetch("/api/salla/embedded-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }).catch(() => null);

        if (res?.status === 401) {
          // Expired or reused token: the dashboard reloads us with a fresh one.
          embedded.auth.refresh();
          return;
        }

        const data = (await res?.json().catch(() => null)) as
          | { state?: string; ticket?: string; linked?: { ar: string; en: string } | null }
          | null;

        if (data?.state === "installed" && data.ticket) {
          next = { kind: "installed", ticket: data.ticket, linked: data.linked ?? null };
        } else if (data?.state === "waiting") {
          next = { kind: "waiting" };
        }
      }

      if (!cancelled) setSession(next);
      embedded.ready();
    })().catch(() => {
      if (!cancelled) setSession({ kind: "outside" });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (session.kind === "checking") {
    return <p className="mt-6 text-sm text-gray-500">{copy.checking}</p>;
  }

  if (session.kind === "outside") {
    return (
      <p role="alert" className="mt-6 rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
        {copy.openFromSalla}
      </p>
    );
  }

  if (session.kind === "waiting") {
    return (
      <p role="status" className="mt-6 rounded-lg border border-gray-300 px-4 py-3 text-sm dark:border-gray-700">
        {copy.waiting}
      </p>
    );
  }

  const linkedName = session.linked ? (locale === "ar" ? session.linked.ar : session.linked.en) : null;

  return (
    <div className="mt-6 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
      {linkedName ? (
        <p className="text-sm">{copy.linkedTo.replace("{salon}", linkedName)}</p>
      ) : (
        <ol className="list-decimal space-y-1 ps-5 text-sm text-gray-700 dark:text-gray-200">
          <li>{copy.step1}</li>
          <li>{copy.step2}</li>
          <li>{copy.step3}</li>
        </ol>
      )}
      <a
        href={`/api/salla/link?ticket=${encodeURIComponent(session.ticket)}&locale=${locale}`}
        target="_blank"
        rel="noopener"
        className="mt-5 inline-block rounded-full bg-foreground px-5 py-2.5 font-medium text-background"
      >
        {linkedName ? copy.manage : copy.link}
      </a>
    </div>
  );
}
