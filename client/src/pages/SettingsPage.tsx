import { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  Loader2,
  User,
  Shield,
  Bell,
  Palette,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { NOTIF_PREFS_KEY, NOTIF_PREFS_CHANGED_EVENT } from '@/hooks/useNotifications';

// ─── Shared primitives ─────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-label">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-text-placeholder">{hint}</p>}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
  className,
}: {
  id: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'h-11 w-full rounded-input border border-input bg-card px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors',
        'focus:border-primary focus:ring-2 focus:ring-primary/20',
        'disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-placeholder',
        className,
      )}
    />
  );
}

// ─── Avatar Upload ─────────────────────────────────────────────────────────────

function AvatarUpload({
  name,
  avatarSrc,
  onFileSelect,
  uploading,
}: {
  name: string;
  avatarSrc?: string | null;
  onFileSelect: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelect(file);
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative group shrink-0">
        <UserAvatar
          name={name}
          src={avatarSrc ?? undefined}
          size="lg"
          className="!h-20 !w-20 !text-2xl"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/40 disabled:cursor-not-allowed"
          aria-label="Upload photo"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          ) : (
            <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
        <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary shadow-sm pointer-events-none">
          <Camera className="h-3 w-3 text-white" />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary mb-0.5">Profile photo</p>
        <p className="text-xs text-text-muted mb-3">JPEG, PNG, WebP · max 5 MB</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-8 items-center gap-1.5 rounded-nav border border-border bg-card px-3 text-xs font-medium text-text-primary shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-surface disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading…
            </>
          ) : (
            'Change photo'
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Profile Section ───────────────────────────────────────────────────────────

function ProfileSection() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarSelect(file: File) {
    setUploading(true);
    setError('');
    try {
      await uploadAvatar(file);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to upload avatar. Check Cloudinary config.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  const isDirty = firstName !== (user?.firstName ?? '') || lastName !== (user?.lastName ?? '');

  return (
    <div className="flex flex-col gap-8">
      {/* Avatar row */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Profile photo</h3>
          <p className="mt-0.5 text-xs text-text-muted">
            This is your public avatar across TaskFlow.
          </p>
        </div>
        <div className="rounded-card border border-border bg-card p-5">
          <AvatarUpload
            name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
            avatarSrc={user?.avatarUrl}
            onFileSelect={(f) => void handleAvatarSelect(f)}
            uploading={uploading}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Name + email */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Personal information</h3>
          <p className="mt-0.5 text-xs text-text-muted">Update your display name.</p>
        </div>
        <div className="rounded-card border border-border bg-card p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" htmlFor="firstName">
              <TextInput
                id="firstName"
                value={firstName}
                onChange={setFirstName}
                placeholder="First name"
              />
            </Field>
            <Field label="Last Name" htmlFor="lastName">
              <TextInput
                id="lastName"
                value={lastName}
                onChange={setLastName}
                placeholder="Last name"
              />
            </Field>
          </div>

          <Field label="Email Address" htmlFor="email" hint="Email cannot be changed.">
            <TextInput id="email" value={user?.email ?? ''} disabled />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <Check className="h-4 w-4" />
                Saved
              </span>
            )}
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !isDirty}
              className="flex h-9 items-center gap-1.5 rounded-nav bg-primary px-5 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2)] transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Security Section ──────────────────────────────────────────────────────────

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-input border border-input bg-card px-3.5 pr-11 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-placeholder transition-colors hover:text-text-muted"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
}

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

function SecuritySection() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(next));
  const passwordsMatch = next === confirm && confirm.length > 0;
  const sameAsCurrent = current.length > 0 && next.length > 0 && next === current;
  const canSubmit = current.length > 0 && allRulesPassed && passwordsMatch && !sameAsCurrent;

  async function handleSubmit() {
    setError('');
    setSaving(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      setSaved(true);
      setCurrent('');
      setNext('');
      setConfirm('');
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password.';
      setError(
        msg.includes('400') || msg.includes('incorrect') ? 'Current password is incorrect.' : msg,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Change password</h3>
        <p className="mt-0.5 text-xs text-text-muted">
          Choose a strong password and don&apos;t reuse it for other accounts.
        </p>
      </div>

      <div className="rounded-card border border-border bg-card p-5 flex flex-col gap-4">
        <PasswordInput
          id="currentPassword"
          label="Current Password"
          value={current}
          onChange={setCurrent}
          placeholder="Enter current password"
        />
        <PasswordInput
          id="newPassword"
          label="New Password"
          value={next}
          onChange={setNext}
          placeholder="Enter new password"
        />

        {next.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-[10px] bg-surface px-4 py-3">
            {PASSWORD_RULES.map((rule) => (
              <div key={rule.label} className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0',
                    rule.test(next) ? 'bg-emerald-500' : 'bg-border',
                  )}
                >
                  {rule.test(next) && <Check className="h-2 w-2 text-white stroke-[3]" />}
                </div>
                <span
                  className={cn(
                    'text-xs',
                    rule.test(next) ? 'text-emerald-600' : 'text-text-placeholder',
                  )}
                >
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat new password"
        />

        {sameAsCurrent && (
          <p className="text-xs text-red-500">
            New password must be different from your current password.
          </p>
        )}
        {!sameAsCurrent && confirm.length > 0 && !passwordsMatch && (
          <p className="text-xs text-red-500">Passwords do not match.</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center justify-end gap-2.5 pt-1">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <Check className="h-4 w-4" />
              Password changed
            </span>
          )}
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving || !canSubmit}
            className="flex h-9 items-center gap-1.5 rounded-nav bg-primary px-5 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2)] transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating…
              </>
            ) : (
              'Update password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder sections ──────────────────────────────────────────────────────

const NOTIF_ITEMS = [
  {
    key: 'taskAssignments',
    label: 'Task assignments',
    desc: 'When someone assigns a task to you',
    defaultOn: true,
  },
  {
    key: 'taskComments',
    label: 'Task comments',
    desc: 'When someone comments on your tasks',
    defaultOn: true,
  },
  {
    key: 'dueDateReminders',
    label: 'Due date reminders',
    desc: '24 hours before a task is due',
    defaultOn: false,
  },
  {
    key: 'statusUpdates',
    label: 'Status updates',
    desc: 'When a task you follow changes status',
    defaultOn: false,
  },
] as const;

type NotifKey = (typeof NOTIF_ITEMS)[number]['key'];

function getStoredNotifPrefs(): Record<NotifKey, boolean> {
  const defaults = Object.fromEntries(NOTIF_ITEMS.map((i) => [i.key, i.defaultOn])) as Record<
    NotifKey,
    boolean
  >;
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_KEY);
    if (raw) return { ...defaults, ...(JSON.parse(raw) as Partial<Record<NotifKey, boolean>>) };
  } catch {
    // localStorage unavailable
  }
  return defaults;
}

function NotificationsSection() {
  const [enabled, setEnabled] = useState<Record<NotifKey, boolean>>(getStoredNotifPrefs);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(enabled));
      window.dispatchEvent(new Event(NOTIF_PREFS_CHANGED_EVENT));
    } catch {
      // localStorage unavailable
    }
  }, [enabled]);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Notification preferences</h3>
        <p className="mt-0.5 text-xs text-text-muted">Choose what you get notified about.</p>
      </div>
      <div className="rounded-card border border-border bg-card divide-y divide-border">
        {NOTIF_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-primary">{item.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled((e) => ({ ...e, [item.key]: !e[item.key] }))}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                enabled[item.key] ? 'bg-primary' : 'bg-border',
              )}
              role="switch"
              aria-checked={enabled[item.key]}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
                  enabled[item.key] ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceSection() {
  const themes: { id: Theme; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  const { theme: selected, setTheme: setSelected } = useTheme();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Appearance</h3>
        <p className="mt-0.5 text-xs text-text-muted">Choose your preferred color theme.</p>
      </div>
      <div className="rounded-card border border-border bg-card p-5">
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={cn(
                'relative flex flex-col items-center gap-2.5 rounded-[10px] border-2 p-4 transition-colors',
                selected === t.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface hover:border-border/80 hover:bg-surface/80',
              )}
            >
              {/* Mini mockup */}
              <div
                className={cn(
                  'w-full h-14 rounded-md overflow-hidden border border-border/60 flex',
                  t.id === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white',
                  t.id === 'system' && 'bg-gradient-to-r from-white to-[#1a1a2e]',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-full flex flex-col gap-1 p-1',
                    t.id === 'dark' ? 'bg-[#111827]' : 'bg-[#f3f4f6]',
                    t.id === 'system' && 'bg-[#f3f4f6]',
                  )}
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 rounded-full',
                        t.id === 'dark' ? 'bg-white/20' : 'bg-black/10',
                      )}
                    />
                  ))}
                </div>
                <div className="flex-1 p-1.5 flex flex-col gap-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 rounded-full',
                        t.id === 'dark' ? 'bg-white/10' : 'bg-black/5',
                      )}
                    />
                  ))}
                </div>
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  selected === t.id ? 'text-primary' : 'text-text-muted',
                )}
              >
                {t.label}
              </span>
              {selected === t.id && (
                <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Nav items ─────────────────────────────────────────────────────────────────

type Section = 'profile' | 'security' | 'notifications' | 'appearance';

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'profile', label: 'Profile', icon: User, desc: 'Name, photo, email' },
  { id: 'security', label: 'Security', icon: Shield, desc: 'Password & access' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & reminders' },
  { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & display' },
];

// ─── SettingsPage ──────────────────────────────────────────────────────────────

export function SettingsPage() {
  useAuth();
  const [active, setActive] = useState<Section>('profile');

  const content: Record<Section, React.ReactNode> = {
    profile: <ProfileSection />,
    security: <SecuritySection />,
    notifications: <NotificationsSection />,
    appearance: <AppearanceSection />,
  };

  const activeItem = NAV_ITEMS.find((n) => n.id === active)!;

  return (
    <div className="flex -m-8 min-h-[calc(100%+4rem)]">
      {/* Left nav */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="px-5 py-6 border-b border-border">
          <h1 className="text-base font-semibold text-text-primary">Settings</h1>
          <p className="mt-0.5 text-xs text-text-muted">Manage your account</p>
        </div>

        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-nav px-3 py-2.5 text-left transition-colors',
                active === id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-surface hover:text-text-primary',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] transition-colors',
                  active === id ? 'bg-primary/10' : 'bg-surface group-hover:bg-border/60',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    active === id ? 'text-primary' : 'text-text-placeholder',
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium leading-none',
                    active === id ? 'text-primary' : 'text-text-primary',
                  )}
                >
                  {label}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-text-placeholder">{desc}</p>
              </div>
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-opacity',
                  active === id ? 'opacity-60 text-primary' : 'opacity-0 group-hover:opacity-40',
                )}
              />
            </button>
          ))}
        </nav>
      </aside>

      {/* Right content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-8 py-8">
          {/* Section heading */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10">
              <activeItem.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.3px] text-text-primary">
                {activeItem.label}
              </h2>
              <p className="text-xs text-text-muted">{activeItem.desc}</p>
            </div>
          </div>

          {content[active]}
        </div>
      </main>
    </div>
  );
}
