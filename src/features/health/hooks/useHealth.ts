import {
    getAppointments,
    getHealthMetrics,
    getMedications,
} from "../services/health.service";

export function useHealth() {
    return {
        metrics: getHealthMetrics(),
        appointments: getAppointments(),
        medications: getMedications(),
    };
}