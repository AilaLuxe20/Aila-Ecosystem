const appointments = [
    {
        doctor: "Dr. Sarah Johnson",
        date: "28 Jul 2026",
        time: "10:00 AM",
    },
];

export default function Appointments() {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">
                Upcoming Appointments
            </h2>

            {appointments.map((appointment) => (
                <div
                    key={`${appointment.doctor}-${appointment.date}`}
                    className="rounded-2xl bg-white/5 p-4"
                >
                    <h3 className="font-semibold">
                        {appointment.doctor}
                    </h3>

                    <p className="text-neutral-400">
                        {appointment.date}
                    </p>

                    <p className="text-neutral-400">
                        {appointment.time}
                    </p>
                </div>
            ))}
        </div>
    );
}