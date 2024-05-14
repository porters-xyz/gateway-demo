import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { getSession } from "./siwe";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { usePathname, useRouter, useParams } from "next/navigation";
import { Address, erc20Abi } from "viem";
import { supportedChains } from "./consts";
import _ from "lodash";
import { IToken } from "./types";
import { timeOptions } from "./consts";
import { useAtomValue } from "jotai";
import { sessionAtom } from "./atoms";

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
    data: {
        name: string;
        description?: string;
    },
) => {
    const { name, description } = data;
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

export const useUpdateAppMutation = (appId: string) => {
    const queryClient = useQueryClient();
    const path = usePathname();
    const router = useRouter();
    const updateAppMutation = async ({
        action,
        data,
    }: {
        action: "update" | "delete";
        data?: { name?: string; description?: string };
    }) => {
        const method = action === "update" ? "PATCH" : "DELETE";
        const requestBody =
            action === "update" ? JSON.stringify({ ...data }) : null;

        const response = await fetch(`/api/apps/${appId}`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        if (!response.ok) {
            throw new Error(`Failed to ${action} app`);
        }

        return response.json();
    };

    return useMutation({
        mutationFn: updateAppMutation,
        onSuccess: () => {
            router.replace(path);
            queryClient.invalidateQueries(); // TODO <--- revisit this
            console.log(`Updated App`);
        },
    });
};

export const useUpdateRuleMutation = (appId: string, ruleName: string) => {
    const queryClient = useQueryClient();
    const router = useRouter();
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
            queryClient.invalidateQueries({ queryKey: ["user"] });
            router.replace("/apps/" + appId + "?i=rules");
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
    const { address: userAddress } = useAccount();
    const router = useRouter();
    const createSecretKeyMutation = async (action: string) => {
        const response = await fetch(`/api/apps/${appId}/secret`, {
            method: action == "generate" ? "PUT" : "DELETE",
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
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["user", userAddress, "apps"],
            });

            const { key } = data;
            if (key) {
                router.replace(
                    "/apps/" + appId + "?i=rules&rule=secret-key&key=" + key,
                );
            }
            console.log("Secret Key Updated");
        },
    });
};

export const useQuote = ({
    sellToken,
    chainId,
    sellAmount,
}: {
    sellToken: string;
    chainId: number | string;
    sellAmount: number;
}) => {
    const fetchQuote = async () => {
        const chainName = _.get(
            _.find(supportedChains, { id: String(chainId) }),
            "name",
        );

        const response = await fetch(
            `/api/utils/quote/${chainName}/${sellToken}/${sellAmount}`,
        );
        if (!response.ok) {
            throw new Error("Failed to fetch quote");
        }
        return response.json();
    };
    return useQuery({
        queryKey: ["0xQuote", sellToken],
        queryFn: fetchQuote,
        enabled: sellAmount > 0 && Boolean(sellToken) && Boolean(chainId),
        refetchInterval: 10000,
    });
};

export const usePrice = ({
    sellToken,
    chainId,
    sellAmount,
}: {
    sellToken: string;
    chainId: number | string;
    sellAmount: number;
}) => {
    const fetchQuote = async () => {
        const chainName = _.get(
            _.find(supportedChains, { id: String(chainId) }),
            "name",
        );

        const response = await fetch(
            `/api/utils/price/${chainName}/${sellToken}/${sellAmount}`,
        );
        if (!response.ok) {
            throw new Error("Failed to fetch quote");
        }
        return response.json();
    };
    return useQuery({
        queryKey: ["0xPrice", sellToken],
        queryFn: fetchQuote,
        enabled: sellAmount > 0 && Boolean(sellToken) && Boolean(chainId),
        refetchInterval: 10000,
    });
};

export const useTokenBalance = ({
    token,
    chainId,
}: {
    token?: Address;
    chainId: number;
}) => {
    const { address } = useAccount();
    return useBalance({
        chainId,
        token,
        address,
    });
};

export const useTokenPrice = ({
    token,
    chainId,
}: {
    token: Address;
    chainId: number;
}) => {
    const fetchTokenPrice = async () => {
        const response = await fetch(`/api/utils/price/${chainId}/${token}`);
        if (!response.ok) {
            throw new Error("Failed to fetch token price");
        }
        return response.json();
    };

    return useQuery({
        queryKey: ["price", token],
        queryFn: fetchTokenPrice,
    });
};

export const useTokenList = ({ chainId }: { chainId: number | string }) => {
    const fetchTokenList = async () => {
        const response = await fetch(`/api/utils/tokens/${chainId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch token list");
        }
        const res = await response.json();
        return _.toArray(res) as IToken[];
    };

    return useQuery({
        queryKey: ["tokens", chainId],
        queryFn: fetchTokenList,
    });
};

export const useCheckAllowance = ({
    sellTokenAddress,
    selectedChainId,
    exchangeProxy,
}: {
    selectedChainId: number;
    sellTokenAddress: Address;
    exchangeProxy: Address;
}) => {
    const { address } = useAccount();

    return useReadContract({
        chainId: selectedChainId,
        address: sellTokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address!, exchangeProxy!],
    });
};

export const useTenantUsage = () => {

    const session = useAtomValue(sessionAtom)
    const tenantId = _.get(session, 'tenantId')

    const fetchTenantUsage = async (period: string) => {
        const response = await fetch(`/api/usage/tenant/${tenantId}/${period}`);
        if (!response.ok) {
            throw new Error("Failed to fetch tenant usage");
        }
        return response.json()
    };

    const tenantUsageData = useQueries({
        queries: timeOptions.map(({ option }) => ({
            queryKey: ['usage', 'tenant', tenantId, option],
            queryFn: () => fetchTenantUsage(option),
            enabled: !!tenantId,
        })),
        combine: (results) => {
            return {
                data: results.map((result, index) => {
                    return {
                        period: [timeOptions[index].option],
                        data: result?.data?.data?.result[0]?.values ?? []
                    }
                }),
                pending: results.some((result) => result.isPending),
                isFetched: results.some((result) => result.isPending),
            }
        },
    });

    return tenantUsageData
};

export const useAppUsage = () => {
    const appId = _.get(useParams(), "app", '');

    const fetchAppUsage = async (period: string) => {
        const response = await fetch(`/api/usage/app/${appId}/${period}`);
        if (!response.ok) {
            throw new Error("Failed to fetch app usage");
        }
        return response.json();
    };


    const appUsage = useQueries({
        queries: timeOptions.map(({ option }) => ({
            queryKey: ['usage', 'app', appId, option],
            queryFn: () => fetchAppUsage(option),
            enabled: Boolean(appId),
        })),
        combine: (results) => {
            return {
                data: results.map((result, index) => {
                    return {
                        period: [timeOptions[index].option],
                        data: result?.data?.data?.result[0]?.values ?? []
                    }
                }),
                pending: results.some((result) => result.isPending),
                isFetched: results.some((result) => result.isPending),
            }
        },
    });

    return appUsage

};
