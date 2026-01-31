import AuthSkeleton from "@/components/auth/AuthSkeleton";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <AuthSkeleton />
        </div>
    );
}
