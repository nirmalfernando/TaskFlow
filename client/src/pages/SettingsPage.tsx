import { useRef, useState } from 'react';
import { Camera, Check, Eye, EyeOff, KeyRound, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/shared/UserAvatar';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'security';

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-nav px-3.5 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-white shadow-nav-active'
          : 'text-text-muted hover:bg-surface hover:text-text-primary',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

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
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelect(file);
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <UserAvatar
          name={name}
          src={avatarSrc ?? undefined}
          size="lg"
          className="!h-20 !w-20 !text-xl"
        />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-1.5 rounded-[12px] border-2 border-dashed px-8 py-4 transition-colors',
            dragOver
              ? 'border-primary bg-primary-light'
              : 'border-border bg-surface hover:border-primary/50 hover:bg-primary-light/30',
          )}
        >
          <Camera className="h-5 w-5 text-text-muted" />
          <p className="text-xs font-medium text-text-muted">
            Drop image here or <span className="text-primary">browse</span>
          </p>
          <p className="text-[11px] text-text-placeholder">JPEG, PNG, WebP or GIF · max 5 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

// ─── Profile Tab ───────────────────────────────────────────────────────────────

function ProfileTab() {
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
    <div className="flex flex-col gap-6">
      {/* Avatar */}
      <div className="rounded-card border border-border bg-card p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="mb-1 text-sm font-semibold text-text-primary">Profile Photo</h3>
        <p className="mb-4 text-xs text-text-muted">
          This will be displayed in your sidebar, task assignments, and activity feed.
        </p>
        <AvatarUpload
          name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
          avatarSrc={user?.avatarUrl}
          onFileSelect={(f) => void handleAvatarSelect(f)}
          uploading={uploading}
        />
      </div>

      {/* Name + Email */}
      <div className="rounded-card border border-border bg-card p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="mb-1 text-sm font-semibold text-text-primary">Personal Information</h3>
        <p className="mb-5 text-xs text-text-muted">Update your name shown across the app.</p>

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

        <div className="mt-4">
          <Field label="Email Address" htmlFor="email" hint="Email cannot be changed.">
            <TextInput id="email" value={user?.email ?? ''} disabled />
          </Field>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex items-center justify-end gap-2.5">
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
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────────────────────

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

function SecurityTab() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(next));
  const passwordsMatch = next === confirm && confirm.length > 0;
  const canSubmit = current.length > 0 && allRulesPassed && passwordsMatch;

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
    <div className="rounded-card border border-border bg-card p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#eff6ff]">
          <KeyRound className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary">Change Password</h3>
      </div>
      <p className="mb-5 text-xs text-text-muted">
        Choose a strong password and don&apos;t reuse it for other accounts.
      </p>

      <div className="flex flex-col gap-4">
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

        {/* Password strength checklist */}
        {next.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-[10px] bg-surface px-4 py-3">
            {PASSWORD_RULES.map((rule) => (
              <div key={rule.label} className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded-full flex items-center justify-center',
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

        {confirm.length > 0 && !passwordsMatch && (
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
              'Update Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SettingsPage ──────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.6px] text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your account profile and security.</p>
      </div>

      <div className="flex gap-6">
        {/* Left nav */}
        <aside className="w-48 shrink-0">
          <div className="flex flex-col gap-0.5">
            <TabButton
              active={tab === 'profile'}
              onClick={() => setTab('profile')}
              icon={<User className="h-[18px] w-[18px]" />}
              label="Profile"
            />
            <TabButton
              active={tab === 'security'}
              onClick={() => setTab('security')}
              icon={<KeyRound className="h-[18px] w-[18px]" />}
              label="Security"
            />
          </div>
        </aside>

        {/* Right content */}
        <div className="flex-1 min-w-0">
          {tab === 'profile' && <ProfileTab />}
          {tab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
