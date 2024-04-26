import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSession } from "./siwe";
import { useAccount, useBalance } from "wagmi";
import { usePathname, useRouter } from "next/navigation";
import { Address } from "viem";
import { portrOPAddress } from "./consts";
import { IToken } from "./types";
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
    amount,
}: {
    sellToken: string;
    chainId: number | string;
    amount: string;
}) => {
    const fetchQuote = async () => {
        console.log({ sellToken, chainId, amount });
        const response = await fetch(
            `https://api.0x.org/swap/v1/price?sellToken=${sellToken}&buyToken=${portrOPAddress}&sellAmount=${Number(amount)}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "0x-api-key": process.env.NEXT_PUBLIC_0XAPI,
                },
            },
        );
        if (!response.ok) {
            throw new Error("Failed to fetch quote");
        }
        return response.json();
    };
    return useQuery({
        queryKey: ["quote", sellToken],
        queryFn: fetchQuote,
    });
};

export const useTokenBalance = ({
    token,
    chainId,
}: {
    token: Address;
    chainId: number;
}) => {
    return useBalance({
        chainId,
        token,
        address: `0xd8da6bf26964af9d7eed9e03e53415d37aa96045`, // TODO: replace with user address
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
        return response.json();
    };

    return useQuery({
        queryKey: ["tokens", chainId],
        queryFn: fetchTokenList,
    });
};
