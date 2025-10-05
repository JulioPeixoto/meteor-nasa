"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "rounded-base! border-2 border-border bg-main p-3 font-heading shadow-shadow w-full max-w-full",
          className,
        )}
        classNames={{
          months: "flex flex-col sm:flex-row justify-center gap-2 w-full",
          month: "flex flex-col gap-4 w-full",
          caption:
            "flex justify-center pt-1 relative items-center w-full text-main-foreground",
          caption_label: "text-sm sm:text-base font-heading truncate",
          nav: "gap-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "noShadow" }),
            "size-7 bg-transparent p-0"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "flex justify-between",
          head_cell:
            "text-main-foreground flex-1 text-center rounded-base font-base text-[0.75rem] sm:text-[0.85rem]",
          row: "flex w-full justify-between mt-1 sm:mt-2",
          cell: cn(
            "flex-1 relative text-center focus-within:z-20 min-w-[2rem] sm:min-w-[2.25rem]",
            "[&:has([aria-selected])]:bg-black/70 [&:has([aria-selected])]:text-white!",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-base [&:has(>.day-range-start)]:rounded-l-base"
              : "[&:has([aria-selected])]:rounded-base"
          ),
          day: cn(
            buttonVariants({ variant: "noShadow" }),
            "w-full aspect-square p-0 text-sm sm:text-base aria-selected:opacity-100"
          ),
          day_selected: "bg-black! text-white! rounded-base",
          day_today: "bg-secondary-background text-foreground!",
          day_outside: "opacity-40",
          day_disabled: "opacity-40",
          ...classNames,
        }}
        components={{
          IconLeft: ({ className, ...props }) => (
            <ChevronLeft className={cn("size-4", className)} {...props} />
          ),
          IconRight: ({ className, ...props }) => (
            <ChevronRight className={cn("size-4", className)} {...props} />
          ),
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
