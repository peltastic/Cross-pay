import { TransactionModel } from '../../core/models/transactions.model';

export interface TransactionStateModel {
  transactions: TransactionModel[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  isFetching: boolean;
  fetchError: string | null;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export const initialState: TransactionStateModel = {
  transactions: [],
  totalCount: 0,
  currentPage: 0,
  pageSize: 20,
  hasMore: false,
  isFetching: false,
  fetchError: null,
  isLoadingMore: false,
  loadMoreError: null,
  sortBy: 'createdAt',
  sortDirection: 'desc',
};
