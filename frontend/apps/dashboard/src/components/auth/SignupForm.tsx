"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSignup } from "@/hooks/useAuth";

// Enum for UserRole
enum UserRole {
    USER = 'USER',
}

const signupSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters"),
    lastName: z.string().min(3, "Last name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
    term: z.boolean().default(false).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            term: false
        }
    });

    const mutation = useSignup({
        onSuccess: () => {
            router.push("/auth/login?signup=success");
        },
        onError: (err: any) => {
            console.error(err);
            const msg = err.response?.data?.message || err.message || err;
            if (Array.isArray(msg)) {
                setError(msg[0]);
            } else {
                setError(typeof msg === 'string' ? msg : "Failed to create account. Please try again.");
            }
        },
    });

    const onSubmit = (data: SignupFormValues) => {
        setError(null);
        // Construct payload matching CreateUserDto for the hook
        const payload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            phone: data.phone,
            role: UserRole.USER,
        };
        mutation.mutate(payload);
    };

    return (
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center space-y-6 mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">
                    Create Account
                </h2>
                <p className="text-sm text-gray-600">
                    Join us today!
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <div className="space-y-2 w-1/2">
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <Input
                            placeholder="John"
                            {...register("firstName")}
                            className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                            <p className="text-xs text-red-500">{errors.firstName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2 w-1/2">
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <Input
                            placeholder="Doe"
                            {...register("lastName")}
                            className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                            <p className="text-xs text-red-500">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                        type="email"
                        placeholder="john@example.com"
                        {...register("email")}
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <Input
                        type="tel"
                        placeholder="9876543210"
                        {...register("phone")}
                        className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                        <p className="text-xs text-red-500">{errors.phone.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <Input
                        type="password"
                        placeholder="******"
                        {...register("password")}
                        className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <Input
                        type="password"
                        placeholder="******"
                        {...register("confirmPassword")}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Creating account..." : "Sign Up"}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link
                        href="/auth/login"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
