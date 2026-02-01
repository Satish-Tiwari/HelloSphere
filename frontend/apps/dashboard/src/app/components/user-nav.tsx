"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { signOut } from "next-auth/react";
import { User, Mail, Shield, Phone, Fingerprint, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    phone?: string;
}

interface UserNavProps {
    user: UserProfile;
}

export function UserNav({ user }: UserNavProps) {
    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-border">
                <div className="bg-muted/30 p-6 border-b border-border flex flex-col items-center justify-center text-center space-y-2">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/10">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback className="text-xl bg-primary/5 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                        <DialogTitle className="font-semibold text-lg tracking-tight">{user.name}</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">{user.email}</DialogDescription>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid gap-4">

                        {user.role && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-xs text-muted-foreground font-medium">Role</span>
                                    <span className="font-medium capitalize">{user.role}</span>
                                </div>
                            </div>
                        )}

                        {user.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-xs text-muted-foreground font-medium">Phone</span>
                                    <span className="font-medium">{user.phone}</span>
                                </div>
                            </div>
                        )}

                        {user.id && (
                            <div className="flex items-center gap-3 text-sm">
                                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <Fingerprint className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                                    <span className="text-xs text-muted-foreground font-medium">User ID</span>
                                    <span className="font-mono text-xs truncate bg-muted p-1 rounded w-fit max-w-full">{user.id}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="bg-muted/30 p-4 sm:justify-between items-center sm:flex-row flex-col-reverse gap-4">
                    <p className="text-xs text-muted-foreground hidden sm:block">
                        Logged in securely
                    </p>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        className="w-full sm:w-auto gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
