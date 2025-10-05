'use client'

import { useState } from 'react'
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "@/components/ui/card"
import CCalendar from "@/components/c-calendar"
import CFormFields from "@/components/c-form-fields"
import AsteroidList from "@/components/AsteroidList"

export default function FloatingForm() {
  // Estado que guarda o intervalo de datas
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)

  return (
    <Card className="left-0">
      <CardHeader>
        <CardTitle>Choose your parameters</CardTitle>
        <CardDescription>
          Choose your parameters to see the impact of the asteroid on the Earth.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Calendário */}
        <div className="flex items-start p-2">
          <CCalendar onRangeChange={setDateRange} />
        </div>

        {/* Campos adicionais */}
        <div className="flex items-start">
          <CFormFields />
        </div>

        {/* Card de asteroides */}
        {dateRange && <AsteroidList startDate={dateRange.start} endDate={dateRange.end} />}
      </CardContent>
    </Card>
  )
}
