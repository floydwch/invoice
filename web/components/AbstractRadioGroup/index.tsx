import { createContext, useState, PropsWithChildren } from 'react'

interface AbstractRadioContextInterface {
  value: string
  onChange: (value: string) => any
}

interface AbstractRadioGroupProps {
  value?: string
  onChange?: (value: string) => void
}

type AbstractRadioContextType = AbstractRadioContextInterface | null

const AbstractRadioContext = createContext<AbstractRadioContextType>(null)

export default function AbstractRadioGroup({
  children,
  value,
  onChange,
}: PropsWithChildren<AbstractRadioGroupProps>) {
  const [curValue, setValue] = useState(value)
  return (
    <AbstractRadioContext.Provider
      value={{
        value: curValue,
        onChange: (value) => {
          setValue(value)
          if (onChange) {
            onChange(value)
          }
        },
      }}
    >
      {children}
    </AbstractRadioContext.Provider>
  )
}

export { AbstractRadioContext }
