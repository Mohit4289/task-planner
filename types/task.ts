export type TaskCategory = "To Do" | "In Progress" | "Review" | "Completed"

export interface Task {
  id: string
  name: string
  category: TaskCategory
  startDate: Date
  endDate: Date
  createdAt: Date
  description?: string
  updatedAt?: Date
}

export interface TaskFilters {
  categories: TaskCategory[]
  timeRange: string | null
  searchQuery: string
}
