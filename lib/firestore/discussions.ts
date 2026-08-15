import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, firebaseConfigurationMessage } from "@/lib/firebase";
import type { CreateDiscussionInput, Discussion } from "@/types";

export function subscribeToDiscussions(
  onChange: (items: Discussion[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) {
    onError(new Error(firebaseConfigurationMessage));
    return () => undefined;
  }
  const discussionsQuery = query(collection(db, "discussions"), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(
    discussionsQuery,
    (snapshot) => {
      onChange(snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          title: String(data.title || ""),
          description: String(data.description || ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          author: data.author,
          college: data.college,
          answerCount: Number(data.answerCount || 0),
          views: Number(data.views || 0),
          votes: Number(data.votes || 0),
          helpful: Number(data.helpful || 0),
          createdAt: data.createdAt?.toDate?.().toISOString?.() || new Date().toISOString(),
          isPinned: Boolean(data.isPinned),
        } as Discussion;
      }));
    },
    onError,
  );
}

export async function createDiscussion(input: CreateDiscussionInput) {
  if (!db) throw new Error(firebaseConfigurationMessage);
  const tags = Array.from(new Set(input.tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean))).slice(0, 5);
  await addDoc(collection(db, "discussions"), {
    title: input.title.trim(),
    description: input.description.trim(),
    tags,
    author: input.author,
    answerCount: 0,
    views: 0,
    votes: 0,
    helpful: 0,
    isPinned: false,
    createdAt: serverTimestamp(),
  });
}
