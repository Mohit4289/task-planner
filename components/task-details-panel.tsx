"use client"

import type { Task } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays } from "date-fns"
import { Edit, Trash2, X, Calendar, Clock, FileText, Tag } from "lucide-react"

interface TaskDetailsPanelProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onClose: () => void
}

const CATEGORY_COLORS = {
  "To Do": "bg-chart-1 text-white",
  "In Progress": "bg-chart-2 text-white",
  Review: "bg-chart-3 text-white",
  Completed: "bg-chart-4 text-white",
}

export function TaskDetailsPanel({ task, onEdit, onDelete, onClose }: TaskDetailsPanelProps) {
  const duration = differenceInDays(task.endDate, task.startDate) + 1

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{task.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Badge className={CATEGORY_COLORS[task.category]} variant="secondary">
          <Tag className="h-3 w-3 mr-1" />
          {task.category}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Schedule Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Schedule</span>
          </div>
          <p className="text-sm text-muted-foreground pl-6">
            {format(task.startDate, "MMM d")} - {format(task.endDate, "MMM d, yyyy")}
          </p>
          <div className="flex items-center gap-2 text-sm pl-6">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {duration} day{duration !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Description</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-2 border-t space-y-1">
          <p className="text-xs text-muted-foreground">Created: {format(task.createdAt, "MMM d, yyyy 'at' h:mm a")}</p>
          {task.updatedAt && (
            <p className="text-xs text-muted-foreground">
              Updated: {format(task.updatedAt, "MMM d, yyyy 'at' h:mm a")}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(task)} className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
