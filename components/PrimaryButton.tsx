"use client";

import type { ButtonHTMLAttributes } from "react";

export function PrimaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`mt-auto w-full cursor-pointer rounded-2xl bg-zinc-900 px-4 py-4 text-base font-medium text-white shadow-lg shadow-zinc-900/10 dark:bg-white dark:text-zinc-900 ${className}`}
    />
  );
}
