interface PasswordStrengthProps {
    password: string;
}

export default function PasswordStrength({
    password,
}: PasswordStrengthProps) {
    const calculateStrength = () => {
        let score = 0;

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        return score;
    };

    const score = calculateStrength();

    const labels = [
        "Very Weak",
        "Weak",
        "Fair",
        "Good",
        "Strong",
        "Excellent",
    ];

    return (
        <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                    style={{
                        width: `${(score / 5) * 100}%`,
                    }}
                />
            </div>

            <p className="text-xs text-white/60">
                Strength: {labels[score]}
            </p>
        </div>
    );
}