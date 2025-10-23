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
      // Check both admin session and user role
      const [adminResponse, userResponse] = await Promise.all([
        fetch("/api/admin/check", { credentials: "include" }),
        fetch("/api/me", { credentials: "include" })
      ]);
      
      // Allow access if either:
      // 1. Has valid admin session
      // 2. Is a user with admin or super-admin role
      if (adminResponse.ok) {
        setIsAdminAuthenticated(true);
        return true;
      }
      
      if (userResponse.ok) {
        const user = await userResponse.json();
        const isAdminRole = user.role === 'admin' || user.role === 'super-admin';
        setIsAdminAuthenticated(isAdminRole);
        return isAdminRole;
      }
      
      setIsAdminAuthenticated(false);
      return false;
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