import { WorkspaceShell } from "@/components/platform/Shell";

import HealthDashboard from "@/features/health/components/HealthDashboard";

export default function HealthPage() {
    return (
        <WorkspaceShell
            title="Aila Health"
            description="Enterprise Healthcare Intelligence Platform"
        >
            <HealthDashboard />
        </WorkspaceShell>
    );
}