import { useQuery } from "react-query";

const ESM_FOLD_API_URL = "https://api.esmatlas.com/foldSequence/v1/pdb";

const fetchEsmFoldPdb = async (
  sequence: string,
  signal?: AbortSignal
): Promise<string> => {
  const response = await fetch(ESM_FOLD_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: sequence,
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch PDB data");
  }

  return response.text();
};

export const useEsmFoldPdb = (sequence: string) => {
  return useQuery(
    ["esmFoldPdb", sequence],
    ({ signal }) => fetchEsmFoldPdb(sequence, signal),
    {
      enabled: !!sequence,
    }
  );
};
