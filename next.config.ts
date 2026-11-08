import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The Salla app page is rendered inside the merchant's Salla dashboard
        // (an iframe), so Salla's own origins may frame it, and nobody else.
        source: "/:locale(en|ar)/salla/app",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://salla.sa https://*.salla.sa https://*.salla.partners",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
