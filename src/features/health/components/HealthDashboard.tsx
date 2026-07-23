import ProductWidgetGrid from "@/components/platform/ProductWorkspace/ProductWidgetGrid";

import HealthOverview from "./HealthOverview";
import HealthAssistant from "./HealthAssistant";
import Appointments from "./Appointments";
import MedicalRecords from "./MedicalRecords";
import LabResults from "./LabResults";
import Medications from "./Medications";
import HealthInsights from "./HealthInsights";
import EmergencyProfile from "./EmergencyProfile";

export default function HealthDashboard() {
    return (
        <ProductWidgetGrid>
            <HealthOverview />
            <HealthAssistant />
            <Appointments />
            <MedicalRecords />
            <LabResults />
            <Medications />
            <HealthInsights />
            <EmergencyProfile />
        </ProductWidgetGrid>
    );
}