import type { Metadata } from "next";
import { DashboardLayout } from "../components/dashboard-layout";
import { DashboardHeader } from "../components/dashboard-header";
import { AllUsersContent } from "./components/all-users-content";

export const metadata: Metadata = {
    title: "All Users - Dashboard",
    description: "View and manage all registered users",
};

export default function UsersPage() {
    return (
        <DashboardLayout>
            <DashboardHeader />
            <main className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                </div>
                <div className="space-y-4">
                    <AllUsersContent />
                </div>
            </main>
        </DashboardLayout>
    );
}
