"use client";

import { User } from "@/services/user.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

interface UserCardProps {
    user: User;
}

export function UserCard({ user }: UserCardProps) {
    const initials = user.firstName && user.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : user.email[0].toUpperCase();

    const fullName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email;

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Avatar */}
                    <Avatar className="h-20 w-20 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                        <AvatarImage src="" alt={fullName} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    {/* Name and Role */}
                    <div className="space-y-1 w-full">
                        <div className="flex items-center justify-center gap-2">
                            <h3 className="font-semibold text-lg truncate">{fullName}</h3>
                            {user.isEmailVerified && (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {user.role || "USER"}
                        </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 w-full">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        {user.isEmailVerified ? (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                <Link href={`/users/${(user as any)._id || user.id}`} className="w-full">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        View Profile
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
