import { GoogleAnalytics } from "@next/third-parties/google";
import type { ReactNode } from "react";
import { keys } from "./keys";

type AnalyticsProviderProps = {
  readonly children: ReactNode;
};

const { NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN } =
  keys();

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => (
  <>
    {children}
    {NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN && (
      <script
        data-cf-beacon={JSON.stringify({
          token: NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN,
        })}
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
      />
    )}
    {NEXT_PUBLIC_GA_MEASUREMENT_ID && (
      <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    )}
  </>
);
