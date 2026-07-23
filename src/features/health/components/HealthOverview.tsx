export default function HealthOverview() {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-xl font-semibold">
                Health Overview
            </h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-neutral-400">
                        Heart Rate
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                        72 BPM
                    </h3>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-neutral-400">
                        Blood Pressure
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                        120/80
                    </h3>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-neutral-400">
                        Weight
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                        -- kg
                    </h3>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-neutral-400">
                        BMI
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                        --
                    </h3>
                </div>
            </div>
        </div>
    );
}