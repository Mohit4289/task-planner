"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Task, TaskCategory } from "@/types/task"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format, differenceInDays } from "date-fns"
import { Calendar, Clock, Tag } from "lucide-react"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; category: TaskCategory; description?: string }) => void
  dateRange: { start: Date; end: Date } | null
  editingTask?: Task | null
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
}

const CATEGORIES: TaskCategory[] = ["To Do", "In Progress", "Review", "Completed"]

const CATEGORY_DESCRIPTIONS = {
  "To Do": "Tasks that are planned but not yet started",
  "In Progress": "Tasks currently being worked on",
  Review: "Tasks completed and awaiting review",
  Completed: "Tasks that are fully finished",
}

const CATEGORY_COLORS = {
  "To Do": "bg-chart-1",
  "In Progress": "bg-chart-2",
  Review: "bg-chart-3",
  Completed: "bg-chart-4",
}

export function TaskModal({ isOpen, onClose, onSubmit, dateRange, editingTask, onUpdate }: TaskModalProps) {
  const [taskName, setTaskName] = useState("")
  const [category, setCategory] = useState<TaskCategory>("To Do")
  const [description, setDescription] = useState("")

  const isEditing = !!editingTask

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTaskName(editingTask.name)
        setCategory(editingTask.category)
        setDescription(editingTask.description || "")
      } else {
        setTaskName("")
        setCategory("To Do")
        setDescription("")
      }
    }
  }, [isOpen, editingTask])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim()) return

    if (isEditing && editingTask && onUpdate) {
      onUpdate(editingTask.id, {
        name: taskName.trim(),
        category,
        description: description.trim() || undefined,
      })
    } else {
      onSubmit({
        name: taskName.trim(),
        category,
        description: description.trim() || undefined,
      })
    }
  }

  const duration = dateRange ? differenceInDays(dateRange.end, dateRange.start) + 1 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        {(dateRange || editingTask) && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4" />
              {isEditing ? "Current Schedule:" : "Selected Date Range:"}
            </div>

            {dateRange && (
              <>
                <p className="text-sm text-muted-foreground">
                  {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d, yyyy")}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Duration: {duration} day{duration !== 1 ? "s" : ""}
                  </span>
                </div>
              </>
            )}

            {editingTask && (
              <>
                <p className="text-sm text-muted-foreground">
                  {format(editingTask.startDate, "MMM d")} - {format(editingTask.endDate, "MMM d, yyyy")}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Duration: {differenceInDays(editingTask.endDate, editingTask.startDate) + 1} day
                    {differenceInDays(editingTask.endDate, editingTask.startDate) !== 0 ? "s" : ""}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              placeholder="Enter task name..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              autoFocus={!isEditing}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as TaskCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat]}`} />
                      <span>{cat}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">{CATEGORY_DESCRIPTIONS[category]}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add task details, notes, or requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!taskName.trim()}>
              {isEditing ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
