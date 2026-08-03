interface DangerZoneCardProps {
    onDelete: () => void;
    loading?: boolean;
}
export default function DangerZoneCard({
    onDelete,
    loading = false,
}: DangerZoneCardProps) {
    return (
        <section className="border border-red-200 rounded-xl p-6">

            <h2 className="text-lg font-semibold text-red-600">
                Danger Zone
            </h2>

            <p className="mt-2 text-sm text-gray-500">
                Deleting this project removes it from your active projects.
                You can restore it later from Deleted Projects.
            </p>

            <button
                onClick={onDelete}
                disabled={loading}
                className="
          mt-6
          px-4
          py-2
          rounded-md
          bg-red-500
          text-white
          hover:bg-red-600
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
            >
                {loading ? "Deleting..." : "Delete Project"}
            </button>

        </section>
    );
}