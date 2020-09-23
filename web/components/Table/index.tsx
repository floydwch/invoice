import { useState } from 'react'
import styled from 'styled-components'
import BSTable from 'react-bootstrap/Table'

import AbstractRadioGroup from '../AbstractRadioGroup'
import AbstractRadio from '../AbstractRadio'

interface CaretProps {
  activated?: boolean
  direction?: string
}

const Caret = styled.div<CaretProps>`
  width: 0;
  height: 0;
  margin: 1px 8px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid ${({ activated }) => (activated ? '#222' : '#bbb')};
  vertical-align: middle;
  cursor: pointer;
  transform: ${({ direction }) =>
    direction === 'down' ? 'rotate(180deg)' : 'rotate(0)'};
`

function useCaretDirection(beforeChange: () => void) {
  const [curDirection, toggle] = useState<string | null>()
  const enhancedToggle = (direction?: string) => {
    beforeChange()
    if (curDirection) {
      toggle(curDirection === 'up' ? 'down' : 'up')
    } else {
      toggle(direction || 'up')
    }
  }
  return {
    direction: curDirection,
    toggle: enhancedToggle,
  }
}

const CaretToolbarContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  height: 24px;
  vertical-align: top;
  cursor: pointer;
`

interface CaretToolbarProps {
  checked?: boolean
  onChange?: (args?: any) => any
}

function CaretToolbar({ checked, onChange }: CaretToolbarProps) {
  const { direction, toggle } = useCaretDirection(onChange)
  return (
    <CaretToolbarContainer
      onClick={() => {
        toggle()
      }}
    >
      <Caret
        activated={checked && direction === 'up'}
        onClickCapture={(e) => {
          e.stopPropagation()
          toggle('up')
        }}
      ></Caret>
      <Caret
        activated={checked && direction === 'down'}
        direction="down"
        onClickCapture={(e) => {
          e.stopPropagation()
          toggle('down')
        }}
      ></Caret>
    </CaretToolbarContainer>
  )
}

interface RowInterface {
  id: string
  columns: Array<string | number>
}

interface TableProps {
  headers?: Array<string>
  rows?: Array<RowInterface>
}

export default function Table({ headers, rows }: TableProps) {
  const headerElements = headers.map((title, i) => (
    <th key={i}>
      {title}
      <AbstractRadio value={title}>
        <CaretToolbar />
      </AbstractRadio>
    </th>
  ))

  const rowElements = rows.map(({ id, columns }) => (
    <tr key={id}>
      {columns.map((column, i) => (
        <td key={i}>{column}</td>
      ))}
    </tr>
  ))

  return (
    <BSTable responsive>
      <thead>
        <tr>
          <AbstractRadioGroup>{headerElements}</AbstractRadioGroup>
        </tr>
      </thead>
      <tbody>{rowElements}</tbody>
    </BSTable>
  )
}
