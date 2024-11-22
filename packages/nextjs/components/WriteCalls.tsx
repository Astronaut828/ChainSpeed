import React, { useMemo, useState } from "react";
import { createPublicClient, http } from "viem";
import { arbitrum, avalanche, base, bsc, celo, fantom, mainnet, optimism, polygon } from "viem/chains";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

// Define a type for the available chains
type ChainName =
  | "Ethereum"
  | "Base"
  | "Arbitrum"
  | "Optimism"
  | "Polygon"
  | "BinanceSmartChain"
  | "Avalanche"
  | "Fantom"
  | "Celo"
  | "Solana";

const solanaChain = {
  id: 101,
  name: "Solana",
  nativeCurrency: {
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
  },
  rpcUrls: {
    default: {
      http: ["https://api.mainnet-beta.solana.com"],
    },
  },
};
const solanaClient = createPublicClient({
  chain: solanaChain,
  transport: http(),
});

export const WriteCalls = () => {
  const [selectedChain, setSelectedChain] = useState<ChainName | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string>(""); // Current status message
  const [transactionDetails, setTransactionDetails] = useState<{ duration: string; gasCost: string } | null>(null); // Transaction details

  // Move clients into useMemo
  const clients = useMemo(
    () => ({
      Ethereum: createPublicClient({
        chain: mainnet,
        transport: http(),
      }),
      Base: createPublicClient({
        chain: base,
        transport: http(),
      }),
      Arbitrum: createPublicClient({
        chain: arbitrum,
        transport: http(),
      }),
      Optimism: createPublicClient({
        chain: optimism,
        transport: http(),
      }),
      Polygon: createPublicClient({
        chain: polygon,
        transport: http(),
      }),
      BinanceSmartChain: createPublicClient({
        chain: bsc,
        transport: http(),
      }),
      Avalanche: createPublicClient({
        chain: avalanche,
        transport: http(),
      }),
      Fantom: createPublicClient({
        chain: fantom,
        transport: http(),
      }),
      Celo: createPublicClient({
        chain: celo,
        transport: http(),
      }),
      Solana: solanaClient,
    }),
    [], // Empty dependency array as these don't change
  );

  const handleChainChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChain(event.target.value as ChainName);
  };

  const triggerTransferCall = async () => {
    if (!selectedChain) return;

    const client = clients[selectedChain];
    console.log(client);

    // Placeholder for the transaction logic
    const startTime = Date.now(); // Record the start time
    try {
      // Simulate a transfer call with multiple statuses
      const statuses = [
        `Initiating transaction on ${selectedChain}...`,
        `Transaction sent`,
        `Waiting for confirmation...`,
        `Transaction confirmed!`,
      ];

      // Simulate a delay for each status
      for (const status of statuses) {
        setTransactionStatus(status);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate a delay of 1 second
      }

      // Calculate the duration
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2); // Duration in seconds

      // Simulate transaction success and details
      const gasCost = "0.002 ETH"; // Placeholder for gas cost

      // Set transaction details
      setTransactionDetails({ duration: `${duration} seconds`, gasCost });
      setTransactionStatus(`Transaction successful on ${selectedChain}.`);
    } catch (error: any) {
      setTransactionStatus(`Transfer failed: ${error.message}`);
    }
  };

  return (
    <div className="w-full max-w-7xl p-6">
      <div className="text-center mb-4">
        <div className="flex justify-center items-center gap-2">
          <h2 className="text-xl font-bold">Write Call Metrics</h2>
          <div className="relative group">
            <InformationCircleIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
              Select a chain to trigger a transfer call.
            </div>
          </div>
        </div>
        <div className="mt-4">
          <select
            value={selectedChain || ""}
            onChange={handleChainChange}
            className="border border-gray-300 rounded p-2"
          >
            <option value="" disabled>
              Select a chain
            </option>
            {Object.keys(clients).map(chain => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </select>
        </div>
        {selectedChain && (
          <button onClick={triggerTransferCall} className="mt-4 bg-customOrange text-white rounded p-2">
            Trigger Transfer Call
          </button>
        )}
        <div className="mt-2 text-sm pt-5 font-mono">{transactionStatus}</div>
        {transactionDetails && (
          <div className="mt-2 text-sm font-mono">
            <p>Transaction Duration: {transactionDetails.duration}</p>
            <p>Gas Cost: {transactionDetails.gasCost}</p>
          </div>
        )}
      </div>
    </div>
  );
};
