import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSession } from "./siwe";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { sessionAtom } from "./atoms";

export const useSession = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const path = usePathname();
  const { data, isLoading, isFetched, isError } = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    enabled: !!address && isConnected,
    refetchInterval: 1000 * 60 * 2,
    refetchOnMount: true,
  });

  if (data?.address && path === "/login") {
    router.push("/dashboard");
  }

  if (!data?.address && isError && !isLoading && isFetched) {
    router.push("/login");
  }

  return { data, isLoading, isFetched };
};

export const useRecoverTenant = (key: string, submit: boolean) => {
  const fetchTenant = async () => {
    const response = await fetch(`/api/tenant?key=${key}`);
    if (!response.ok) {
      return console.error("Failed to validate tenant");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["tenant"],
    queryFn: fetchTenant,
    enabled: submit,
  });
};
export const useUserApps = (userAddress: string) => {
  const fetchApps = async () => {
    const response = await fetch(`/api/apps/${userAddress}`);
    if (!response.ok) {
      throw new Error("Failed to validate tenant");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["user", userAddress, "apps"],
    queryFn: fetchApps,
    enabled: Boolean(userAddress),
  });
};

export const useCreateAppMutation = (
  address: string,
  values: {
    name: string;
    description?: string;
  },
) => {
  const { name, description } = values;
  const router = useRouter();
  const queryClient = useQueryClient();
  const createAppMutation = async () => {
    const response = await fetch(`/api/apps/${address}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      throw new Error("Failed to create app");
    }
    return response.json();
  };

  return useMutation({
    mutationFn: createAppMutation,
    onSuccess: () => {
      router.push("/dashboard");
      queryClient.invalidateQueries(); // TODO <--- revisit this
      console.log("New App Created");
    },
  });
};
