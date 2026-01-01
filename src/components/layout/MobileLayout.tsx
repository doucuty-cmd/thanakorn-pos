import { BottomNav } from "./BottomNav";

export const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-900 font-sans pb-20">
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative">
        {children}
      </main>
      <div className="max-w-md mx-auto">
        <BottomNav />
      </div>
    </div>
  );
};