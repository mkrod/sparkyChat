import React from 'react';
import "./css/pagination_control.css";

interface Props {
    total: number;
    unit: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const PaginationControl: React.FC<Props> = ({ total, unit, currentPage, onPageChange }): React.JSX.Element => {
    const totalPages = Math.ceil(total / unit);

    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 6;

        if (totalPages <= maxVisiblePages + 2) {
            // Show all pages if total pages are small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show the first page
            pages.push(1);

            if (currentPage > maxVisiblePages - 2) {
                pages.push("...");
            }

            const start = Math.max(2, currentPage - 2);
            const end = Math.min(totalPages - 1, currentPage + 2);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - (maxVisiblePages - 3)) {
                pages.push("...");
            }

            // Always show the last page
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <div className='pagination_control_container'>
            <button
                className='pagination_control'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Prev
            </button>

            <div className='pagination_controls_pages'>
                {generatePageNumbers().map((page, index) => (
                    typeof page === "number" ? (
                        <button
                            key={index}
                            className={`pagination_controls_page_number ${currentPage === page ? 'pagination_page_active' : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={index} className="pagination_controls_ellipsis">...</span>
                    )
                ))}
            </div>

            <button
                className='pagination_control'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default PaginationControl;