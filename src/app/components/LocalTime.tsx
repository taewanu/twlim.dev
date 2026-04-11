"use client";

import { useSyncExternalStore } from "react";
import { Weather } from "./Weather";

function formatTime(date: Date): string {
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Bangkok",
    })
    .toLowerCase()
    .replace(" ", "");
}

function subscribe(callback: () => void) {
  const now = new Date();
  const msUntilNextMinute =
    (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  let interval: ReturnType<typeof setInterval> | undefined;
  const timeout = setTimeout(() => {
    callback();
    interval = setInterval(callback, 60_000);
  }, msUntilNextMinute);

  return () => {
    clearTimeout(timeout);
    if (interval) clearInterval(interval);
  };
}

function getSnapshot() {
  return formatTime(new Date());
}

function getServerSnapshot() {
  return null;
}

export function LocalTime() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!time) return null;

  return (
    <p className="text-sm text-muted tabular-nums">
      {time} in Bangkok, Thailand
      <Weather />
    </p>
  );
}
