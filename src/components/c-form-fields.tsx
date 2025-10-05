import { Input } from "@/components/ui/input"
import { CSlider } from "./c-slider"
import { Button } from "./ui/button"

interface Props {
  onMinDiameterChange?: (value: number | undefined) => void
  onMinVelocityChange?: (value: number | undefined) => void
}

export default function CFormFields({ 
  onMinDiameterChange, 
  onMinVelocityChange 
}: Props) {
  const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9.]/g, '')
    
    const parts = e.currentTarget.value.split('.')
    if (parts.length > 2) {
      e.currentTarget.value = parts[0] + '.' + parts.slice(1).join('')
    }
  }

  const handleDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onMinDiameterChange?.(value ? parseFloat(value) : undefined)
  }

  const handleVelocityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onMinVelocityChange?.(value ? parseFloat(value) : undefined)
  }

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
    </div>
  )
}