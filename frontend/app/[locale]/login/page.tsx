"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const ta = useTranslations("auth");
  const tv = useTranslations("validation.login");
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(tv("email")),
        password: z.string().min(6, tv("passwordMin")),
      }),
    [tv]
  );

  type LoginValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 1200));

      if (data.email === "admin@charityhub.org" && data.password === "123456") {
        login(
          { name: ta("demoAdminName"), email: data.email, role: "admin" },
          "demo-jwt-token-" + Date.now()
        );
        router.push("/dashboard");
      } else {
        setError(ta("errorInvalid"));
      }
    } catch {
      setError(ta("errorNetwork"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 end-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-primary items-center justify-center mb-2">
            <span className="text-primary-foreground font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">CharityHub</h1>
          <p className="text-muted-foreground text-sm">{ta("tagline")}</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-0 pt-6 px-6">
            <h2 className="text-lg font-semibold text-foreground text-center">{ta("loginTitle")}</h2>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{ta("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="admin@charityhub.org"
                  dir="ltr"
                  className="text-start"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{ta("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder={ta("passwordPlaceholder")}
                    dir="ltr"
                    className="text-start pe-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">
                      {showPassword ? ta("toggleHidePassword") : ta("toggleShowPassword")}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {loading ? ta("submitLoading") : ta("submit")}
              </Button>
            </form>

            <div className="mt-4 p-3 rounded-xl bg-muted text-xs text-muted-foreground">
              <p className="font-medium mb-1">{ta("demoHintTitle")}</p>
              <p dir="ltr" className="text-start">
                admin@charityhub.org / 123456
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
