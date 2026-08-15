import { readFile } from "fs/promises";
import path from "path";
import type { College } from "@/types";

export async function getLargeColleges(): Promise<College[]> {
  const filePath = path.join(
    process.cwd(),
    "scripts",
    "data",
    "colleges_10000_seed.json"
  );

  const file = await readFile(filePath, "utf-8");
  return JSON.parse(file) as College[];
}
