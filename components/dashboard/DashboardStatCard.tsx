interface DashboardStatCardProps {
    title: string;
    description?: string;
    value: number;
    icon: React.ReactNode;
    valueClassName?: string;
    iconClassName?: string;
    onClick?: () => void;
}

export default function DashboardStatCard({
    title,
    description,
    value,
    icon,
    valueClassName = "mt-2 text-3xl font-bold text-gray-900",
    iconClassName = "text-gray-400",
    onClick
}: DashboardStatCardProps) {
    return (
        <div
        onClick={onClick}
        className={`rounded-lg border bg-white p-5 ${onClick
            ? "cursor-pointer transition-colors hover:bg-gray-200"
            : ""
            }`}>
            <div className="flex items-start justify-between">

                <div className="flex-1">

                    <p className="text-sm font-medium text-gray-700">
                        {title}
                    </p>

                    <p className="mt-1 h-4 text-xs text-gray-500">
                        {description ?? "\u00A0"}
                    </p>

                    <p className={valueClassName}>
                        {value}
                    </p>

                </div>

                <div className={iconClassName}>
                    {icon}
                </div>

            </div>
        </div>
    );
}