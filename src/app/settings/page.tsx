"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { Header } from "@/components/layout/Header";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-stripe-bg">
      <MobileMenuButton />
      <Sidebar />
      <MainContent>
        <Header
          title="系统设置"
          description="配置交易系统偏好"
        />
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
          <SettingsForm />
        </div>
      </MainContent>
    </div>
  );
}
