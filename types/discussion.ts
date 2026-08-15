export interface DiscussionAuthor {
  uid: string;
  name: string;
  avatarUrl?: string;
}

export interface Discussion {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: DiscussionAuthor;
  college?: { name: string; slug: string };
  answerCount: number;
  views: number;
  votes: number;
  helpful: number;
  createdAt: string;
  isPinned: boolean;
}

export interface CreateDiscussionInput {
  title: string;
  description: string;
  tags: string[];
  author: DiscussionAuthor;
}
