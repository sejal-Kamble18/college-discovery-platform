import fs from "fs";
import path from "path";
import type { College } from "@/types";

export async function getLargeColleges(): Promise<College[]> {
  const filePath = path.join(
    process.cwd(),
    "lib",
    "data",
    "colleges_10000_seed.json"
  );

  const file = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(file) as College[];
}