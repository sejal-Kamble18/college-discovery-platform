"use client";

import Image from "next/image";
import { useState } from "react";
import type { CollegeCategory } from "@/types";
import { cn } from "@/lib/utils/cn";

type CollegeMediaVariant = "cover" | "logo";

interface CollegeMediaProps {
  src?: string;
  alt: string;
  shortName: string;
  category: CollegeCategory;
  variant: CollegeMediaVariant;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}

const CATEGORY_STYLES: Record<CollegeCategory, string> = {
  engineering: "from-blue-950 via-blue-800 to-cyan-600",
  medical: "from-emerald-950 via-emerald-800 to-teal-500",
  management: "from-violet-950 via-indigo-800 to-blue-500",
  law: "from-amber-950 via-amber-800 to-orange-500",
  arts: "from-fuchsia-950 via-purple-800 to-pink-500",
  science: "from-slate-950 via-slate-700 to-sky-500",
  architecture: "from-stone-950 via-stone-700 to-amber-500",
};

function initials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "ED";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase();
}

function Fallback({
  alt,
  shortName,
  category,
  variant,
}: Pick<CollegeMediaProps, "alt" | "shortName" | "category" | "variant">) {
  const accessibleProps = alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true };

  if (variant === "logo") {
    return (
      <div
        {...accessibleProps}
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-slate-100 text-sm font-black tracking-tight text-brand-700"
      >
        {initials(shortName)}
      </div>
    );
  }

  return (
    <div
      {...accessibleProps}
      className={cn(
        "absolute inset-0 overflow-hidden bg-gradient-to-br text-white",
        CATEGORY_STYLES[category],
      )}
    >
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border border-white/15 bg-white/5" />
      <div className="absolute -bottom-20 left-1/4 h-52 w-52 rounded-full border border-white/10 bg-white/5" />
      <svg
        className="absolute bottom-5 right-5 h-20 w-20 text-white/15"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 3 1.5 8.7 5 10.6v5.7L12 20l7-3.7v-5.7l1.5-.8V16h2V8.7L12 3Zm0 2.3 6.3 3.4L12 12.1 5.7 8.7 12 5.3Zm5 9.8-5 2.7-5-2.7v-3.4l5 2.7 5-2.7v3.4Z" />
      </svg>
      <div className="absolute bottom-5 left-5 max-w-[70%]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{category}</p>
        <p className="mt-1 truncate text-lg font-extrabold">{shortName}</p>
      </div>
    </div>
  );
}

export function CollegeMedia({
  src,
  alt,
  shortName,
  category,
  variant,
  className,
  imageClassName,
  priority = false,
  sizes,
}: CollegeMediaProps) {
  const normalizedSrc = src?.trim() || "";
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !normalizedSrc || failedSrc === normalizedSrc;
  const defaultSizes = variant === "cover" ? "(max-width: 768px) 100vw, 33vw" : "160px";
  const imageAlt = alt.trim();
  const positionClass = className?.split(/\s+/).includes("absolute") ? "" : "relative";

  return (
    <div className={cn(positionClass, "overflow-hidden", className)}>
      <Fallback alt={imageAlt} shortName={shortName} category={category} variant={variant} />
      {!failed && (
        <Image
          src={normalizedSrc}
          alt={imageAlt}
          fill
          sizes={sizes || defaultSizes}
          priority={priority}
          unoptimized={normalizedSrc.startsWith("http")}
          onError={() => setFailedSrc(normalizedSrc)}
          className={cn(
            variant === "cover" ? "object-cover" : "object-contain p-2",
            imageClassName,
          )}
        />
      )}
    </div>
  );
}
