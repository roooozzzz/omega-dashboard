import { Sidebar } from "@/components/layout/Sidebar";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";

export default function SignalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <MobileMenuButton />
      <Sidebar />
      {children}
    </div>
  );
}
