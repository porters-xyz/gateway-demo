import { useQuery } from "@tanstack/react-query";

const useRecoverTenant = (key: string, submit: boolean) => {
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

export default useRecoverTenant;
