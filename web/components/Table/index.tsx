import { HTMLAttributes, ReactNode, useEffect, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import BSTable from 'react-bootstrap/Table'

const GlobalStyle = createGlobalStyle`
  .table-responsive {
    min-height: 100%;
  }
`

const StyledTable = styled(BSTable)`
  table-layout: fixed;
`

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
  const { toggle } = useCaretDirection(onChange, direction)

  useEffect(() => {
    if (!checked) {
      toggle()
    }
  }, [checked])

  return (
    <CaretToolbarContainer>
      <Caret
        activated={checked && direction === 'up'}
        onClick={(e) => {
          e.stopPropagation()
          toggle('up')
        }}
      ></Caret>
      <Caret
        activated={checked && direction === 'down'}
        direction="down"
        onClick={(e) => {
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

export interface OrderBy {
  field?: string
  direction?: string
}

interface TableProps {
  headers: Array<string>
  rows?: Array<RowInterface>
  emptyPlaceholder?: ReactNode
  loading?: boolean
  loadingPlaceholder?: ReactNode
  orderBy?: OrderBy
  onOrderBy?: (params: OrderBy) => void
}

export default function Table({
  className,
  style,
  headers,
  rows,
  emptyPlaceholder,
  loading,
  loadingPlaceholder,
  orderBy,
  onOrderBy,
}: TableProps & HTMLAttributes<HTMLTableElement>) {
  const headerElements = headers.map((title, i) => {
    const checked = title === orderBy.field

    if (checked) {
      var direction = { ASC: 'up', DESC: 'down' }[orderBy.direction]
    }

    return (
      <th key={i}>
        {title}
        {orderBy && onOrderBy && (
          <CaretToolbar
            checked={checked}
            direction={direction}
            onChange={(caretDirection) => {
              const direction = {
                up: 'ASC',
                down: 'DESC',
              }[caretDirection]

              if (title !== orderBy.field || direction !== orderBy.direction) {
                onOrderBy({
                  field: title,
                  direction,
                })
              }
            }}
          />
        )}
      </th>
    )
  })

  var thead = (
    <thead>
      <tr>{headerElements}</tr>
    </thead>
  )

  if (!loading) {
    if (rows.length) {
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
    } else {
      if (emptyPlaceholder) {
        var tbody = (
          <tbody>
            <tr>
              <td colSpan={headers.length}>{emptyPlaceholder}</td>
            </tr>
          </tbody>
        )
      }
    }
  }

  return (
    <>
      <GlobalStyle />
      <StyledTable className={className} style={style} responsive>
        {thead}
        {tbody}
      </StyledTable>
      {loading && loadingPlaceholder}
    </>
  )
}
