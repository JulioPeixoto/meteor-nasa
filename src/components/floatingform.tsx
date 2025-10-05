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

export default function FloatingForm() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)
  const [minDiameter, setMinDiameter] = useState<number | undefined>()
  const [minVelocity, setMinVelocity] = useState<number | undefined>()
  const [selectedAsteroid, setSelectedAsteroid] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAsteroidSelect = (asteroidData: any) => {
    console.log('Asteroide selecionado:', asteroidData)
    setSelectedAsteroid(asteroidData)
    setIsDialogOpen(false) 
  }

  return (
    <Card className="left-0">
      <CardHeader>
        <CardTitle>Choose your parameters</CardTitle>
        <CardDescription>
          Choose your parameters to see the impact of the asteroid on the Earth.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start mx-auto p-2">
          <CCalendar onRangeChange={setDateRange} />
        </div>

        <div className="flex items-start">
          <CFormFields 
            onMinDiameterChange={setMinDiameter}
            onMinVelocityChange={setMinVelocity}
          />
        </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!dateRange}>
                Search Asteroids
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Asteroids List</DialogTitle>
                <DialogDescription>
                  Choose the asteroid you want to see more details about and attack Earth
                </DialogDescription>
              </DialogHeader>
              <div className="-mx-6 max-h-[500px] overflow-y-auto px-6 text-sm">
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
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
  )
}