'use client'

import { DateRange } from 'react-day-picker'
import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'

interface CCalendarProps {
  onRangeChange?: (range: { start: string; end: string }) => void
}

export default function CCalendar({ onRangeChange }: CCalendarProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range)

    if (range?.from && range?.to) {
      const start = range.from.toISOString().split('T')[0]
      const end = range.to.toISOString().split('T')[0]
      onRangeChange?.({ start, end }) // 🔹 envia pro pai
    }
  }

  return (
    <Calendar
      mode="range"
      max={7}
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={handleSelect}
      numberOfMonths={1}
    />
  )
}
