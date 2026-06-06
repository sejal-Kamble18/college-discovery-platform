import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
const dataPath = path.join(
  process.cwd(),
  "scripts",
  "data",
  "colleges_10000_seed.json"
);

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
const colleges = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function main() {
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