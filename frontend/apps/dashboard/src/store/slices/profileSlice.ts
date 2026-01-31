import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    isActive?: boolean;
}

interface ProfileState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: ProfileState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfile(state, action: PayloadAction<UserProfile>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        clearProfile(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
    },
});

export const { setProfile, clearProfile, setLoading } = profileSlice.actions;
export default profileSlice.reducer;
