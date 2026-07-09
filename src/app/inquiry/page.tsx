import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { InquiryWorkspace } from './InquiryWorkspace';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Interested Items — NB57's Nostalgia",
  description: "Review your interested collectibles and submit an inquiry.",
};

export default function InquiryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-slate-900 selection:bg-slate-200">
      <Navbar />
      <main className="flex-1 w-full pt-32 pb-32">
        <InquiryWorkspace />
      </main>
      <Footer />
    </div>
  );
}
