import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CompareBar } from '@/components/compare/CompareBar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* 
        flex-1 ensures the main content area expands to fill available space,
        pushing the Footer to the bottom of the viewport even if content is sparse.
      */}
      <main className="flex-1 w-full flex flex-col bg-slate-50">
        {children}
      </main>
      <Footer />
      <CompareBar />
    </div>
  );
}
