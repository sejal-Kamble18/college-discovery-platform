"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createDiscussion, subscribeToDiscussions } from "@/lib/firestore/discussions";
import type { Discussion } from "@/types";

export default function DiscussionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => subscribeToDiscussions(
    (nextItems) => {
      setItems(nextItems);
      setError("");
      setLoading(false);
    },
    () => {
      setError("Community posts could not be loaded. Check Firestore rules and try again.");
      setLoading(false);
    },
  ), []);

  const allTags = useMemo(() => Array.from(new Set(items.flatMap((item) => item.tags))).sort(), [items]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) =>
      (!query || item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)) &&
      (!selectedTag || item.tags.includes(selectedTag)),
    );
  }, [items, search, selectedTag]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Student community</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">College Q&A</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">Ask practical questions and share experiences. Community posts are user-generated and should be independently verified.</p>
        </div>
        {user ? (
          <button type="button" onClick={() => setShowForm(true)} className="rounded-lg bg-brand-600 px-5 py-3 font-bold text-white hover:bg-brand-700">Ask a question</button>
        ) : (
          <Link href="/auth/login" className="rounded-lg bg-brand-600 px-5 py-3 text-center font-bold text-white hover:bg-brand-700">Sign in to ask</Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Topics</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setSelectedTag("")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!selectedTag ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}>All</button>
              {allTags.map((tag) => (
                <button key={tag} type="button" onClick={() => setSelectedTag(tag)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedTag === tag ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}>#{tag}</button>
              ))}
            </div>
          </div>
        </aside>

        <main aria-live="polite">
          {loading && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading community questions…</p>}
          {!loading && error && <p className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="text-xl font-bold text-slate-900">No questions found</h2><p className="mt-2 text-slate-600">Start the first discussion or adjust your search.</p></div>
          )}
          <div className="space-y-4">
            {filtered.map((discussion) => <DiscussionCard key={discussion.id} discussion={discussion} />)}
          </div>
        </main>
      </div>

      {showForm && user && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="ask-title">
          <form
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setSubmitting(true);
              try {
                await createDiscussion({
                  title,
                  description,
                  tags: tags.split(","),
                  author: { uid: user.uid, name: user.displayName || "Student", avatarUrl: user.photoURL || undefined },
                });
                setTitle("");
                setDescription("");
                setTags("");
                setShowForm(false);
              } catch {
                setError("Your question could not be posted. Check your connection and Firestore permissions.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="flex items-center justify-between gap-4"><h2 id="ask-title" className="text-2xl font-bold text-slate-900">Ask the community</h2><button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">✕</button></div>
            <div className="mt-6 space-y-5">
              <div><label htmlFor="question-title" className="text-sm font-bold text-slate-700">Question</label><input id="question-title" required minLength={10} maxLength={140} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label htmlFor="question-description" className="text-sm font-bold text-slate-700">Details</label><textarea id="question-description" required minLength={20} maxLength={1500} rows={6} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label htmlFor="question-tags" className="text-sm font-bold text-slate-700">Tags, separated by commas</label><input id="question-tags" maxLength={120} value={tags} onChange={(event) => setTags(event.target.value)} placeholder="placements, jee-main, hostel" className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-5 py-3 font-semibold text-slate-700">Cancel</button><button disabled={submitting} className="rounded-lg bg-brand-600 px-5 py-3 font-bold text-white disabled:opacity-50">{submitting ? "Posting…" : "Post question"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

function DiscussionCard({ discussion }: { discussion: Discussion }) {
  const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(discussion.createdAt));
  const initial = discussion.author?.name?.trim().charAt(0).toUpperCase() || "S";
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">{initial}</div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-900">{discussion.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{discussion.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">{discussion.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">#{tag}</span>)}</div>
          <p className="mt-4 text-xs text-slate-500">Asked by {discussion.author?.name || "Student"} on {date}</p>
        </div>
      </div>
    </article>
  );
}
