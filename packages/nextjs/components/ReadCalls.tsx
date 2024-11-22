import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
import { arbitrum, avalanche, base, bsc, fantom, mainnet, optimism, polygon } from "viem/chains";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export const ReadCalls = () => {
  const [chainData, setChainData] = useState<
    Array<{
      chain: string;
      nameId: string;
      responseTime: string;
      responseTimeMs: number;
      error?: string;
    }>
  >([]);
  const [timestamp, setTimestamp] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const isUpdating = useRef(false);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = `${now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })}`;
      setCurrentTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
        http: [`https://solana-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`],
      },
    },
  };

  const solanaClient = createPublicClient({
    chain: solanaChain,
    transport: http(solanaChain.rpcUrls.default.http[0]),
  });

  const fetchSolanaData = async (client: any) => {
    try {
      const response = await fetch(client.transport.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getHealth",
          params: [null, { commitment: "finalized" }],
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Error Response Text:", responseText);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data.result; // Adapt based on the response structure
    } catch (error) {
      // Safely handle error
      if (error instanceof Error) {
        console.error("Fetch Solana Data Error:", error.message);
      } else {
        console.error("Unknown Error:", error);
      }
    }
  };

  const clients = useMemo(
    () => ({
      Ethereum: createPublicClient({
        chain: mainnet,
        transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      }),
      Base: createPublicClient({
        chain: base,
        transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      }),
      Arbitrum: createPublicClient({
        chain: arbitrum,
        transport: http(`https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      }),
      Optimism: createPublicClient({
        chain: optimism,
        transport: http(`https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      }),
      Polygon: createPublicClient({
        chain: polygon,
        transport: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      }),
      BinanceSmartChain: createPublicClient({
        chain: bsc,
        transport: http(`https://bnb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      }),
      Avalanche: createPublicClient({
        chain: avalanche,
        transport: http(`https://avax-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      }),
      Fantom: createPublicClient({
        chain: fantom,
        transport: http(`https://fantom-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      }),
      Solana: solanaClient,
    }),
    [],
  );

  const makeReadCalls = useCallback(async () => {
    if (isUpdating.current) return; // Prevent concurrent updates
    isUpdating.current = true;

    try {
      const now = new Date();
      const newTimestamp = `${now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })}`;
      setTimestamp(newTimestamp);

      const results = await Promise.all(
        Object.entries(clients).map(async ([chainName, client]) => {
          const startTime = performance.now();
          try {
            let response;

            if (chainName === "Solana") {
              response = await fetchSolanaData(client); // Solana-specific call
            } else {
              const blockNumber = await client.getBlockNumber(); // Generic block number fetch
              response = { number: BigInt(blockNumber) };
            }

            const endTime = performance.now();
            const responseTimeMs = Math.round(endTime - startTime);

            return {
              chain: chainName,
              nameId: `${chainName} (${client.chain?.id || "Unknown ID"})`,
              responseTime: `${responseTimeMs}ms`,
              responseTimeMs,
              ...(chainName === "Solana" ? { blockHeight: response } : {}),
            };
          } catch (error) {
            const endTime = performance.now();
            const responseTimeMs = Math.round(endTime - startTime);

            let errorMessage = "An unknown error occurred";
            if (error instanceof Error) {
              errorMessage = error.message;
              console.error(`${chainName} error:`, errorMessage);
            } else {
              console.error(`${chainName} error:`, error);
            }

            return {
              chain: chainName,
              nameId: `${chainName} (${client.chain?.id || "Unknown ID"})`,
              responseTime: `${responseTimeMs}ms`,
              responseTimeMs,
              error: errorMessage,
            };
          }
        }),
      );

      // Only update if we have valid results
      if (results.length > 0) {
        const sortedResults = results.sort((a, b) => a.responseTimeMs - b.responseTimeMs);
        setChainData(prevData => {
          // Only update if the new times are reasonable
          const validResults = sortedResults.every(
            result => result.responseTimeMs > 0 && result.responseTimeMs < 10000,
          );
          return validResults ? sortedResults : prevData;
        });
      }
    } finally {
      isUpdating.current = false;
    }
  }, [clients]);

  useEffect(() => {
    makeReadCalls();
    const interval = setInterval(makeReadCalls, 10000);
    return () => clearInterval(interval);
  }, [makeReadCalls]);

  // Sort the chainData to find the fastest three
  const sortedChainData = [...chainData].sort((a, b) => a.responseTimeMs - b.responseTimeMs);
  const fastestChains = new Set(sortedChainData.slice(0, 3).map(chain => chain.chain));

  return (
    <div className="w-full max-w-7xl p-6">
      <div className="text-center mb-4">
        <div className="flex justify-center items-center gap-2">
          <h2 className="text-xl font-bold">Read Call Metrics</h2>
          <div className="relative group">
            <InformationCircleIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
              This displays response times for getBlockNumber() calls, refreshed every 10 seconds
            </div>
          </div>
        </div>
        <p className="text-sm font-mono">Timestamp: {currentTime}</p>
        <p className="text-sm font-mono">Last call: {timestamp}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full border-collapse">
          <thead>
            <tr className="bg-base-200 border-b border-gray-200">
              <th className="text-lg border-r border-gray-200">Chain / ID</th>
              <th className="text-lg">Response Time</th>
            </tr>
          </thead>
          <tbody>
            {chainData.map(chain => (
              <tr
                key={chain.chain}
                className={`hover:bg-base-100 border-b border-gray-200 ${chain.error ? "text-red-500" : ""}
                  ${fastestChains.has(chain.chain) ? "text-neonGreen font-bold" : ""}`} // Change text color to neon green for the fastest 3 chains
              >
                <td className="font-mono border-r border-gray-200">{chain.nameId}</td>
                <td className="font-mono">{chain.responseTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
