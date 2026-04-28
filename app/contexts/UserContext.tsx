// app/contexts/UserContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getUserProfile } from "@/actions/user";

interface Company {
  id: number;
  name: string;
  website?: string | null;
  industry?: string | null;
  rollPrefix: string;
  rollInfix?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
}

interface User {
  id: number;
  fname: string | null;
  lname: string | null;
  email: string;
  company: Company | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
  companyId: number | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getUserProfile();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const companyId = user?.company?.id || null;

  return (
    <UserContext.Provider value={{ user, loading, error, refetchUser: fetchUser, companyId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}