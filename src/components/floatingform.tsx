'use client'
import { useState } from 'react'
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "@/components/ui/card"
import CCalendar from "@/components/c-calendar"
import CFormFields from "@/components/c-form-fields"
import AsteroidList from "@/components/AsteroidList"
import { Button } from "@/components/ui/button"
import { CSlider } from "@/components/c-slider"

export default function FloatingForm() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)
  const [minDiameter, setMinDiameter] = useState<number | undefined>()
  const [minVelocity, setMinVelocity] = useState<number | undefined>()
  
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
        <div className="flex items-start mx-auto p-2">
          <CCalendar onRangeChange={setDateRange} />
        </div>

        <div className="flex items-start">
          <CFormFields 
            onMinDiameterChange={setMinDiameter}
            onMinVelocityChange={setMinVelocity}
          />
        </div>
        
        <CSlider />

        <Button>
          ATTACK!
        </Button>

        {dateRange && (
          <AsteroidList 
            startDate={dateRange.start} 
            endDate={dateRange.end}
            minDiameter={minDiameter}
            minVelocity={minVelocity}
          />
        )}
      </CardContent>
    </Card>
  )
}