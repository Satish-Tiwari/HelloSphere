"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useResetPassword } from "@/hooks/useAuth";

const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(4, "OTP must be exactly 4 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmNewPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const emailParam = searchParams.get("email") || "";

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: emailParam,
        }
    });

    useEffect(() => {
        if (emailParam) {
            setValue("email", emailParam);
        }
    }, [emailParam, setValue]);

    const mutation = useResetPassword({
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => {
                router.push("/auth/login?reset=success");
            }, 2000);
        },
        onError: (err: any) => {
            console.error(err);
            const msg = err.message || "Failed to reset password. Please check your OTP.";
            setError(msg);
        },
    });

    const onSubmit = (data: ResetPasswordFormValues) => {
        setError(null);
        mutation.mutate(data);
    };

    if (success) {
        return (
            <div className="bg-green-500/10 p-6 rounded-lg text-center">
                <h3 className="text-xl font-medium text-green-900 dark:text-green-500">Password Reset Successful!</h3>
                <p className="mt-2 text-green-700 dark:text-green-400">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center space-y-6 mb-8">
                <h2 className="text-3xl font-extrabold text-card-foreground">
                    Reset Password
                </h2>
                <p className="text-sm text-muted-foreground">
                    Enter the OTP sent to your email and your new password.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <Input
                        type="email"
                        placeholder="user@example.com"
                        {...register("email")}
                        readOnly={!!emailParam}
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">OTP</label>
                    <Input
                        type="text"
                        placeholder="1234"
                        maxLength={4}
                        {...register("otp")}
                        className={errors.otp ? "border-red-500" : ""}
                    />
                    {errors.otp && (
                        <p className="text-xs text-red-500">{errors.otp.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">New Password</label>
                    <Input
                        type="password"
                        placeholder="******"
                        {...register("newPassword")}
                        className={errors.newPassword ? "border-red-500" : ""}
                    />
                    {errors.newPassword && (
                        <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                    <Input
                        type="password"
                        placeholder="******"
                        {...register("confirmNewPassword")}
                        className={errors.confirmNewPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmNewPassword && (
                        <p className="text-xs text-red-500">{errors.confirmNewPassword.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Resetting Password..." : "Reset Password"}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                    Back to{" "}
                    <Link
                        href="/auth/login"
                        className="font-medium text-primary hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
