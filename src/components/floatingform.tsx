import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "@/components/ui/card"
import CCalendar from "@/components/c-calendar"
import CFormFields from "@/components/c-form-fields"


export default function FloatingForm() {
  return (
    <Card className=" left-0">
      <CardHeader>
        <CardTitle>Choose your parameters</CardTitle>  
        <CardDescription>Choose your parameters to see the impact of the asteroid on the Earth.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start p-2">
          <CCalendar />
        </div>

        <div className="flex items-start">
          <CFormFields />
        </div>
      </CardContent>
    </Card>
  )
}