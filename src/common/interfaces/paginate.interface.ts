import { Doc } from '../repos';

export interface IPaginate<T> {
  docs: Doc<T>[];
  currentPage?: number;
  size?: number;
  pages?: number;
}
