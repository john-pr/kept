import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationRange } from "@/lib/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function PaginationControls({ currentPage, totalPages, basePath }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const range = getPaginationRange(currentPage, totalPages);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hasPrevious ? pageHref(basePath, currentPage - 1) : pageHref(basePath, 1)}
            disabled={!hasPrevious}
          />
        </PaginationItem>
        {range.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink href={pageHref(basePath, page)} isActive={page === currentPage}>
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href={hasNext ? pageHref(basePath, currentPage + 1) : pageHref(basePath, totalPages)}
            disabled={!hasNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
