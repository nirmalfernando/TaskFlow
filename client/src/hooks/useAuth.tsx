import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatarSrc?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('taskflow_user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  function login(u: User) {
    setUser(u);
    localStorage.setItem('taskflow_user', JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('taskflow_user');
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
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
