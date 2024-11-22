"use client";

// import Link from "next/link";
import type { NextPage } from "next";
// import { useAccount } from "wagmi";
// import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { Address } from "~~/components/scaffold-eth";
import { ReadCalls } from "~~/components/ReadCalls";
import { WriteCalls } from "~~/components/WriteCalls";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">⛓️ ChainSpeed ⛓️</span>
          </h1>
          {/* <div className="flex justify-center items-center pt-5 space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div> */}
        </div>
        <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:pr-4">
            <ReadCalls />
          </div>
          <div className="border-b md:border-b-0 border-gray-200 md:pl-4">
            <WriteCalls />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            {/* <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
