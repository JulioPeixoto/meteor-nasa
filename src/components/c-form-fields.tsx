import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CSlider } from "@/components/c-slider"

export default function CFormFields() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Input  
        placeholder="Tipo da superfície"
      />
      <Input 
        placeholder="Input 2"
      />
      <Input 
        placeholder="Input 3"
      />

      <CSlider />

      <Button>
        ATTACK!
      </Button>

    </div>
  )
}  