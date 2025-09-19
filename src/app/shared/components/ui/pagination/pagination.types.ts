export interface PaginationData {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationEvents {
  onPageChange: (page: number) => void;
}