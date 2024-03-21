import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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
