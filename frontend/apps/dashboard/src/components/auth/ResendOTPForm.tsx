"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import Link from "next/link";
import { useResendOTP } from "@/hooks/useAuth";

const resendOTPSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ResendOTPFormValues = z.infer<typeof resendOTPSchema>;

export default function ResendOTPForm() {
    const router = useRouter();
    const [error, setError] = useState<String | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<ResendOTPFormValues>({
        resolver: zodResolver(resendOTPSchema),
    });

    const mutation = useResendOTP({
        onSuccess: (data) => {
            setSuccessMessage(data.message || "OTP sent successfully");
            setTimeout(() => {
                router.push("/auth/verify-email");
            }, 2000);
        },
        onError: (error) => {
            setError(error.message || "Failed to verify email");
        }
    });

    const onSubmit = (data: ResendOTPFormValues) => {
        setError(null);
        setSuccessMessage(null);
        mutation.mutate(data);
    }

    return (
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center space-y-6 mb-8">
                <h2 className="text-3xl font-extrabold text-card-foreground">
                    Resend OTP
                </h2>
                <p className="text-sm text-muted-foreground">
                    Enter your email to receive a OTP.
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
                    {mutation.isPending ? "Processing..." : "Resend OTP"}
                </Button>
            </form>

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