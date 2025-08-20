import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client for React Query
const queryClient = new QueryClient();


const amoyChain = {
  chainId: 80002,
  rpc: ["https://rpc-amoy.polygon.technology/"],
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  shortName: "amoy",
  slug: "amoy",
  testnet: true,
  chain: "Polygon",
  name: "Polygon Amoy Testnet",
};

const container = document.getElementById("root");

// We add a check to ensure the container element exists before rendering.
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        {/* The ThirdwebProvider wraps the entire App component. */}
        {/* This is the crucial step to fix the error, ensuring all hooks */}
        {/* like useConnectionManager have the necessary context. */}
        <ThirdwebProvider
          // We explicitly pass our custom chain definition here
          supportedChains={[amoyChain]}
          activeChain={amoyChain}
          clientId={import.meta.env.VITE_TEMPLATE_CLIENT_ID} // Read the Client ID from the .env file
        >
          <App />
        </ThirdwebProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
