"use client"

import { useState } from "react"
import type { Task, TaskCategory, TaskFilters } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, BarChart3, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface FilterPanelProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  taskCount: number
  tasks: Task[]
}

const CATEGORIES: TaskCategory[] = ["To Do", "In Progress", "Review", "Completed"]

const TIME_RANGES = [
  { value: "1week", label: "Tasks within 1 week" },
  { value: "2weeks", label: "Tasks within 2 weeks" },
  { value: "3weeks", label: "Tasks within 3 weeks" },
]

const CATEGORY_COLORS = {
  "To Do": "bg-chart-1",
  "In Progress": "bg-chart-2",
  Review: "bg-chart-3",
  Completed: "bg-chart-4",
}

export function FilterPanel({ filters, onFiltersChange, taskCount, tasks }: FilterPanelProps) {
  const [isStatsOpen, setIsStatsOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: value,
    })
  }

  const handleCategoryToggle = (category: TaskCategory, checked: boolean) => {
    const newCategories = checked ? [...filters.categories, category] : filters.categories.filter((c) => c !== category)

    onFiltersChange({
      ...filters,
      categories: newCategories,
    })
  }

  const handleTimeRangeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      timeRange: value === filters.timeRange ? null : value,
    })
  }

  const handleClearSearch = () => {
    onFiltersChange({
      ...filters,
      searchQuery: "",
    })
  }

  const handleClearCategories = () => {
    onFiltersChange({
      ...filters,
      categories: [],
    })
  }

  const handleClearTimeRange = () => {
    onFiltersChange({
      ...filters,
      timeRange: null,
    })
  }

  const categoryStats = CATEGORIES.map((category) => ({
    category,
    count: tasks.filter((task) => task.category === category).length,
    filteredCount: tasks.filter((task) => {
      if (filters.categories.length > 0 && !filters.categories.includes(task.category)) return false
      if (filters.searchQuery && !task.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
      if (filters.timeRange) {
        const now = new Date()
        const taskStart = task.startDate
        const daysDiff = Math.ceil((taskStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        switch (filters.timeRange) {
          case "1week":
            if (daysDiff > 7) return false
            break
          case "2weeks":
            if (daysDiff > 14) return false
            break
          case "3weeks":
            if (daysDiff > 21) return false
            break
        }
      }
      return task.category === category
    }).length,
  }))

  const activeFiltersCount =
    (filters.categories.length > 0 ? 1 : 0) + (filters.timeRange ? 1 : 0) + (filters.searchQuery ? 1 : 0)

  const filteredTaskCount = tasks.filter((task) => {
    if (filters.categories.length > 0 && !filters.categories.includes(task.category)) return false
    if (filters.searchQuery && !task.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
    if (filters.timeRange) {
      const now = new Date()
      const taskStart = task.startDate
      const daysDiff = Math.ceil((taskStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 1000 * 60 * 24))
      switch (filters.timeRange) {
        case "1week":
          if (daysDiff > 7) return false
          break
        case "2weeks":
          if (daysDiff > 14) return false
          break
        case "3weeks":
          if (daysDiff > 21) return false
          break
      }
    }
    return true
  }).length

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredTaskCount} of {taskCount} tasks shown
          </p>
          <Button variant="ghost" size="sm" onClick={() => setIsStatsOpen(!isStatsOpen)} className="h-6 px-2 text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            Stats
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="search" className="text-sm font-medium">
              Search Tasks
            </Label>
            {filters.searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by task name or description..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {filters.searchQuery && (
            <p className="text-xs text-muted-foreground">
              Found {filteredTaskCount} task{filteredTaskCount !== 1 ? "s" : ""} matching "{filters.searchQuery}"
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Categories</Label>
            {filters.categories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCategories}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {CATEGORIES.map((category) => {
              const stats = categoryStats.find((s) => s.category === category)
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category]}`} />
                      <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stats?.filteredCount || 0}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Time Range</Label>
            {filters.timeRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearTimeRange}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <RadioGroup value={filters.timeRange || ""} onValueChange={handleTimeRangeChange}>
            {TIME_RANGES.map((range) => (
              <div key={range.value} className="flex items-center space-x-2">
                <RadioGroupItem value={range.value} id={range.value} />
                <Label htmlFor={range.value} className="text-sm font-normal cursor-pointer flex-1">
                  {range.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">Task Statistics</span>
              <BarChart3 className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 p-2 rounded">
                <div className="font-medium">Total Tasks</div>
                <div className="text-lg font-bold text-primary">{taskCount}</div>
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <div className="font-medium">Filtered</div>
                <div className="text-lg font-bold text-secondary">{filteredTaskCount}</div>
              </div>
            </div>
            <div className="space-y-1">
              {categoryStats.map(({ category, count }) => (
                <div key={category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[category]}`} />
                    <span>{category}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Clear All Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onFiltersChange({
                categories: [],
                timeRange: null,
                searchQuery: "",
              })
            }
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear all filters ({activeFiltersCount})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
