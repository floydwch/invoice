import { cloneElement, useContext } from 'react'

import { AbstractRadioContext } from '../AbstractRadioGroup'

export default function AbstractRadio({ value, children }) {
  const context = useContext(AbstractRadioContext)
  return cloneElement(children, {
    checked: children.props.checked || value === context.value,
    onChange: function onChange() {
      context.onChange(value)
      children.props.onChange?.apply(this, arguments)
    },
  })
}
