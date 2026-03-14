import { Settings, Shield, Bell, Globe, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Configure platform settings and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard
          icon={Shield}
          title="Security"
          description="Authentication, passwords, and access control"
          items={['Two-factor authentication', 'Password policies', 'Session management', 'API keys']}
        />
        <SettingsCard
          icon={Bell}
          title="Notifications"
          description="Email, push, and in-app notification preferences"
          items={['Order alerts', 'Chef verification alerts', 'Revenue reports', 'System notifications']}
        />
        <SettingsCard
          icon={Globe}
          title="Platform"
          description="General platform configuration"
          items={['Service areas', 'Commission rates', 'Delivery fees', 'Operating hours']}
        />
        <SettingsCard
          icon={Database}
          title="Data & Exports"
          description="Data management and report exports"
          items={['Export user data', 'Order reports', 'Revenue reports', 'Audit logs']}
        />
      </div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  items,
}: {
  icon: typeof Settings;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm"
          >
            <span className="text-foreground">{item}</span>
            <span className="text-xs text-muted-foreground">Configure</span>
          </div>
        ))}
      </div>
    </div>
  );
}
