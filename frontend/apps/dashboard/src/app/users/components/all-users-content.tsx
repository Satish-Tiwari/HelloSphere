"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { User, userService } from "@/services/user.service";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { UserCard } from "./user-card";

export function AllUsersContent() {
    const { data: session } = useSession();
    const accessToken = (session as any)?.accessToken as string;

    const {
        data: users,
        isLoading,
        error,
    } = useQuery<User[]>({
        queryKey: ["users", accessToken],
        queryFn: () => userService.getAllUsers(accessToken),
        enabled: !!accessToken,
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Users
                    </CardTitle>
                    <CardDescription>Loading user data...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Users
                    </CardTitle>
                    <CardDescription className="text-destructive">
                        Failed to load users. Please try again later.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : "An error occurred"}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Users
                </CardTitle>
                <CardDescription>
                    Manage and view all registered users in the system
                </CardDescription>
            </CardHeader>
            <CardContent>
                {users && users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {users.map((user, index) => (
                            <UserCard key={(user as any)._id || user.id || index} user={user} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
