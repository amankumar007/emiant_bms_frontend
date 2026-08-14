import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  role: "admin" | "engineer" | "technician";
  token: string;
};

type AuthContextType = {
  user: User | null;
  login: (user: User, rememberMe?: boolean) => void;
  logout: () => void;
  isLoading: boolean; //extra for reloading error
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // "Remember me" was checked -> data lives in localStorage (persists across browser restarts).
    // Otherwise it lives in sessionStorage (cleared when the tab/browser closes).
    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setIsLoading(false);
  }, []);

  const login = (user: User, rememberMe: boolean = false) => {
    setUser(user);
    const store = rememberMe ? localStorage : sessionStorage;
    const other = rememberMe ? sessionStorage : localStorage;

    // Make sure we don't leave stale copies in the other storage.
    other.removeItem("user");
    other.removeItem("token");
    other.removeItem("role");

    store.setItem("user", JSON.stringify(user));
    store.setItem("token", user.token);
    store.setItem("role", user.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { useAuth };
