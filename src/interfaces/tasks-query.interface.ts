export interface TasksQuery {
  status?: string;
  search?: string;
  page: number;
  limit: number;
}
