'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Discussion {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
  };
  college?: {
    name: string;
    slug: string;
  };
  tags: string[];
  answerCount: number;
  views: number;
  votes: number;
  helpful: number;
  createdAt: string;
  isPinned?: boolean;
}

const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: '1',
    title: 'What is the placement record for CSE at IIT Bombay?',
    description:
      'I want to know about the recent placement trends for Computer Science students at IIT Bombay, especially for top tech companies.',
    author: { name: 'Raj Kumar', avatar: 'https://i.pravatar.cc/150?img=1' },
    college: { name: 'IIT Bombay', slug: 'iit-bombay' },
    tags: ['placements', 'cse', 'placement-statistics'],
    answerCount: 8,
    views: 342,
    votes: 15,
    helpful: 12,
    createdAt: '2026-06-04T10:00:00.000Z',
    isPinned: true,
  },
  {
    id: '2',
    title: 'How is the hostel life at IIT Delhi?',
    description:
      'Can someone share their experience about hostel facilities, food, and general hostel culture at IIT Delhi?',
    author: { name: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?img=2' },
    college: { name: 'IIT Delhi', slug: 'iit-delhi' },
    tags: ['hostel', 'student-life', 'campus'],
    answerCount: 12,
    views: 521,
    votes: 28,
    helpful: 24,
    createdAt: '2026-06-05T10:00:00.000Z',
  },
  {
    id: '3',
    title: 'JEE Advanced cutoff predictions for 2025',
    description:
      'Based on past trends, what do you think the cutoff for top IITs will be in 2025 for different categories?',
    author: { name: 'Arjun Singh', avatar: 'https://i.pravatar.cc/150?img=3' },
    tags: ['jee-advanced', 'cutoffs', 'predictions'],
    answerCount: 24,
    views: 1240,
    votes: 56,
    helpful: 45,
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: '4',
    title: 'Difference between AIIMS Delhi and other medical colleges',
    description:
      'What makes AIIMS Delhi better or different from other government medical colleges? Course curriculum, faculty, placements?',
    author: { name: 'Neha Gupta', avatar: 'https://i.pravatar.cc/150?img=4' },
    college: { name: 'AIIMS Delhi', slug: 'aiims-delhi' },
    tags: ['medical', 'curriculum', 'comparison'],
    answerCount: 6,
    views: 289,
    votes: 18,
    helpful: 14,
    createdAt: '2026-06-03T10:00:00.000Z',
  },
  {
    id: '5',
    title: 'Best coaching for CAT exam in 2025',
    description:
      'Looking for recommendations on CAT coaching institutes. Any personal experiences to share?',
    author: { name: 'Vikram Patel', avatar: 'https://i.pravatar.cc/150?img=5' },
    tags: ['cat', 'coaching', 'exam-preparation'],
    answerCount: 15,
    views: 687,
    votes: 32,
    helpful: 28,
    createdAt: '2026-05-30T10:00:00.000Z',
  },
];

function formatDiscussionDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(dateString));
}

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>(MOCK_DISCUSSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>(
    'recent',
  );
  const [showAskModal, setShowAskModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  });

  const filteredDiscussions = discussions.filter((discussion) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      discussion.title.toLowerCase().includes(query) ||
      discussion.description.toLowerCase().includes(query);

    const matchesTag = !selectedTag || discussion.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.votes - a.votes;
      case 'trending':
        return b.views - a.views;
      case 'recent':
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  const displayDiscussions = [
    ...sortedDiscussions.filter((discussion) => discussion.isPinned),
    ...sortedDiscussions.filter((discussion) => !discussion.isPinned),
  ];

  const handleAskQuestion = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    const newDiscussion: Discussion = {
      id: String(discussions.length + 1),
      title: formData.title,
      description: formData.description,
      author: {
        name: 'You',
        avatar: 'https://i.pravatar.cc/150?img=99',
      },
      tags: formData.tags,
      answerCount: 0,
      views: 0,
      votes: 0,
      helpful: 0,
      createdAt: new Date().toISOString(),
    };

    setDiscussions([newDiscussion, ...discussions]);
    setFormData({ title: '', description: '', tags: [] });
    setShowAskModal(false);
  };

  const allTags = Array.from(
    new Set(discussions.flatMap((discussion) => discussion.tags)),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
      <div className="mb-8 md:mb-12 border-b border-slate-200 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Q&A Community
            </h1>
            <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
              Ask questions, share experiences, and learn from other students
              about colleges, exams, and career paths.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAskModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-colors whitespace-nowrap"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Ask a Question
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Sort By
            </h3>
            <div className="space-y-2">
              {(['recent', 'popular', 'trending'] as const).map((sort) => (
                <button
                  type="button"
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === sort
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Tags
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() =>
                    setSelectedTag(selectedTag === tag ? null : tag)
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {displayDiscussions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No discussions found
              </h3>
              <p className="text-slate-600 max-w-sm">
                {searchQuery || selectedTag
                  ? 'Try adjusting your search or filters.'
                  : 'Be the first to start a discussion!'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-6">
                Showing {displayDiscussions.length} of {discussions.length}{' '}
                discussions
              </p>

              <div className="space-y-4">
                {displayDiscussions.map((discussion) => (
                  <DiscussionCard key={discussion.id} discussion={discussion} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Ask a Question
              </h2>
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAskQuestion} className="p-6 space-y-5">
              <div>
                <label
                  htmlFor="discussion-title"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Question Title
                </label>
                <input
                  id="discussion-title"
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({ ...formData, title: event.target.value })
                  }
                  placeholder="What do you want to ask?"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  maxLength={100}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.title.length}/100
                </p>
              </div>

              <div>
                <label
                  htmlFor="discussion-description"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="discussion-description"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  placeholder="Provide more details about your question..."
                  rows={5}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  maxLength={1000}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.description.length}/1000
                </p>
              </div>

              <div>
                <label
                  htmlFor="discussion-tags"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Tags comma-separated
                </label>
                <input
                  id="discussion-tags"
                  type="text"
                  placeholder="e.g., placements, iit-bombay, cse"
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      tags: event.target.value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.title.trim() || !formData.description.trim()}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DiscussionCard({ discussion }: { discussion: Discussion }) {
  const displayDate = formatDiscussionDate(discussion.createdAt);

  return (
    <div
      className={`p-5 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
        discussion.isPinned
          ? 'bg-amber-50 border-amber-200'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-2 text-center flex-shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
            {discussion.answerCount}
          </div>
          <p className="text-xs text-slate-600 font-medium">answers</p>
          <div className="border-t border-slate-200 w-8 my-1" />
          <p className="text-sm font-semibold text-slate-700">
            {discussion.views}
          </p>
          <p className="text-xs text-slate-600">views</p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {discussion.isPinned && (
              <svg
                className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
              </svg>
            )}
            <h3 className="text-base font-semibold text-slate-900 leading-tight line-clamp-2">
              {discussion.title}
            </h3>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {discussion.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {discussion.college && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                {discussion.college.name}
              </span>
            )}

            {discussion.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
              >
                {tag}
              </span>
            ))}

            {discussion.tags.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                +{discussion.tags.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <Image
              src={discussion.author.avatar}
              alt={discussion.author.name}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-medium">{discussion.author.name}</span>
            <span>asked {displayDate}</span>
            <div className="flex items-center gap-1 ml-auto">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.23a2 2 0 01-1.789 1.106H7a2 2 0 01-2-2V9a6 6 0 0112-6z"
                />
              </svg>
              <span>{discussion.helpful}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}