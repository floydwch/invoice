import { createContext, useState, PropsWithChildren } from 'react'

interface AbstractRadioContextInterface {
  value: string
  onChange: (value: string) => any
}

interface AbstractRadioGroupInterface {
  defaultValue?: string
}

type AbstractRadioContextType = AbstractRadioContextInterface | null

const AbstractRadioContext = createContext<AbstractRadioContextType>(null)

export default function AbstractRadioGroup({
  children,
  defaultValue,
}: PropsWithChildren<AbstractRadioGroupInterface>) {
  const [value, onChange] = useState(defaultValue)
  return (
    <AbstractRadioContext.Provider value={{ value, onChange }}>
      {children}
    </AbstractRadioContext.Provider>
  )
}

export { AbstractRadioContext }
