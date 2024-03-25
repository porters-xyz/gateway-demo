import { useQuery } from "@tanstack/react-query";
import { getSession } from "./siwe.actions";
import { useAccount } from "wagmi";

export const useSession = () => {
  const { address, isConnected } = useAccount();
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    enabled: !!address && isConnected,
  });
};
