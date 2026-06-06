import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { College } from '@/types';

interface RecentState {
  recentColleges: College[];
  addRecent: (college: College) => void;
  clearRecent: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      recentColleges: [],
      
      addRecent: (college) => {
        const { recentColleges } = get();
        // Remove if it already exists to put it at the front
        const filtered = recentColleges.filter((c) => c.id !== college.id);
        
        // Add to front and limit to 5
        set({ 
          recentColleges: [college, ...filtered].slice(0, 5) 
        });
      },
      
      clearRecent: () => {
        set({ recentColleges: [] });
      },
    }),
    {
      name: 'college-recent-storage',
    }
  )
);
