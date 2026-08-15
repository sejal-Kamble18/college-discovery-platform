import admin from "firebase-admin";
import { readFile } from "fs/promises";
import path from "path";

const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
const dataPath = path.join(
  process.cwd(),
  "scripts",
  "data",
  "colleges_10000_seed.json"
);

async function main() {
  if (process.env.CONFIRM_COLLEGE_IMPORT !== "verified") {
    throw new Error("Import stopped. Verify the source data, then run with CONFIRM_COLLEGE_IMPORT=verified.");
  }

  const serviceAccount = JSON.parse(await readFile(serviceAccountPath, "utf-8"));
  const colleges = JSON.parse(await readFile(dataPath, "utf-8"));
  if (!Array.isArray(colleges)) throw new Error("College dataset must be a JSON array.");

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();
  console.log(`Importing ${colleges.length} colleges...`);

  let batch = db.batch();
  let count = 0;

  for (const college of colleges) {
    const id = college.id || college.slug;
    if (!id) continue;

    const ref = db.collection("colleges").doc(id);
    batch.set(ref, {
      ...college,
      importedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    count++;

    if (count % 400 === 0) {
      await batch.commit();
      console.log(`Imported ${count}`);
      batch = db.batch();
    }
  }

  await batch.commit();
  console.log(`Done. Imported ${count} colleges.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
