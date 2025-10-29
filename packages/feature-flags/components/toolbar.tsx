"use client";

import Script from "next/script";
import { keys } from "../keys";

export const Toolbar = () => {
  const { NEXT_PUBLIC_FLAGS_TOOLBAR_SCRIPT_URL } = keys();

  if (!NEXT_PUBLIC_FLAGS_TOOLBAR_SCRIPT_URL) {
    return null;
  }

  return (
    <Script
      src={NEXT_PUBLIC_FLAGS_TOOLBAR_SCRIPT_URL}
      strategy="afterInteractive"
    />
  );
};
