"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function SettingsForm() {
  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [signalAlerts, setSignalAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  // Trading
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("5");
  const [riskLevel, setRiskLevel] = useState("moderate");
  const [maxPositionSize, setMaxPositionSize] = useState("10");

  // Strategy
  const [longAllocation, setLongAllocation] = useState("50");
  const [midAllocation, setMidAllocation] = useState("30");
  const [shortAllocation, setShortAllocation] = useState("20");

  // API
  const [apiKey, setApiKey] = useState("");

  const totalAllocation = Number(longAllocation) + Number(midAllocation) + Number(shortAllocation);

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
          enabled={emailAlerts}
          onChange={setEmailAlerts}
        />
        <ToggleRow
          label="推送通知"
          description="浏览器推送紧急信号通知"
          enabled={pushNotifications}
          onChange={setPushNotifications}
        />
        <ToggleRow
          label="信号提醒"
          description="新信号触发时实时提醒"
          enabled={signalAlerts}
          onChange={setSignalAlerts}
        />
        <ToggleRow
          label="每日摘要"
          description="收盘后发送当日汇总邮件"
          enabled={dailyDigest}
          onChange={setDailyDigest}
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
          enabled={autoRefresh}
          onChange={setAutoRefresh}
        />
        <SelectRow
          label="刷新间隔"
          value={refreshInterval}
          options={[
            { value: "1", label: "1 分钟" },
            { value: "5", label: "5 分钟" },
            { value: "15", label: "15 分钟" },
            { value: "30", label: "30 分钟" },
          ]}
          onChange={setRefreshInterval}
        />
        <SelectRow
          label="风险等级"
          description="整体组合风险承受度"
          value={riskLevel}
          options={[
            { value: "conservative", label: "保守" },
            { value: "moderate", label: "稳健" },
            { value: "aggressive", label: "激进" },
          ]}
          onChange={setRiskLevel}
        />
        <InputRow
          label="单仓上限"
          description="每个持仓占组合最大比例"
          value={maxPositionSize}
          type="number"
          placeholder="10"
          suffix="%"
          onChange={setMaxPositionSize}
        />
      </SettingsSection>

      {/* Strategy Allocation */}
      <SettingsSection
        title="策略配置"
        description="目标仓位百分比（总和须为 100%）"
      >
        <InputRow
          label="长线 (THE CORE)"
          description="基本面选质，护城河策略"
          value={longAllocation}
          type="number"
          suffix="%"
          onChange={setLongAllocation}
        />
        <InputRow
          label="中线 (THE FLOW)"
          description="动量跟踪，借势策略"
          value={midAllocation}
          type="number"
          suffix="%"
          onChange={setMidAllocation}
        />
        <InputRow
          label="短线 (THE SWING)"
          description="均值回归，情绪捕捉策略"
          value={shortAllocation}
          type="number"
          suffix="%"
          onChange={setShortAllocation}
        />
        <div className="pt-3 flex items-center justify-between">
          <span className="text-sm text-stripe-ink-lighter">
            总计: {totalAllocation}%
          </span>
          {totalAllocation !== 100 && (
            <span className="text-sm text-stripe-danger">须等于 100%</span>
          )}
        </div>
      </SettingsSection>

      {/* API Configuration */}
      <SettingsSection
        title="API 配置"
        description="连接外部服务和数据提供商"
      >
        <InputRow
          label="API 密钥"
          description="用于外部集成的 OMEGA API 密钥"
          value={apiKey}
          type="password"
          placeholder="输入 API 密钥..."
          onChange={setApiKey}
        />
        <div className="pt-3">
          <Button
            variant="outline"
            className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
          >
            生成新密钥
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-stripe-purple text-white hover:bg-stripe-purple-dark">
          保存设置
        </Button>
      </div>
    </>
  );
}
