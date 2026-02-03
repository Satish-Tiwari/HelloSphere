import { Metadata } from "next";
import { DashboardLayout } from "@/app/components/dashboard-layout";
import { DashboardHeader } from "@/app/components/dashboard-header";
import { UserProfileContent } from "./components/user-profile-content";

export const metadata: Metadata = {
    title: "User Profile",
    description: "View user profile details",
};

interface UserProfilePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
    const { id } = await params;

    return (
        <DashboardLayout>
            <DashboardHeader />
            <div className="p-6">
                <UserProfileContent userId={id} />
            </div>
        </DashboardLayout>
    );
}
