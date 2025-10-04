"use client"

import { DateRange } from "react-day-picker"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export default function CalendarRangeDemo() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  return (
    <Calendar
      mode="range"
      max={7}
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={setDateRange}
      numberOfMonths={1}
    />
  )
}
