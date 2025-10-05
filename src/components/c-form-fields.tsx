import { useTranslations } from 'next-intl'
import { Input } from "@/components/ui/input"

interface Props {
  onMinDiameterChange?: (value: number | undefined) => void
  onMinVelocityChange?: (value: number | undefined) => void
}

export default function CFormFields({ 
  onMinDiameterChange, 
  onMinVelocityChange 
}: Props) {
  const t = useTranslations('form')
  
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
        className="bg-white placeholder:text-gray-500 text-black" 
        type="number"
        step="0.01"
        min="0"
        placeholder={t('minimumDiameter')}
        onInput={handleNumericInput}
        onChange={handleDiameterChange}
      />
      <Input 
        className="bg-white placeholder:text-gray-500 text-black" 
        type="number"
        step="0.01"
        min="0"
        placeholder={t('minimumVelocity')}
        onInput={handleNumericInput}
        onChange={handleVelocityChange}
      />
    </div>
  )
}