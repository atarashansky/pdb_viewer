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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const parsedData = await parsePDBFile(content);
          setAtoms(parsedData);
        } catch (error) {
          console.error("Error parsing PDB file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

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
        <label htmlFor="inputText">
          Enter protein sequence to view predicted protein structure:
        </label>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <textarea
            id="inputText"
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

      <div style={{ marginTop: "20px" }}>
        <label htmlFor="pdbFile">Or upload a PDB file: </label>
        <input
          type="file"
          id="pdbFile"
          accept=".pdb"
          onChange={(e) => {
            handleFileUpload(e);
            setProteinSequence("");
          }}
        />
      </div>

      {isLoading && <p>Generating protein structure...</p>}

      <ProteinViewer atoms={atoms} />
    </div>
  );
}
