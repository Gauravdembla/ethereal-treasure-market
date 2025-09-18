import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  productsPerPage: number;
  onPageChange: (page: number) => void;
}

const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  totalPages,
  totalProducts,
  productsPerPage,
  onPageChange,
}) => {
  // Calculate the range of products being shown
  const startProduct = (currentPage - 1) * productsPerPage + 1;
  const endProduct = Math.min(currentPage * productsPerPage, totalProducts);

  // Generate page numbers to show (Amazon-style)
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7; // Show up to 7 page numbers

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Show pages 2, 3, 4, 5 and ellipsis
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show ellipsis and last 4 pages
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show ellipsis, current page area, ellipsis
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col items-center space-y-4 mt-8 mb-6">
      {/* Results Info */}
      <div className="text-sm text-angelic-deep/70">
        Showing <span className="font-semibold">{startProduct}</span> to{' '}
        <span className="font-semibold">{endProduct}</span> of{' '}
        <span className="font-semibold">{totalProducts}</span> results
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination className="w-full">
          <PaginationContent className="flex items-center justify-center gap-1">
            {/* Previous Button */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border
                  ${currentPage === 1
                    ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'text-angelic-deep bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </PaginationPrevious>
            </PaginationItem>

            {/* Page Numbers */}
            {pageNumbers.map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis className="px-3 py-2 text-gray-500" />
                ) : (
                  <PaginationLink
                    onClick={() => onPageChange(page as number)}
                    isActive={currentPage === page}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-md border cursor-pointer
                      ${currentPage === page
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'text-angelic-deep bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }
                    `}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Next Button */}
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border
                  ${currentPage === totalPages
                    ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'text-angelic-deep bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                  }
                `}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Mobile-friendly page info */}
      <div className="md:hidden text-xs text-angelic-deep/60">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default ProductPagination;
