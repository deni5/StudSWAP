import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "StudSWAP",
  projectId: "demo-project-id",
  chains: [sepolia],
  ssr: true,
});

