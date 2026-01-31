import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";
import AuthSkeleton from "@/components/auth/AuthSkeleton";

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Suspense fallback={<AuthSkeleton />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
