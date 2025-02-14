import { useCallback, useEffect, useMemo, useState } from "react";
import { createPublicClient, http } from "viem";
import { arbitrum, avalanche, base, bsc, fantom, mainnet, optimism, polygon } from "viem/chains";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

type GasData = {
  chain: string;
  nameId: string;
  gasPrice: string;
  gasPriceNumber: number;
  error?: string;
};

export const GasPrice = () => {
  const [gasData, setGasData] = useState<GasData[]>([]);
  const [timestamp, setTimestamp] = useState<string>("");

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
    }),
    [],
  );

  const fetchGasPrices = useCallback(async () => {
    try {
      const now = new Date();
      const newTimestamp = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTimestamp(newTimestamp);

      const results = await Promise.all(
        Object.entries(clients).map(async ([chainName, client]) => {
          try {
            const gasPrice = await client.getGasPrice();
            const gasPriceInGwei = Number(gasPrice) / 1e9;

            return {
              chain: chainName,
              nameId: `${chainName} (${client.chain?.id || "Unknown ID"})`,
              gasPrice: `${gasPriceInGwei.toFixed(4)} Gwei`,
              gasPriceNumber: gasPriceInGwei,
            };
          } catch (error) {
            console.error(`${chainName} gas price fetch failed:`, error);
            return {
              chain: chainName,
              nameId: `${chainName} (${client.chain?.id || "Unknown ID"})`,
              gasPrice: "Error",
              gasPriceNumber: Infinity,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }),
      );

      const sortedResults = results.sort((a, b) => a.gasPriceNumber - b.gasPriceNumber);
      setGasData(sortedResults);
    } catch (error) {
      console.error("Global error in fetchGasPrices:", error);
    }
  }, [clients]);

  useEffect(() => {
    fetchGasPrices();
    const interval = setInterval(fetchGasPrices, 6000); // Update every 6 seconds
    return () => clearInterval(interval);
  }, [fetchGasPrices]);

  const cheapestChains = new Set(gasData.slice(0, 3).map(data => data.chain));

  return (
    <div className="w-full max-w-7xl p-6">
      <div className="text-center mb-4">
        <div className="flex justify-center items-center gap-2">
          <h2 className="text-xl font-bold">Gas Prices</h2>
          <div className="relative group">
            <InformationCircleIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-base-300 border border-customOrange text-base-content text-sm rounded shadow-lg">
              Current gas prices across different networks, refreshed every 6 seconds
            </div>
          </div>
        </div>
        <p className="text-sm font-mono">Last updated: {timestamp}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full border-collapse">
          <thead>
            <tr className="bg-base-200 border-b border-blue-200">
              <th className="text-lg border-r text-customOrange border-blue-200">Chain / ID</th>
              <th className="text-lg text-customOrange">Gas Price</th>
            </tr>
          </thead>
          <tbody>
            {gasData.map(data => (
              <tr
                key={data.chain}
                className={`hover:bg-base-100 border-b border-blue-200 
                  ${data.error ? "text-red-500" : ""}
                  ${cheapestChains.has(data.chain) ? "text-neonGreen font-bold" : ""}`}
              >
                <td className="font-mono border-r border-blue-200">{data.nameId}</td>
                <td className="font-mono">{data.gasPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
