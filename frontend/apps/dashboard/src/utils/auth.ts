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
                    // 1. Login to get access token
                    const loginData = await authService.login({
                        email: credentials.email,
                        password: credentials.password,
                    }) as any;

                    if (loginData && loginData.access_token) {
                        const accessToken = loginData.access_token;

                        // 2. Fetch user profile using the token
                        try {
                            const profile = await authService.getProfile(accessToken);

                            // 3. Construct user session object
                            return {
                                id: profile.id,
                                name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.email,
                                email: profile.email,
                                accessToken: accessToken,
                                role: profile.role || "user", // Fallback role
                                phone: profile.phone,
                            };
                        } catch (profileError) {
                            console.error("Failed to fetch profile:", profileError);
                            return null;
                        }
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
                token.phone = user.phone;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.accessToken = token.accessToken as string;
                session.user.phone = token.phone as string;
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