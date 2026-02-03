"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { userService } from "@/services/user.service";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Mail,
    Phone,
    Shield,
    CheckCircle,
    Clock,
    UserPlus,
    MessageCircle,
    MoreHorizontal,
    Calendar,
} from "lucide-react";
import Link from "next/link";

interface UserProfileContentProps {
    userId: string;
}

export function UserProfileContent({ userId }: UserProfileContentProps) {
    const { data: session } = useSession();
    const accessToken = (session as any)?.accessToken as string;

    const {
        data: user,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => userService.getUserById(userId, accessToken),
        enabled: !!accessToken && !!userId,
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-32" />
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            <Skeleton className="h-32 w-32 rounded-full" />
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>User Not Found</CardTitle>
                    <CardDescription>
                        The user you're looking for doesn't exist or you don't have permission to view it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/users">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const initials = user.firstName && user.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : user.email[0].toUpperCase();

    const fullName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link href="/users">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
            </Link>

            {/* Profile Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center md:items-start space-y-4">
                            <Avatar className="h-32 w-32 ring-4 ring-primary/10">
                                <AvatarImage src="" alt={fullName} />
                                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* User Info Section */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-3xl font-bold">{fullName}</h1>
                                    {user.isEmailVerified && (
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    )}
                                </div>
                                <Badge variant="secondary" className="text-sm">
                                    {user.role || "USER"}
                                </Badge>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                                    <UserPlus className="h-4 w-4" />
                                    Connect
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Message
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Status Badge */}
                            <div>
                                {user.isEmailVerified ? (
                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified Account
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending Verification
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>How to reach this user</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </div>

                    {user.phone && (
                        <>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{user.phone}</p>
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Role</p>
                            <p className="font-medium capitalize">{user.role || "User"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>Additional information about this account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {user.createdAt && (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Member Since</p>
                                <p className="font-medium">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    )}

                    {user._id && (
                        <>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">User ID</p>
                                    <p className="font-mono text-xs bg-muted p-2 rounded">
                                        {user._id || user.id}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
