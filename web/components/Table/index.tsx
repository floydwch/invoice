import { HTMLAttributes, ReactNode, useEffect, useState } from 'react'
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

  /* A placeholder to make carets can be clicked due to the marginal 1px spacing between the up and the down carets */
  &::after {
    position: relative;
    display: block;
    content: '';
    top: 0px;
    right: 5px;
    width: 10px;
    height: 6px;
  }
`

const StyledTable = styled(BSTable)`
  table-layout: fixed;
`

function useCaretDirection(
  onChange: (direction: string) => void,
  direction?: string
) {
  const [curDirection, toggle] = useState<string | null>(direction)
  const enhancedToggle = (direction?: string) => {
    if (!direction) {
      toggle(null)
      return
    }
    if (curDirection) {
      var nextDirection = curDirection === 'up' ? 'down' : 'up'
    } else {
      var nextDirection = direction
    }
    toggle(nextDirection)
    onChange(nextDirection)
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
  direction?: string
  onChange?: (direction: string) => any
}

function CaretToolbar({ checked, direction, onChange }: CaretToolbarProps) {
  const { direction: curDirection, toggle } = useCaretDirection(
    onChange,
    direction
  )

  useEffect(() => {
    if (!checked) {
      toggle()
    }
  }, [checked])

  return (
    <CaretToolbarContainer>
      <Caret
        activated={checked && curDirection === 'up'}
        onClickCapture={(e) => {
          e.stopPropagation()
          toggle('up')
        }}
      ></Caret>
      <Caret
        activated={checked && curDirection === 'down'}
        direction="down"
        onClickCapture={(e) => {
          e.stopPropagation()
          toggle('down')
        }}
      ></Caret>
    </CaretToolbarContainer>
  )
}

export interface RowInterface {
  id: string
  columns: Array<string | number>
}

export interface OrderByParams {
  orderBy?: string
  direction?: string
}

interface TableProps {
  headers: Array<string>
  rows?: Array<RowInterface>
  loading?: boolean
  loadingPlaceholder?: ReactNode
  orderBy?: OrderByParams
  onOrderBy?: (params: OrderByParams) => void
}

export default function Table({
  className,
  style,
  headers,
  rows,
  loading,
  loadingPlaceholder,
  orderBy,
  onOrderBy,
}: TableProps & HTMLAttributes<HTMLTableElement>) {
  const [curOrderBy, setOrderBy] = useState<OrderByParams>(orderBy)

  const headerElements = headers.map((title, i) => {
    const checked = title === curOrderBy.orderBy

    if (checked) {
      var direction = { ASC: 'up', DESC: 'down' }[orderBy.direction]
    }

    return (
      <th key={i}>
        {title}
        {orderBy && onOrderBy && (
          <AbstractRadio value={title}>
            <CaretToolbar
              onChange={(caretDirection) => {
                const direction = {
                  up: 'ASC',
                  down: 'DESC',
                }[caretDirection]

                if (
                  title !== curOrderBy.orderBy ||
                  direction !== curOrderBy.direction
                ) {
                  const nextState = {
                    orderBy: title,
                    direction,
                  }
                  setOrderBy(nextState)
                  onOrderBy(nextState)
                }
              }}
              checked={checked}
              direction={direction}
            />
          </AbstractRadio>
        )}
      </th>
    )
  })

  if (orderBy && onOrderBy) {
    var thead = (
      <thead>
        <tr>
          <AbstractRadioGroup value={orderBy.orderBy}>
            {headerElements}
          </AbstractRadioGroup>
        </tr>
      </thead>
    )
  } else {
    var thead = (
      <thead>
        <tr>{headerElements}</tr>
      </thead>
    )
  }

  if (!loading) {
    var tbody = (
      <tbody>
        {rows.map(({ id, columns }) => (
          <tr key={id}>
            {columns.map((column, i) => (
              <td key={i}>{column}</td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

  return (
    <>
      <StyledTable responsive className={className} style={style}>
        {thead}
        {tbody}
      </StyledTable>
      {loading && loadingPlaceholder}
    </>
  )
}
