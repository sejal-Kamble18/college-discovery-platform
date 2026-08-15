import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SavedCollegesProvider } from "@/lib/hooks/useSavedColleges";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Ensures text remains visible during webfont load
});

export const metadata: Metadata = {
  title: {
    template: "%s | College Discovery Platform",
    default: "College Discovery Platform - Find Your Dream College",
  },
  description:
    "Search and compare colleges across India, save a private shortlist, and use transparent cutoff-matching tools.",
  keywords: [
    "colleges in india",
    "top engineering colleges",
    "btech admissions",
    "compare colleges",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <AuthProvider><SavedCollegesProvider>{children}</SavedCollegesProvider></AuthProvider>
      </body>
    </html>
  );
}
