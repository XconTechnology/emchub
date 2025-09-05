import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInData) => {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Authentication failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      onClose();
      signInForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign up failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to EMC HUB!",
        description: "Your account has been created successfully.",
      });
      onClose();
      signUpForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGoogleAuth = () => {
    window.open('/api/login', '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes');
  };

  const onSignInSubmit = (data: SignInData) => {
    signInMutation.mutate(data);
  };

  const onSignUpSubmit = (data: SignUpData) => {
    signUpMutation.mutate(data);
  };

  const handleModeSwitch = (newMode: "signin" | "signup") => {
    setMode(newMode);
    signInForm.reset();
    signUpForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "signin" 
              ? "Sign in to your EMC HUB account" 
              : "Join our community of ethnic minority businesses"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Google Authentication */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleAuth}
            data-testid="button-google-auth"
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          {mode === "signin" ? (
            <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    data-testid="input-signin-email"
                    {...signInForm.register("email")}
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    data-testid="input-signin-password"
                    {...signInForm.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={signInMutation.isPending}
                data-testid="button-signin-submit"
              >
                {signInMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstname">First Name</Label>
                  <Input
                    id="signup-firstname"
                    placeholder="First name"
                    data-testid="input-signup-firstname"
                    {...signUpForm.register("firstName")}
                  />
                  {signUpForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-lastname">Last Name</Label>
                  <Input
                    id="signup-lastname"
                    placeholder="Last name"
                    data-testid="input-signup-lastname"
                    {...signUpForm.register("lastName")}
                  />
                  {signUpForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    data-testid="input-signup-email"
                    {...signUpForm.register("email")}
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    data-testid="input-signup-password"
                    {...signUpForm.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                    data-testid="input-signup-confirm-password"
                    {...signUpForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={signUpMutation.isPending}
                data-testid="button-signup-submit"
              >
                {signUpMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}

          {/* Mode Switch */}
          <div className="text-center text-sm">
            {mode === "signin" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => handleModeSwitch("signup")}
                  data-testid="link-switch-signup"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => handleModeSwitch("signin")}
                  data-testid="link-switch-signin"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}