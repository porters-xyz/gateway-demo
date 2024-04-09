import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSession } from "./siwe";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";

export const useSession = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const path = usePathname();
  const { data, isLoading, isFetched } = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    enabled: !!address && isConnected,
    refetchInterval: 1000 * 60 * 2,
    refetchOnMount: true,
  });

  if (data?.address && path === "/login") {
    router.push("/dashboard");
  }

  if (!data?.address && !isLoading && isFetched) {
    router.push("/login");
  }

  return { data, isLoading, isFetched };
};

export const useEndpoints = () => {
  const { address } = useAccount();
  const fetchEndpoints = async () => {
    const response = await fetch(`/api/utils/endpoints`);
    if (!response.ok) {
      throw new Error("Failed to fetch endpoints");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["endpoints"],
    queryFn: fetchEndpoints,
    enabled: Boolean(address),
  });
};

export const useRuleTypes = () => {
  const { address } = useAccount();
  const fetchRuleTypes = async () => {
    const response = await fetch(`/api/utils/ruletypes`);
    if (!response.ok) {
      throw new Error("Failed to fetch ruletypes");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["ruletypes"],
    queryFn: fetchRuleTypes,
    enabled: Boolean(address),
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

export const useUpdateRuleMutation = (appId: string, ruleName: string) => {
  const queryClient = useQueryClient();

  const updateRuleMutation = async (data?: Array<string>) => {
    const response = await fetch(`/api/apps/${appId}/rules`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ ruleId: ruleName, data }]),
    });
    if (!response.ok) {
      throw new Error("Failed to update app rule");
    }
    return response.json();
  };

  return useMutation({
    mutationFn: updateRuleMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] }); // TODO <--- revisit this
      console.log(ruleName + " Updated");
    },
  });
};

export const useBillingHistory = (id: string) => {
  const fetchBillingHistory = async () => {
    const response = await fetch(`/api/tenant/${id}/billing`);
    if (!response.ok) {
      throw new Error("Failed to fetch billing history");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["billing", id],
    queryFn: fetchBillingHistory,
    enabled: Boolean(id),
  });
};

export const useSecretKeyMutation = (appId: string) => {
  const queryClient = useQueryClient();

  const createSecretKeyMutation = async (action: string) => {
    const response = await fetch(`/api/apps/${appId}/secret`, {
      method: action === "generate" ? "PUT" : "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to update secret key");
    }
    return response.json();
  };

  return useMutation({
    mutationFn: createSecretKeyMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      console.log("Secret Key Updated");
    },
  });
};
