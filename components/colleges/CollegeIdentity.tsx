import type { CollegeCategory } from "@/types";
import { cn } from "@/lib/utils/cn";

interface CollegeIdentityProps {
  shortName: string;
  category: CollegeCategory;
  className?: string;
}

const CATEGORY_STYLES: Record<CollegeCategory, string> = {
  engineering: "from-blue-700 to-cyan-500",
  medical: "from-emerald-700 to-teal-500",
  management: "from-violet-700 to-indigo-500",
  law: "from-amber-700 to-orange-500",
  arts: "from-fuchsia-700 to-purple-500",
  science: "from-slate-700 to-sky-500",
  architecture: "from-stone-700 to-amber-500",
};

function initials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "ED";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase();
}

export function CollegeIdentity({ shortName, category, className }: CollegeIdentityProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br font-black tracking-tight text-white shadow-sm",
        CATEGORY_STYLES[category],
        className,
      )}
      aria-hidden="true"
    >
      {initials(shortName)}
    </div>
  );
}
