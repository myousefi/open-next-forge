import type { NextConfig } from "next";
import { keys } from "../keys";

type WithToolbar = <T extends NextConfig>(config: T) => T;

export const withToolbar: WithToolbar = (config) => {
  const { NEXT_PUBLIC_FLAGS_TOOLBAR_SCRIPT_URL } = keys();

  if (!NEXT_PUBLIC_FLAGS_TOOLBAR_SCRIPT_URL) {
    return config;
  }

  return {
    ...config,
    env: {
      ...config.env,
      NEXT_PUBLIC_FLAGS_TOOLBAR_SCRIPT_URL,
    },
  };
};
