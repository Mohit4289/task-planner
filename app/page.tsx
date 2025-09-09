"use client"

import { useState } from "react"
import { CalendarView } from "@/components/calendar-view"
import { FilterPanel } from "@/components/filter-panel"
import { TaskModal } from "@/components/task-modal"
import { TaskDetailsPanel } from "@/components/task-details-panel"
import type { Task, TaskCategory } from "@/types/task"

export default function TaskPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date
    end: Date
  } | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState({
    categories: [] as TaskCategory[],
    timeRange: null as string | null,
    searchQuery: "",
  })

  const handleTaskCreate = (taskData: { name: string; category: TaskCategory; description?: string }) => {
    if (!selectedDateRange) return

    const newTask: Task = {
      id: Date.now().toString(),
      name: taskData.name,
      category: taskData.category,
      description: taskData.description,
      startDate: selectedDateRange.start,
      endDate: selectedDateRange.end,
      createdAt: new Date(),
    }

    setTasks((prev) => [...prev, newTask])
    setIsModalOpen(false)
    setSelectedDateRange(null)
  }

  const handleDateRangeSelect = (start: Date, end: Date) => {
    setSelectedDateRange({ start, end })
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task)))

    setIsModalOpen(false)
    setEditingTask(null)

    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date() } : null))
    }
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))

    if (selectedTask?.id === taskId) {
      setSelectedTask(null)
    }
  }

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setSelectedDateRange(null)
    setIsModalOpen(true)
  }

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Task Planner</h1>
          <p className="text-muted-foreground">
            Drag across days to create tasks, click tasks to edit, move and resize to reschedule
          </p>
        </header>

        <div className="flex gap-6">
          <div className="flex-1">
            <CalendarView
              tasks={tasks}
              filters={filters}
              onDateRangeSelect={handleDateRangeSelect}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskEdit={handleTaskEdit}
              onTaskSelect={handleTaskSelect}
            />
          </div>

          <div className="w-80 space-y-4">
            <FilterPanel filters={filters} onFiltersChange={setFilters} taskCount={tasks.length} tasks={tasks} />

            {selectedTask && (
              <TaskDetailsPanel
                task={selectedTask}
                onEdit={handleTaskEdit}
                onDelete={handleTaskDelete}
                onClose={() => setSelectedTask(null)}
              />
            )}
          </div>
        </div>

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedDateRange(null)
            setEditingTask(null)
          }}
          onSubmit={handleTaskCreate}
          onUpdate={handleTaskUpdate}
          dateRange={selectedDateRange}
          editingTask={editingTask}
        />
      </div>
    </div>
  )
}
