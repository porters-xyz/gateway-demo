import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@frontend/utils/consts";

const useRecoverTenant = (key: string, submit: boolean) => {
  const fetchTenant = async () => {
    const response = await fetch(`${apiUrl}tenant?key=${key}`);
    if (!response.ok) {
      throw new Error("Failed to validate tenant");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["tenant"],
    queryFn: fetchTenant,
    enabled: submit,
  });
};

export default useRecoverTenant;
