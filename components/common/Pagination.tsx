import { ApiPagination } from "@/lib/task";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const createEmptyPagination = (limit = 5): ApiPagination => ({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: limit,
    hasPrev: false,
    hasNext: false,
});

const PAGE_SIZE_OPTIONS = [
    5,
    10,
    20,
    50,
    100,
];

function getVisiblePages(
    currentPage: number,
    totalPages: number
): (number | "...")[] {
    if (totalPages <= 7) {
        return Array.from(
            { length: totalPages },
            (_, index) => index + 1
        );
    }

    // Near the beginning
    if (currentPage <= 4) {
        return [
            1,
            2,
            3,
            4,
            5,
            "...",
            totalPages,
        ];
    }

    // Near the end
    if (currentPage >= totalPages - 3) {
        return [
            1,
            "...",
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    // Middle
    return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
    ];
}

interface PaginationProps {
    pagination: ApiPagination;
    disabled?: boolean;

    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export default function Pagination({
    pagination,
    disabled = false,
    onPageChange,
    onLimitChange,
}: PaginationProps) {

    const {
        page,
        limit,
        total,
        totalPages,
        hasPrev,
        hasNext,
    } = pagination;

    const visiblePages = getVisiblePages(
        page,
        totalPages
    );

    const startItem =
        total === 0
            ? 0
            : (page - 1) * limit + 1;

    const endItem = Math.min(
        page * limit,
        total
    );

    const handleLimitChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const newLimit = Number(event.target.value);

        onLimitChange(newLimit);
        onPageChange(1);
    };

    const handlePreviousPage = () => {
        if (hasPrev) {
            onPageChange(page - 1);
        }
    };

    const handleNextPage = () => {
        if (hasNext) {
            onPageChange(page + 1);
        }
    };

    return (
        <div
            className="
        flex
        flex-col
        gap-4
        border-t
        bg-white
        px-4
        py-3
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
        >
            <p className="text-sm text-gray-500">
                Showing {startItem}–{endItem} of {total}
            </p>

            <div className="flex items-center gap-6">

                <div className="flex items-center gap-2">

                    <span className="text-sm text-gray-500">
                        Rows per page
                    </span>

                    <select
                        value={limit}
                        disabled={disabled}
                        onChange={handleLimitChange}
                        className="
              rounded-md
              border
              px-2
              py-1
              text-sm
            "
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option
                                key={size}
                                value={size}
                            >
                                {size}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        disabled={disabled || !hasPrev}
                        onClick={handlePreviousPage}
                        className="
              flex
              items-center
              gap-1
              rounded-md
              border
              px-3
              py-1.5
              text-sm
              transition-colors
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>

                    <div className="flex items-center gap-1">

                        {visiblePages.map((item, index) => {

                            if (item === "...") {
                                return (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="
            flex
            h-9
            w-9
            items-center
            justify-center
            text-gray-400
          "
                                    >
                                        ...
                                    </span>
                                );
                            }

                            const isActive =
                                item === page;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        onPageChange(item)
                                    }
                                    className={`
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-md
          border
          text-sm
          transition-colors
          ${isActive
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-200 hover:bg-gray-100"
                                        }
        `}
                                >
                                    {item}
                                </button>
                            );
                        })}

                    </div>

                    <button
                        type="button"
                        disabled={disabled || !hasNext}
                        onClick={handleNextPage}
                        className="
              flex
              items-center
              gap-1
              rounded-md
              border
              px-3
              py-1.5
              text-sm
              transition-colors
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>

                </div>

            </div>

        </div>
    );
}