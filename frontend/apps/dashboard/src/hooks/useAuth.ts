"use client";

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { authService, SignupDto, ForgotPasswordDto, ResetPasswordDto, LoginDto, VerifyEmailDto, ResendOTPDto } from "@/services/auth.service";

export const useSignup = (options?: UseMutationOptions<any, any, SignupDto>) => {
    return useMutation({
        mutationFn: (data: SignupDto) => authService.signup(data),
        ...options,
    });
};

export const useForgotPassword = (options?: UseMutationOptions<any, any, ForgotPasswordDto>) => {
    return useMutation({
        mutationFn: (data: ForgotPasswordDto) => authService.forgotPasswordEmail(data),
        ...options,
    });
};

export const useResetPassword = (options?: UseMutationOptions<any, any, ResetPasswordDto>) => {
    return useMutation({
        mutationFn: (data: ResetPasswordDto) => authService.resetPassword(data),
        ...options,
    });
};

export const useVerifyEmail = (options?: UseMutationOptions<any, any, VerifyEmailDto>) => {
    return useMutation({
        mutationFn: (data: VerifyEmailDto) => authService.verifyEmail(data),
        ...options,
    });
}

export const useResendOTP = (options?: UseMutationOptions<any, any, ResendOTPDto>) => {
    return useMutation({
        mutationFn: (data: ResendOTPDto) => authService.resendOTP(data),
        ...options,
    });
}