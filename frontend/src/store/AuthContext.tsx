import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  clearAuthData,
  getAccessToken,
  getStoredUser,
  saveAuthData,
  type StoredUser,
} from "../services/authStorage";

type AuthContextType = {
  user: StoredUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, user: StoredUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getAccessToken();
        const storedUser = await getStoredUser();

        if (token && storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.log("Session restore error:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (accessToken: string, authenticatedUser: StoredUser) => {
    await saveAuthData(accessToken, authenticatedUser);
    setUser(authenticatedUser);
  };

  const logout = async () => {
    await clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
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
