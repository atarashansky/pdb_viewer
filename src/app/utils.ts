import { Atom } from "./types";

export async function parsePDBFile(pdbContent: string): Promise<Atom[]> {
  const lines = pdbContent.split("\n").map((line) => line.trim());
  const atoms: Atom[] = [];

  for (const line of lines) {
    if (line.startsWith("ATOM")) {
      const parts = line
        .split(" ")
        .filter((item) => item !== "")
        .map((item) => item.trim());

      if (parts.length >= 12) {
        const atom: Atom = {
          serialNumber: parseInt(parts[1]),
          name: parts[2],
          resName: parts[3],
          chainID: parts[4],
          resSeq: parseInt(parts[5]),
          x: parseFloat(parts[6]),
          y: parseFloat(parts[7]),
          z: parseFloat(parts[8]),
          occupancy: parseFloat(parts[9]),
          tempFactor: parseFloat(parts[10]),
          element: parts[11],
        };
        atoms.push(atom);
      }
    }
  }

  return atoms;
}
