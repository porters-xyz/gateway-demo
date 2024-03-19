import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";

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

export const useCreateAppMutation = (userAddress: string) => {
  const createAppMutation = async () => {
    const response = await fetch(`/api/apps/${userAddress}`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to create app");
    }
    return response.json();
  };

  return useMutation({
    mutationFn: createAppMutation,
    onSuccess: () => {
      // refresh router to show secret key later
      console.log("New App Created");
    },
  });
};
