import { createContext, ReactNode, useContext, useState } from "react";
import type { User } from "../types/todo";

type AuthContextType = {
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginUser = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const logoutUser = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
