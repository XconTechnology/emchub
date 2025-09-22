import { createContext, useContext, useState, useEffect } from "react";

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: () => void;
  adminLogout: () => void;
  checkAdminAuth: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const checkAdminAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/check", {
        credentials: "include",
      });
      const isAuth = response.ok;
      setIsAdminAuthenticated(isAuth);
      return isAuth;
    } catch {
      setIsAdminAuthenticated(false);
      return false;
    }
  };

  const adminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const adminLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Admin logout error:", error);
    }
    setIsAdminAuthenticated(false);
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ 
      isAdminAuthenticated, 
      adminLogin, 
      adminLogout, 
      checkAdminAuth 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}