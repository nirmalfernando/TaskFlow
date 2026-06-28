import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { tokenStorage } from '@/services/api';
import * as authService from '@/services/auth.service';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (input: authService.LoginInput) => Promise<void>;
  register: (input: authService.RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: authService.UpdateProfileInput) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (input: authService.ChangePasswordInput) => Promise<void>;
}

const USER_KEY = 'taskflow_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  function persistUser(u: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }

  async function login(input: authService.LoginInput) {
    const { user: u, tokens } = await authService.login(input);
    tokenStorage.set(tokens);
    persistUser(u);
  }

  async function register(input: authService.RegisterInput) {
    const { user: u, tokens } = await authService.register(input);
    tokenStorage.set(tokens);
    persistUser(u);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      tokenStorage.clear();
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }

  async function updateProfile(input: authService.UpdateProfileInput) {
    const updated = await authService.updateProfile(input);
    persistUser(updated);
  }

  async function uploadAvatar(file: File) {
    const updated = await authService.uploadAvatar(file);
    persistUser(updated);
  }

  async function changePassword(input: authService.ChangePasswordInput) {
    await authService.changePassword(input);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
