import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
import { arbitrum, avalanche, base, bsc, fantom, mainnet, optimism, polygon } from "viem/chains";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const chainNicknames: Record<string, string> = {
  Ethereum: "ETH",
  Base: "BASE",
  Arbitrum: "ARB",
  Optimism: "OP",
  Polygon: "POL",
  BinanceSmartChain: "BSC",
  Avalanche: "AVAX",
  Fantom: "FTM",
  Solana: "SOL",
};

const WETH_ABI = [
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

const WETH_ADDRESSES = {
  Ethereum: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  Base: "0x4200000000000000000000000000000000000006",
  Arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  Optimism: "0x4200000000000000000000000000000000000006",
  Polygon: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  BinanceSmartChain: "0x7b03A103FC847348e5e59F8D3B0740c48D597973",
  Avalanche: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
  Fantom: "0xA59982c7A272839cBd93e02Bd8978E9a78189AB5",
};

const TEST_ADDRESS = "0x174b7A7Bdcd254c32F4b7f03543F382c47a3BaCA";
const SOLANA_TEST_ADDRESS = "4jMMA1KDamEbpkwTvWDcpb97pLB1meexoeUnntRpFRRd";

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
  const [chainHistory, setChainHistory] = useState<Record<string, { times: number[]; average: number }>>({});

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [
            SOLANA_TEST_ADDRESS,
            {
              mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", // WETH mint address
            },
            {
              encoding: "jsonParsed",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount) {
        const tokenAmount = data.result.value[0].account.data.parsed.info.tokenAmount;
        return tokenAmount.uiAmount;
      }

      return 0;
    } catch (error) {
      console.error("Fetch Solana Data Error:", error);
      throw error;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const makeReadCalls = useCallback(async () => {
    if (isUpdating.current) {
      console.log("Skipping - previous call still in progress");
      return;
    }
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
            // Add timeout to prevent hanging requests
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 5000),
            );

            if (chainName === "Solana") {
              response = await Promise.race([fetchSolanaData(client), timeoutPromise]);
            } else {
              response = await Promise.race([
                client.readContract({
                  address: WETH_ADDRESSES[chainName as keyof typeof WETH_ADDRESSES],
                  abi: WETH_ABI,
                  functionName: "balanceOf",
                  args: [TEST_ADDRESS],
                }),
                timeoutPromise,
              ]);
            }

            const endTime = performance.now();
            const responseTimeMs = Math.round(endTime - startTime);

            return {
              chain: chainName,
              nameId: `${chainName} (${client.chain?.id || "Unknown ID"})`,
              responseTime: `${responseTimeMs}ms`,
              responseTimeMs,
              balance: response,
            };
          } catch (error) {
            console.error(`${chainName} Balance Check Failed:`, error);
            return {
              chain: chainName,
              nameId: `${chainName} (${client.chain?.id || "Unknown ID"})`,
              responseTime: `Error`,
              responseTimeMs: 0,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }),
      );

      // Only update if we have valid results
      if (results.length > 0) {
        const sortedResults = results.sort((a, b) => a.responseTimeMs - b.responseTimeMs);
        setChainData(prevData => {
          const validResults = sortedResults.every(
            result => result.responseTimeMs > 0 && result.responseTimeMs < 10000,
          );
          if (validResults) {
            setChainHistory(prev => {
              const newHistory = { ...prev };
              sortedResults.forEach(result => {
                const chain = result.chain;
                // Skip failed requests
                if (result.responseTimeMs === 0) return;

                const times = [...(prev[chain]?.times || []), result.responseTimeMs].slice(-10);
                const average = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
                newHistory[chain] = { times, average };
              });
              return newHistory;
            });
            return sortedResults;
          }
          return prevData;
        });
      }
    } catch (error) {
      console.error("Global error in makeReadCalls:", error);
    } finally {
      isUpdating.current = false;
    }
  }, [clients]);

  useEffect(() => {
    makeReadCalls();
    const interval = setInterval(makeReadCalls, 6000);
    return () => clearInterval(interval);
  }, [makeReadCalls]);

  // Sort the chainData to find the fastest three
  const sortedChainData = [...chainData].sort((a, b) => a.responseTimeMs - b.responseTimeMs);
  const fastestChains = new Set(sortedChainData.slice(0, 3).map(chain => chain.chain));

  return (
    <div className="w-full max-w-7xl p-6 space-y-8">
      <div className="text-center mb-4">
        <div className="flex justify-center items-center gap-2">
          <h2 className="text-xl font-bold">Read Call Metrics</h2>
          <div className="relative group">
            <InformationCircleIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-base-300 border border-customOrange text-base-content text-sm rounded shadow-lg">
              Displays response times for{" "}
              <code className="bg-base-200 text-customOrange px-1 py-0.5 rounded font-mono">balanceOf()</code> calls,
              refreshed every 6 seconds
            </div>
          </div>
        </div>
        <p className="text-sm font-mono">Timestamp: {currentTime}</p>
        <p className="text-sm font-mono">Last call: {timestamp}</p>
      </div>
      <div className="w-full">
        <table className="table w-full border-collapse">
          <thead>
            <tr className="bg-base-200 border-b border-blue-200">
              <th className="text-lg border-r text-customOrange border-blue-200">Chain / ID</th>
              <th className="text-lg text-customOrange">Response Time</th>
            </tr>
          </thead>
          <tbody>
            {chainData.map(chain => (
              <tr
                key={chain.chain}
                className={`hover:bg-base-100 border-b border-blue-200 ${chain.error ? "text-red-500" : ""}
                    ${fastestChains.has(chain.chain) ? "text-neonGreen font-bold" : ""}`}
              >
                <td className="font-mono border-r border-blue-200">{chain.nameId}</td>
                <td className="font-mono">{chain.responseTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-full max-w-7xl">
        <div className="flex justify-center items-center gap-2 mb-2">
          <p className="text-sm text-base-600 text-center font-mono">Average Response Time (Last 10 calls)</p>
          <div className="relative group">
            <InformationCircleIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-base-300 border border-customOrange text-base-content text-sm rounded shadow-lg">
              Please wait for a few calls to complete to get accurate average response times
            </div>
          </div>
        </div>
        <div className="md:hidden">
          {" "}
          {/* Mobile view */}
          <table className="table w-full border-collapse mb-2">
            <thead>
              <tr className="bg-base-200 border border-blue-200">
                {[...chainData]
                  .sort((a, b) => (chainHistory[a.chain]?.average || 0) - (chainHistory[b.chain]?.average || 0))
                  .slice(0, 5)
                  .map(chain => (
                    <th key={chain.chain} className="text-sm text-customOrange border-r border-blue-200">
                      {chainNicknames[chain.chain] || chain.chain}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border border-blue-200">
                {[...chainData]
                  .sort((a, b) => (chainHistory[a.chain]?.average || 0) - (chainHistory[b.chain]?.average || 0))
                  .slice(0, 5)
                  .map(chain => (
                    <td key={chain.chain} className="font-mono text-center border-r border-blue-200">
                      {chainHistory[chain.chain]?.average ? `${chainHistory[chain.chain].average}ms` : "-"}
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
          <table className="table w-full border-collapse">
            <thead>
              <tr className="bg-base-200 border border-blue-200">
                {[...chainData]
                  .sort((a, b) => (chainHistory[a.chain]?.average || 0) - (chainHistory[b.chain]?.average || 0))
                  .slice(5)
                  .map(chain => (
                    <th key={chain.chain} className="text-sm text-customOrange border-r border-blue-200">
                      {chainNicknames[chain.chain] || chain.chain}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border border-blue-200">
                {[...chainData]
                  .sort((a, b) => (chainHistory[a.chain]?.average || 0) - (chainHistory[b.chain]?.average || 0))
                  .slice(5)
                  .map(chain => (
                    <td key={chain.chain} className="font-mono text-center border-r border-blue-200">
                      {chainHistory[chain.chain]?.average ? `${chainHistory[chain.chain].average}ms` : "-"}
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="hidden md:block">
          {" "}
          {/* Desktop view */}
          <table className="table w-full border-collapse">
            <thead>
              <tr className="bg-base-200 border border-blue-200">
                {[...chainData]
                  .sort((a, b) => (chainHistory[a.chain]?.average || 0) - (chainHistory[b.chain]?.average || 0))
                  .map(chain => (
                    <th key={chain.chain} className="text-sm text-customOrange border-r border-blue-200">
                      {chainNicknames[chain.chain] || chain.chain}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border border-blue-200">
                {[...chainData]
                  .sort((a, b) => (chainHistory[a.chain]?.average || 0) - (chainHistory[b.chain]?.average || 0))
                  .map(chain => (
                    <td key={chain.chain} className="font-mono text-center border-r border-blue-200">
                      {chainHistory[chain.chain]?.average ? `${chainHistory[chain.chain].average}ms` : "-"}
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
