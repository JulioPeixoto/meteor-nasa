'use client'
import { useState } from 'react'
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "@/components/ui/card"
import CCalendar from "@/components/c-calendar"
import CFormFields from "@/components/c-form-fields"
import AsteroidList from "@/components/AsteroidList"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FloatingFormProps {
    onAsteroidSelect: (asteroidData: any) => void;
    onDateRangeChange: (range: { start: string; end: string } | null) => void;
}

export default function FloatingForm({ onAsteroidSelect, onDateRangeChange }: FloatingFormProps) {
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [minDiameter, setMinDiameter] = useState<number | undefined>()
  const [minVelocity, setMinVelocity] = useState<number | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAsteroidSelect = (asteroidData: any) => {
    onAsteroidSelect(asteroidData)
    setIsDialogOpen(false) 
  }

  const handleRangeChange = (range: { start: string; end: string } | null) => {
    setDateRange(range);
    onDateRangeChange(range); 
  };

  return (
    <Card className="left-0 w-full">
      <CardHeader>
        <CardTitle>Choose your parameters</CardTitle>
        <CardDescription>
          Choose your parameters to see the impact of the asteroid on the Earth.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="w-full overflow-x-auto">
          <div className="min-w-fit">
            <CCalendar onRangeChange={handleRangeChange} />
          </div>
        </div>

        <div className="w-full">
          <CFormFields 
            onMinDiameterChange={setMinDiameter}
            onMinVelocityChange={setMinVelocity}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!dateRange} className="w-full">
              Search Asteroids
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-w-[95vw]">
            <DialogHeader>
              <DialogTitle>Asteroids List</DialogTitle>
              <DialogDescription>
                Choose the asteroid you want to see more details about
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[50vh] sm:max-h-[500px] overflow-y-auto px-2">
              {dateRange && (
                <AsteroidList 
                  startDate={dateRange.start} 
                  endDate={dateRange.end}
                  minDiameter={minDiameter}
                  minVelocity={minVelocity}
                  onSelectAsteroid={handleAsteroidSelect}
                />
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full sm:w-auto">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}