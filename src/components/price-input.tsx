'use client'

import { useState } from 'react'
import { Input } from './ui/input'

export function PriceInput({ defaultValue = '0' }: { defaultValue?: string }) {
  const [actualValue, setActualValue] = useState(defaultValue)
  const [displayValue, setDisplayValue] = useState(
    defaultValue !== '0' && defaultValue ? new Intl.NumberFormat('es-AR').format(parseInt(defaultValue)) : ''
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digits
    const digits = e.target.value.replace(/\D/g, '')
    setActualValue(digits || '0')
    
    // Format with dots (thousands separator)
    if (digits) {
      setDisplayValue(new Intl.NumberFormat('es-AR').format(parseInt(digits)))
    } else {
      setDisplayValue('')
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-3 font-semibold text-muted-foreground">$</span>
      <input type="hidden" name="price" value={actualValue} />
      <Input 
        type="text" 
        value={displayValue} 
        onChange={handleChange} 
        placeholder="0" 
        className="h-11 pl-7 font-bold text-lg" 
      />
    </div>
  )
}
