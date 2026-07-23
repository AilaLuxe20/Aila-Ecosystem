export interface HealthMetric {
    id: string;
    title: string;
    value: string;
    status: "good" | "warning" | "critical";
}

export interface Appointment {
    id: string;
    doctor: string;
    specialty: string;
    date: string;
    time: string;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
}