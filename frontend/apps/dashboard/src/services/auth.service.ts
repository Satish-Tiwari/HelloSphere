const API_URL = "/backend";

export interface SignupDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
}

export interface LoginDto {
    email?: string;
    password?: string;
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    email: string;
    otp: string;
    newPassword: string;
}

async function handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
        // Return full data object to let components handle array messages or specific error structures
        return Promise.reject(data);
    }
    return data;
}

export const authService = {
    login: async (credentials: LoginDto) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },

    signup: async (data: SignupDto) => {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    forgotPassword: async (data: ForgotPasswordDto) => {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    resetPassword: async (data: ResetPasswordDto) => {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
};
