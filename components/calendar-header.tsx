"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarHeaderProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold text-foreground">{format(currentDate, "MMMM yyyy")}</h2>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrevMonth} className="h-8 w-8 p-0 bg-transparent">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={onNextMonth} className="h-8 w-8 p-0 bg-transparent">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
