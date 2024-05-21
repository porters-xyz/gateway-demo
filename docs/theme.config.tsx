import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Open Gateway</span>,
  project: {
    link: "https://github.com/porters-xyz/gateway-demo/",
  },
  chat: {
    link: "https://discord.com",
  },
  docsRepositoryBase:
    "https://github.com/porters-xyz/gateway-demo/tree/master/docs",
  footer: {
    text: "Porters RPC Gateway Documentation",
  },
};

export default config;
