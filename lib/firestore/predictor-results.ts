import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db, firebaseConfigurationMessage } from "@/lib/firebase";
import type { PredictionRequest, PredictionResponse } from "@/types";

export interface SavedPredictionScenario {
  id: string;
  exam: string;
  category: string;
  value: number;
  state?: string;
  course?: string;
  quota?: string;
  year?: number;
  total: number;
  createdAt?: { toDate?: () => Date };
}

export async function savePredictionScenario(uid: string, request: PredictionRequest, response: PredictionResponse) {
  if (!db) throw new Error(firebaseConfigurationMessage);
  return addDoc(collection(db, "users", uid, "predictorResults"), {
    exam: request.exam,
    category: request.category,
    value: request.value,
    state: request.state || null,
    course: request.course || null,
    quota: request.quota || null,
    year: request.year || null,
    total: response.total,
    dataSource: response.dataSource,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToPredictionScenarios(
  uid: string,
  onData: (scenarios: SavedPredictionScenario[]) => void,
  onError: () => void,
): Unsubscribe {
  if (!db) {
    onError();
    return () => undefined;
  }
  const scenarios = query(
    collection(db, "users", uid, "predictorResults"),
    orderBy("createdAt", "desc"),
    limit(5),
  );
  return onSnapshot(scenarios, (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as SavedPredictionScenario));
  }, onError);
}

export async function deletePredictionScenario(uid: string, scenarioId: string) {
  if (!db) throw new Error(firebaseConfigurationMessage);
  return deleteDoc(doc(db, "users", uid, "predictorResults", scenarioId));
}
