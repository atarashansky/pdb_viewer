"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import ProteinViewer from "./components/ProteinViewer";
import { parsePDBFile } from "./utils";
import { Atom } from "./types";
import { useEsmFoldPdb } from "./esmFold";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

function App() {
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [proteinSequence, setProteinSequence] = useState<string>("");
  const { data: pdbContent, isLoading } = useEsmFoldPdb(proteinSequence);

  useEffect(() => {
    async function fetchPDBData() {
      if (isLoading || !pdbContent) return;
      try {
        const parsedData = await parsePDBFile(pdbContent);
        setAtoms(parsedData);
      } catch (error) {
        console.error("Error parsing PDB file:", error);
      }
    }

    fetchPDBData();
  }, [pdbContent, isLoading]);

  return (
    <div>
      <h1>PDB Viewer</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const inputText = formData.get("inputText") as string;
          setProteinSequence(inputText);
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <textarea
            name="inputText"
            placeholder="Enter protein sequence"
            required
            rows={5}
            cols={50}
            style={{
              resize: "vertical",
              minHeight: "100px",
              marginBottom: "10px",
            }}
          />
          <button type="submit">Submit</button>
        </div>
      </form>

      {isLoading && <p>Generating protein structure...</p>}

      <ProteinViewer atoms={atoms} />
    </div>
  );
}
