import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  className?: string;
}

export function CustomPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  isLoading = false,
  onPageChange,
  showPageNumbers = true,
  className = "",
}: CustomPaginationProps) {
  // Calculate pagination display
  const renderPaginationItems = () => {
    if (!showPageNumbers) return null;

    const items = [];
    const maxPagesToShow = 5;

    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calculate start and end page numbers to display
    let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 2);

    // Adjust start if we're near the end
    if (totalPages > 2 && endPage < totalPages - 1) {
      if (currentPage > totalPages - Math.floor(maxPagesToShow / 2)) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 1);
        endPage = totalPages - 1;
      }
    }

    // Add ellipsis if needed at the beginning
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed at the end
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Don't render if there's only one page and no items info
  if (totalPages <= 1 && !totalItems) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-center ${className}`}
    >
      {totalItems && (
        <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{" "}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
        </div>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              aria-disabled={currentPage <= 1 || isLoading}
              className={
                currentPage <= 1 || isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>

          {renderPaginationItems()}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(currentPage + 1, totalPages))
              }
              aria-disabled={currentPage >= totalPages || isLoading}
              className={
                currentPage >= totalPages || isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
