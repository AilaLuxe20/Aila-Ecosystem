import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeHero from "@/components/dashboard/WelcomeHero";
import StatsGrid from "@/components/dashboard/StatsGrid";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ProductCards from "@/components/dashboard/ProductCards";

export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-[#050816]">
            <DashboardHeader />

            <div className="mx-auto max-w-7xl space-y-8 px-8 py-8">
                <WelcomeHero />

                <StatsGrid />

                <QuickActions />

                <RecentActivity />

                <ProductCards />
            </div>
        </main>
    );
}