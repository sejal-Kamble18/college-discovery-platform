'use client';

import { useEffect } from 'react';
import { useRecentStore } from '@/lib/store/useRecentStore';
import type { College } from '@/types';

export function RecentViewTracker({ college }: { college: College }) {
  const addRecent = useRecentStore((state) => state.addRecent);

  useEffect(() => {
    addRecent(college);
  }, [college, addRecent]);

  return null;
}
