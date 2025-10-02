'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type ContextType = {
  exampleState: string
  setExampleState: (value: string) => void
}

const ExampleContext = createContext<ContextType | undefined>(undefined)

export function ExampleProvider({ children }: { children: ReactNode }) {
  const [exampleState, setExampleState] = useState('defaultValue')

  return (
    <ExampleContext.Provider value={{ exampleState, setExampleState }}>
      {children}
    </ExampleContext.Provider>
  )
}

export function useExample() {
  const context = useContext(ExampleContext)
  if (context === undefined) {
    throw new Error('useExample must be used within an ExampleProvider')
  }
  return context
}
