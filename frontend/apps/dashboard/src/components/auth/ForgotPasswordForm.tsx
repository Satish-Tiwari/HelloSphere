"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useForgotPassword } from "@/hooks/useAuth";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const mutation = useForgotPassword({
        onSuccess: (data) => {
            setSuccessMessage(data.message || "Reset link sent successfully");
            const email = getValues("email");
            setTimeout(() => {
                router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
            }, 1500);
        },
        onError: (err: any) => {
            console.error(err);
            const msg = err.message || "Failed to send OTP. Please try again.";
            setError(msg);
        },
    });

    const onSubmit = (data: ForgotPasswordFormValues) => {
        setError(null);
        setSuccessMessage(null);
        mutation.mutate(data);
    };

    return (
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center space-y-6 mb-8">
                <h2 className="text-3xl font-extrabold text-card-foreground">
                    Forgot Password
                </h2>
                <p className="text-sm text-muted-foreground">
                    Enter your email to receive a reset OTP.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md">
                        {successMessage}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <Input
                        type="email"
                        placeholder="user@example.com"
                        {...register("email")}
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={mutation.isPending || !!successMessage}
                >
                    {mutation.isPending ? "Sending..." : "Send OTP"}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                    Remember your password?{" "}
                    <Link
                        href="/auth/login"
                        className="font-medium text-primary hover:underline"
                    >
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
