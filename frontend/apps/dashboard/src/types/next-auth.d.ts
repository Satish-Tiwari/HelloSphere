import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        accessToken?: string;
        role?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    }

    interface Session {
        user: User;
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        accessToken?: string;
        role?: string;
    }
}
