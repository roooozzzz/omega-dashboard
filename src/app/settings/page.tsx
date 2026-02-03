import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Header
          title="系统设置"
          description="配置交易系统偏好"
        />
        <div className="p-8 max-w-4xl">
          <SettingsForm />
        </div>
      </main>
    </div>
  );
}
