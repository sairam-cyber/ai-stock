"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupFormData } from "@/lib/validations/auth";
import { useAuthStore } from "@/stores/auth-store";

// ─── Password strength indicator ──────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(
    () => [
      { label: "8+ characters", met: password.length >= 8 },
      { label: "Uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Lowercase letter", met: /[a-z]/.test(password) },
      { label: "Number", met: /\d/.test(password) },
    ],
    [password]
  );

  const strength = checks.filter((c) => c.met).length;
  const barColor =
    strength <= 1
      ? "bg-destructive"
      : strength <= 2
        ? "bg-orange-500"
        : strength <= 3
          ? "bg-yellow-500"
          : "bg-stock-up";

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-3 pt-1"
    >
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? barColor : "bg-muted"
            }`}
          />
        ))}
      </div>
      {/* Checks */}
      <div className="grid grid-cols-2 gap-1.5">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center gap-1.5 text-xs"
          >
            {check.met ? (
              <Check className="h-3 w-3 text-stock-up" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span
              className={
                check.met ? "text-stock-up" : "text-muted-foreground"
              }
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const watchPassword = watch("password");

  const onSubmit = async (formData: SignupFormData) => {
    try {
      await registerUser(formData.name, formData.email, formData.password);
      toast.success("Account created!", {
        description: "Welcome to AI Stock. Let's get started.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message || "Please try again.",
      });
    }
  };

  const formFields = [
    {
      id: "name",
      label: "Full Name",
      icon: User,
      type: "text",
      placeholder: "John Doe",
      autoComplete: "name",
      registerKey: "name" as const,
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      type: "email",
      placeholder: "you@example.com",
      autoComplete: "email",
      registerKey: "email" as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold tracking-tight"
        >
          Create your account
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-muted-foreground"
        >
          Start your journey with AI-powered investing
        </motion.p>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Name & Email */}
        {formFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <div className="relative">
              <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                className="pl-10"
                autoComplete={field.autoComplete}
                {...register(field.registerKey)}
              />
            </div>
            {errors[field.registerKey] && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-destructive"
              >
                {errors[field.registerKey]?.message}
              </motion.p>
            )}
          </div>
        ))}

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              className="pl-10 pr-10"
              autoComplete="new-password"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <PasswordStrength password={watchPassword || ""} />
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-destructive"
            >
              {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              className="pl-10 pr-10"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-destructive"
            >
              {errors.confirmPassword.message}
            </motion.p>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link
            href="#"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {/* Submit */}
        <Button
          type="submit"
          variant="glow"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </motion.form>

      {/* Login Link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-sm text-muted-foreground"
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
