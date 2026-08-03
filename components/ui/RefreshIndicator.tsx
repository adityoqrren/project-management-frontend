import { Loader2 } from "lucide-react";

interface RefreshIndicatorProps {
    loading: boolean;
}

export default function RefreshIndicator({
    loading,
}: RefreshIndicatorProps) {

    if (!loading) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin" />
            <span>Refreshing...</span>
        </div>
    );
}