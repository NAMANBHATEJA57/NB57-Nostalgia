import Navbar from '@/components/layout/Navbar';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="py-32 px-6 max-w-7xl mx-auto flex-1 w-full">
      <h1 className="font-cormorant text-5xl font-bold mb-8">All Categories</h1>
      <p className="text-muted-foreground text-lg mb-12">
        This page is currently under construction. Soon you will be able to browse all our nostalgic categories here!
      </p>
      </div>
    </div>
  );
}
