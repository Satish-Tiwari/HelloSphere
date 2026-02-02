"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import Link from "next/link";
import { useVerifyEmail } from "@/hooks/useAuth";

const verifyEmailSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "Invalid OTP"),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

export default function VerifyEmail() {
    const router = useRouter();
    const [error, setError] = useState<String | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<VerifyEmailFormValues>({
        resolver: zodResolver(verifyEmailSchema),
    });

    const mutation = useVerifyEmail({
        onSuccess: (data) => {
            setSuccessMessage(data.message || "Email verified successfully");
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        },
        onError: (error) => {
            setError(error.message || "Failed to verify email");
        }
    });

    const onSubmit = (data: VerifyEmailFormValues) => {
        setError(null);
        setSuccessMessage(null);
        mutation.mutate(data);
    }

    return (
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center space-y-6 mb-8">
                <h2 className="text-3xl font-extrabold text-card-foreground">
                    Verify Email
                </h2>
                <p className="text-sm text-muted-foreground">
                    Enter your email to verify.
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Otp</label>
                    <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter OTP"
                        {...register("otp")}
                        className={errors.otp ? "border-red-500" : ""}
                    />
                    {errors.otp && (
                        <p className="text-xs text-red-500">{errors.otp.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={mutation.isPending || !!successMessage}
                >
                    {mutation.isPending ? "Processing..." : "Submit"}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                    Resend OTP?{" "}
                    <Link
                        href="/auth/resend-otp"
                        className="font-medium text-primary hover:underline"
                    >
                        Resend OTP
                    </Link>
                </p>
            </div>

            <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/auth/login"
                        className="font-medium text-primary hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}