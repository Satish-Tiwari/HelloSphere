import { Skeleton } from "@/components/ui/skeleton";

export default function AuthSkeleton() {
    return (
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-6 mb-8">
                <Skeleton className="h-9 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>

            <div className="space-y-6">
                {/* Input Field Skeletons (simulating 2 fields like Login) */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* Button Skeleton */}
                <Skeleton className="h-10 w-full mt-6" />
            </div>

            {/* Footer Link Skeleton */}
            <div className="mt-6 text-center">
                <Skeleton className="h-4 w-48 mx-auto" />
            </div>
        </div>
    );
}
