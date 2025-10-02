'use client'

import { useState, useEffect } from 'react'

export function useExampleHook(initialValue: any) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    // Example effect
  }, [value])

  return [value, setValue]
}
