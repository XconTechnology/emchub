// Blueprint: javascript_auth_all_persistance - Client-side authentication hook
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useActivity } from "@/contexts/ActivityContext";

const SAVED_ITEMS_KEY = 'emchub_saved_items';

function getLocalSavedItems(): string[] {
  try {
    const saved = localStorage.getItem(SAVED_ITEMS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function clearLocalSavedItems() {
  localStorage.removeItem(SAVED_ITEMS_KEY);
}

async function syncSavedItemsToServer() {
  const localItems = getLocalSavedItems();
  if (localItems.length > 0) {
    try {
      await apiRequest('POST', '/api/saved-items/sync', { listingIds: localItems });
      clearLocalSavedItems();
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    } catch (error) {
      console.error('Failed to sync saved items:', error);
    }
  }
}

type AuthContextType = {
  user: (SelectUser & { isAdmin?: boolean }) | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const isActive = useActivity();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<(SelectUser & { isAdmin?: boolean }) | undefined, Error>({
    queryKey: ["/api/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: isActive ? 5000 : false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: async (user: SelectUser) => {
      queryClient.setQueryData(["/api/me"], user);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      // Sync any saved items from localStorage to server
      await syncSavedItemsToServer();
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: async (user: SelectUser) => {
      queryClient.setQueryData(["/api/me"], user);
      toast({
        title: "Welcome to EMC HUB!",
        description: "Your account has been created successfully.",
      });
      // Sync any saved items from localStorage to server
      await syncSavedItemsToServer();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/me"], null);
      toast({
        title: "Goodbye!",
        description: "You have been signed out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}