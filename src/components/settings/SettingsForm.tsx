"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsApi, type SettingsData } from "@/lib/api";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-stripe-border p-6 mb-6 shadow-[var(--shadow-omega-sm)]">
      <div className="mb-4">
        <h3 className="font-semibold text-stripe-ink">{title}</h3>
        {description && (
          <p className="text-sm text-stripe-ink-lighter mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function ToggleRow({ label, description, enabled, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stripe-border-light last:border-0">
      <div>
        <p className="text-sm font-medium text-stripe-ink">{label}</p>
        {description && (
          <p className="text-xs text-stripe-ink-lighter mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? "bg-stripe-purple" : "bg-stripe-border"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

interface SelectRowProps {
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectRow({ label, description, value, options, onChange }: SelectRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stripe-border-light last:border-0">
      <div>
        <p className="text-sm font-medium text-stripe-ink">{label}</p>
        {description && (
          <p className="text-xs text-stripe-ink-lighter mt-0.5">{description}</p>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface InputRowProps {
  label: string;
  description?: string;
  value: string;
  type?: string;
  placeholder?: string;
  suffix?: string;
  onChange: (value: string) => void;
}

function InputRow({
  label,
  description,
  value,
  type = "text",
  placeholder,
  suffix,
  onChange,
}: InputRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stripe-border-light last:border-0">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-stripe-ink">{label}</p>
        {description && (
          <p className="text-xs text-stripe-ink-lighter mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 px-3 py-1.5 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
        />
        {suffix && (
          <span className="text-sm text-stripe-ink-lighter">{suffix}</span>
        )}
      </div>
    </div>
  );
}

const DEFAULT_SETTINGS: SettingsData = {
  notifications: {
    emailAlerts: false,
    pushNotifications: true,
    signalAlerts: true,
    dailyDigest: false,
  },
  trading: {
    autoRefresh: true,
    refreshInterval: 5,
    riskLevel: "moderate",
    maxPositionSize: 0.1,
  },
  strategyAllocation: {
    longPct: 30,
    midPct: 20,
    shortPct: 15,
  },
};

export function SettingsForm() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // 页面加载时从后端读取设置
  const loadSettings = useCallback(async () => {
    try {
      const data = await settingsApi.get();
      setSettings(data);
    } catch {
      // 加载失败用默认值
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 保存到后端
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const data = await settingsApi.update(settings);
      setSettings(data);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  // 更新嵌套字段的辅助函数
  const updateNotifications = (key: keyof SettingsData["notifications"], value: boolean) => {
    setSettings((s) => ({ ...s, notifications: { ...s.notifications, [key]: value } }));
  };
  const updateTrading = (key: keyof SettingsData["trading"], value: boolean | number | string) => {
    setSettings((s) => ({ ...s, trading: { ...s.trading, [key]: value } }));
  };
  const updateAllocation = (key: keyof SettingsData["strategyAllocation"], value: number) => {
    setSettings((s) => ({ ...s, strategyAllocation: { ...s.strategyAllocation, [key]: value } }));
  };

  const totalAllocation =
    settings.strategyAllocation.longPct +
    settings.strategyAllocation.midPct +
    settings.strategyAllocation.shortPct;

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-6 h-6 text-stripe-purple animate-spin mx-auto mb-2" />
        <p className="text-sm text-stripe-ink-lighter">加载设置...</p>
      </div>
    );
  }

  return (
    <>
      {/* Notifications */}
      <SettingsSection
        title="通知设置"
        description="配置接收提醒和更新的方式"
      >
        <ToggleRow
          label="邮件提醒"
          description="通过邮件接收交易信号"
          enabled={settings.notifications.emailAlerts}
          onChange={(v) => updateNotifications("emailAlerts", v)}
        />
        <ToggleRow
          label="推送通知"
          description="浏览器推送紧急信号通知"
          enabled={settings.notifications.pushNotifications}
          onChange={(v) => updateNotifications("pushNotifications", v)}
        />
        <ToggleRow
          label="信号提醒"
          description="新信号触发时实时提醒"
          enabled={settings.notifications.signalAlerts}
          onChange={(v) => updateNotifications("signalAlerts", v)}
        />
        <ToggleRow
          label="每日摘要"
          description="收盘后发送当日汇总邮件"
          enabled={settings.notifications.dailyDigest}
          onChange={(v) => updateNotifications("dailyDigest", v)}
        />
      </SettingsSection>

      {/* Trading Preferences */}
      <SettingsSection
        title="交易偏好"
        description="配置交易行为和风险参数"
      >
        <ToggleRow
          label="自动刷新"
          description="自动刷新市场数据"
          enabled={settings.trading.autoRefresh}
          onChange={(v) => updateTrading("autoRefresh", v)}
        />
        <SelectRow
          label="刷新间隔"
          value={String(settings.trading.refreshInterval)}
          options={[
            { value: "1", label: "1 分钟" },
            { value: "5", label: "5 分钟" },
            { value: "15", label: "15 分钟" },
            { value: "30", label: "30 分钟" },
          ]}
          onChange={(v) => updateTrading("refreshInterval", Number(v))}
        />
        <SelectRow
          label="风险等级"
          description="整体组合风险承受度"
          value={settings.trading.riskLevel}
          options={[
            { value: "conservative", label: "保守" },
            { value: "moderate", label: "稳健" },
            { value: "aggressive", label: "激进" },
          ]}
          onChange={(v) => updateTrading("riskLevel", v)}
        />
        <InputRow
          label="单仓上限"
          description="每个持仓占组合最大比例"
          value={String(Math.round(settings.trading.maxPositionSize * 100))}
          type="number"
          placeholder="10"
          suffix="%"
          onChange={(v) => updateTrading("maxPositionSize", Number(v) / 100)}
        />
      </SettingsSection>

      {/* Strategy Allocation */}
      <SettingsSection
        title="策略配置"
        description="长线/中线/短线的目标仓位百分比（指数层 35% 固定，剩余三层总和须为 65%）"
      >
        <div className="py-3 border-b border-stripe-border-light flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stripe-ink-lighter">指数 (THE BASE)</p>
            <p className="text-xs text-stripe-ink-lighter mt-0.5">ETF 定投，固定配比</p>
          </div>
          <span className="text-sm font-medium text-stripe-ink-lighter">35%</span>
        </div>
        <InputRow
          label="长线 (THE CORE)"
          description="基本面选质，护城河策略"
          value={String(settings.strategyAllocation.longPct)}
          type="number"
          suffix="%"
          onChange={(v) => updateAllocation("longPct", Number(v))}
        />
        <InputRow
          label="中线 (THE FLOW)"
          description="动量跟踪，借势策略"
          value={String(settings.strategyAllocation.midPct)}
          type="number"
          suffix="%"
          onChange={(v) => updateAllocation("midPct", Number(v))}
        />
        <InputRow
          label="短线 (THE SWING)"
          description="均值回归，情绪捕捉策略"
          value={String(settings.strategyAllocation.shortPct)}
          type="number"
          suffix="%"
          onChange={(v) => updateAllocation("shortPct", Number(v))}
        />
        <div className="pt-3 flex items-center justify-between">
          <span className="text-sm text-stripe-ink-lighter">
            三层合计: {totalAllocation}%（目标 65%）
          </span>
          {totalAllocation !== 65 && (
            <span className="text-sm text-stripe-danger">须等于 65%</span>
          )}
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saveStatus === "success" && (
          <span className="flex items-center gap-1 text-sm text-stripe-success">
            <Check className="w-4 h-4" />
            已保存
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm text-stripe-danger">保存失败，请重试</span>
        )}
        <Button
          className="bg-stripe-purple text-white hover:bg-stripe-purple-dark"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              保存中...
            </>
          ) : (
            "保存设置"
          )}
        </Button>
      </div>
    </>
  );
}
