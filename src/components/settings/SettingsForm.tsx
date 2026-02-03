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
  options: string[];
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
          <option key={opt} value={opt}>
            {opt}
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
  onChange: (value: string) => void;
}

function InputRow({
  label,
  description,
  value,
  type = "text",
  placeholder,
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
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-48 px-3 py-1.5 text-sm border border-stripe-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stripe-purple/20 focus:border-stripe-purple"
      />
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
  const [refreshInterval, setRefreshInterval] = useState("5 min");
  const [riskLevel, setRiskLevel] = useState("Moderate");
  const [maxPositionSize, setMaxPositionSize] = useState("10");

  // Strategy
  const [longAllocation, setLongAllocation] = useState("50");
  const [midAllocation, setMidAllocation] = useState("30");
  const [shortAllocation, setShortAllocation] = useState("20");

  // API
  const [apiKey, setApiKey] = useState("");

  return (
    <>
      {/* Notifications */}
      <SettingsSection
        title="Notifications"
        description="Configure how you receive alerts and updates"
      >
        <ToggleRow
          label="Email Alerts"
          description="Receive trading signals via email"
          enabled={emailAlerts}
          onChange={setEmailAlerts}
        />
        <ToggleRow
          label="Push Notifications"
          description="Browser push notifications for urgent signals"
          enabled={pushNotifications}
          onChange={setPushNotifications}
        />
        <ToggleRow
          label="Signal Alerts"
          description="Real-time alerts when new signals trigger"
          enabled={signalAlerts}
          onChange={setSignalAlerts}
        />
        <ToggleRow
          label="Daily Digest"
          description="Summary email at market close"
          enabled={dailyDigest}
          onChange={setDailyDigest}
        />
      </SettingsSection>

      {/* Trading Preferences */}
      <SettingsSection
        title="Trading Preferences"
        description="Configure trading behavior and risk parameters"
      >
        <ToggleRow
          label="Auto Refresh"
          description="Automatically refresh market data"
          enabled={autoRefresh}
          onChange={setAutoRefresh}
        />
        <SelectRow
          label="Refresh Interval"
          value={refreshInterval}
          options={["1 min", "5 min", "15 min", "30 min"]}
          onChange={setRefreshInterval}
        />
        <SelectRow
          label="Risk Level"
          description="Overall portfolio risk tolerance"
          value={riskLevel}
          options={["Conservative", "Moderate", "Aggressive"]}
          onChange={setRiskLevel}
        />
        <InputRow
          label="Max Position Size"
          description="Maximum % of portfolio per position"
          value={maxPositionSize}
          type="number"
          placeholder="10"
          onChange={setMaxPositionSize}
        />
      </SettingsSection>

      {/* Strategy Allocation */}
      <SettingsSection
        title="Strategy Allocation"
        description="Target allocation percentages (must total 100%)"
      >
        <InputRow
          label="Long Term (THE CORE)"
          description="Quality-focused fundamental positions"
          value={longAllocation}
          type="number"
          onChange={setLongAllocation}
        />
        <InputRow
          label="Mid Term (THE FLOW)"
          description="Momentum-based swing trades"
          value={midAllocation}
          type="number"
          onChange={setMidAllocation}
        />
        <InputRow
          label="Short Term (THE SWING)"
          description="Mean-reversion tactical trades"
          value={shortAllocation}
          type="number"
          onChange={setShortAllocation}
        />
        <div className="pt-3 flex items-center justify-between">
          <span className="text-sm text-stripe-ink-lighter">
            Total: {Number(longAllocation) + Number(midAllocation) + Number(shortAllocation)}%
          </span>
          {Number(longAllocation) + Number(midAllocation) + Number(shortAllocation) !== 100 && (
            <span className="text-sm text-stripe-danger">Must equal 100%</span>
          )}
        </div>
      </SettingsSection>

      {/* API Configuration */}
      <SettingsSection
        title="API Configuration"
        description="Connect external services and data providers"
      >
        <InputRow
          label="API Key"
          description="Your OMEGA API key for external integrations"
          value={apiKey}
          type="password"
          placeholder="Enter API key..."
          onChange={setApiKey}
        />
        <div className="pt-3">
          <Button
            variant="outline"
            className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
          >
            Generate New Key
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-stripe-purple text-white hover:bg-stripe-purple-dark">
          Save Changes
        </Button>
      </div>
    </>
  );
}
