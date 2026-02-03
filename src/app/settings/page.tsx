import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Header
          title="Settings"
          description="Configure your trading system preferences"
        />
        <div className="p-8 max-w-4xl">
          <SettingsForm />
        </div>
      </main>
    </div>
  );
}
