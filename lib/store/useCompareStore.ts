import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CollegeCompareItem } from '@/types';

interface CompareState {
  selectedColleges: CollegeCompareItem[];
  addCollege: (college: CollegeCompareItem) => void;
  removeCollege: (id: string) => void;
  toggleCollege: (college: CollegeCompareItem) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      selectedColleges: [],
      
      addCollege: (college) => {
        const { selectedColleges } = get();
        if (selectedColleges.length < 3 && !selectedColleges.some(c => c.id === college.id)) {
          set({ selectedColleges: [...selectedColleges, college] });
        }
      },
      
      removeCollege: (id) => {
        set((state) => ({
          selectedColleges: state.selectedColleges.filter((c) => c.id !== id),
        }));
      },

      toggleCollege: (college) => {
        const { selectedColleges, addCollege, removeCollege } = get();
        if (selectedColleges.some((c) => c.id === college.id)) {
          removeCollege(college.id);
          return;
        }
        addCollege(college);
      },
      
      clearCompare: () => {
        set({ selectedColleges: [] });
      },
    }),
    {
      name: 'college-compare-storage',
    }
  )
);
