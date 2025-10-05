import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CSlider } from "@/components/c-slider"

export default function CFormFields() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Input
        className="bg-white placeholder:text-gray-500"  
        placeholder="Tipo da superfície"
      />
      <Input
        className="bg-white placeholder:text-gray-500" 
        placeholder="Input 2"
      />
      <Input
        className="bg-white placeholder:text-gray-500" 
        placeholder="Input 3"
      />

      <CSlider />

      <Button>
        ATTACK!
      </Button>

    </div>
  )
}  