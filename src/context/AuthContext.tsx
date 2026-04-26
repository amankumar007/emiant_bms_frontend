import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  role: "admin" | "engineer" | "technician";
  token: string;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean; //extra for reloading error
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setIsLoading(false);
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user)); // Store for persistence
    localStorage.setItem("token", user.token); // Add this line
    localStorage.setItem("role", user.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Clear on logout
    localStorage.removeItem("token"); // Add this line
    localStorage.removeItem("role");
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