import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CollegeCompareItem } from '@/types';

export interface SavedComparison {
  id: string;
  name: string;
  collegeIds: string[];
  createdAt: string;
}

interface SavedState {
  savedColleges: CollegeCompareItem[];
  savedComparisons: SavedComparison[];
  saveCollege: (college: CollegeCompareItem) => void;
  removeCollege: (id: string) => void;
  toggleCollege: (college: CollegeCompareItem) => void;
  saveComparison: (comparison: Omit<SavedComparison, 'id' | 'createdAt'>) => void;
  removeComparison: (id: string) => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedColleges: [],
      savedComparisons: [],

      saveCollege: (college) => {
        const { savedColleges } = get();
        if (!savedColleges.some((item) => item.id === college.id)) {
          set({ savedColleges: [college, ...savedColleges] });
        }
      },

      removeCollege: (id) => {
        set((state) => ({
          savedColleges: state.savedColleges.filter((college) => college.id !== id),
        }));
      },

      toggleCollege: (college) => {
        const { savedColleges, saveCollege, removeCollege } = get();
        if (savedColleges.some((item) => item.id === college.id)) {
          removeCollege(college.id);
          return;
        }
        saveCollege(college);
      },

      saveComparison: (comparison) => {
        const sortedIds = [...comparison.collegeIds].sort();
        const exists = get().savedComparisons.some(
          (item) => item.collegeIds.length === sortedIds.length
            && [...item.collegeIds].sort().every((id, index) => id === sortedIds[index]),
        );

        if (exists) {
          return;
        }

        set((state) => ({
          savedComparisons: [
            {
              ...comparison,
              collegeIds: sortedIds,
              id: sortedIds.join('-'),
              createdAt: new Date().toISOString(),
            },
            ...state.savedComparisons,
          ],
        }));
      },

      removeComparison: (id) => {
        set((state) => ({
          savedComparisons: state.savedComparisons.filter((comparison) => comparison.id !== id),
        }));
      },
    }),
    {
      name: 'college-saved-storage',
    },
  ),
);
