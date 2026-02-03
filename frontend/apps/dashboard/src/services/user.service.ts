const API_URL = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:5000/api/v1";

export interface User {
    _id?: string;  // MongoDB ID
    id?: string;   // Alternative ID field
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    isEmailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

async function handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
        return Promise.reject(data);
    }
    return data;
}

export const userService = {
    getAllUsers: async (accessToken: string): Promise<User[]> => {
        try {
            const response = await fetch(`${API_URL}/user`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
            });

            const result = await handleResponse(response);
            return result;
        } catch (error) {
            throw error;
        }
    },

    getUserById: async (id: string, accessToken: string): Promise<User> => {
        const response = await fetch(`${API_URL}/user/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
        });
        return handleResponse(response);
    }
};
