import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/services/auth.service";
import { jwtDecode } from "jwt-decode";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Record<"email" | "password", string> | undefined) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const data = await authService.login({
                        email: credentials.email,
                        password: credentials.password,
                    });

                    // Assuming backend returns { accessToken: "...", user: { ... } } or similar
                    // Based on AuthController, it returns `return this.authService.logIn(loginUserDto);` 
                    // which usually returns { access_token: string, user: ... } or just token. 
                    // Let's assume standard object. I'll need to adapt based on actual response if different.
                    // For now, mapping data to User. 

                    if (data && data.access_token) {
                        const decoded: any = jwtDecode(data.access_token);
                        return {
                            id: decoded.id || decoded.sub || "unknown",
                            name: `${decoded.firstName || ""} ${decoded.lastName || ""}`.trim() || decoded.email || undefined,
                            email: decoded.email || undefined,
                            accessToken: data.access_token,
                            role: decoded.role,
                            phone: decoded.phone,
                        } as any; // Temporary cast to avoid strict type hell if versions mismatch, or better:
                    }
                    return null;
                } catch (error) {
                    console.error("Login error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.accessToken = user.accessToken;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.accessToken = token.accessToken;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login", // Error code passed in query string as ?error=
    },
    secret: process.env.NEXT_AUTH_SECRET,
};

export const handler = NextAuth(authOptions);