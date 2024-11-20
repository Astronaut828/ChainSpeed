"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
import { arbitrum, base, celo, fantom, mainnet, optimism, polygon, avalanche, bsc } from "viem/chains";
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
  const isUpdating = useRef(false);

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
    }),
    [], // Empty dependency array as these don't change
  );

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const makeReadCalls = useCallback(async () => {
    // Prevent multiple concurrent updates
    if (isUpdating.current) return;
    isUpdating.current = true;

    try {
      const newTimestamp = formatDate(new Date());
      setTimestamp(newTimestamp);

      const results = await Promise.all(
        Object.entries(clients).map(async ([chainName, client]) => {
          const startTime = performance.now();
          try {
            await client.getBlockNumber();
            const endTime = performance.now();
            const responseTimeMs = Math.round(endTime - startTime);

            return {
              chain: chainName,
              nameId: `${chainName} (${client.chain.id})`,
              responseTime: `${responseTimeMs}ms`,
              responseTimeMs,
            };
          } catch (error) {
            const endTime = performance.now();
            const responseTimeMs = Math.round(endTime - startTime);
            console.log(error);
            return {
              chain: chainName,
              nameId: `${chainName} (${client.chain.id})`,
              responseTime: `${responseTimeMs}ms`,
              responseTimeMs,
              error: "Failed to fetch",
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
    const interval = setInterval(makeReadCalls, 5000);
    return () => clearInterval(interval);
  }, [makeReadCalls]);

  // Sort the chainData to find the fastest three
  const sortedChainData = [...chainData].sort((a, b) => a.responseTimeMs - b.responseTimeMs);
  const fastestChains = new Set(sortedChainData.slice(0, 3).map(chain => chain.chain)); 

  return (
    <div className="w-full max-w-7xl p-6 border-x border-gray-200">
      <div className="text-center mb-4">
        <div className="flex justify-center items-center gap-2">
          <h2 className="text-xl font-bold">Read Call Metrics</h2>
          <div className="relative group">
            <InformationCircleIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
              This displays response times for getBlockNumber() calls, refreshed every 5 seconds
            </div>
          </div>
        </div>
        <p className="text-sm font-mono">Last call: {timestamp}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full border-collapse">
          <thead>
            <tr className="bg-base-200 border-b border-gray-200">
              <th className="text-lg border-r border-gray-200">Chain & ID</th>
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
