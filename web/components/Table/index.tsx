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

  th {
    text-align: center;
  }

  td {
    word-break: break-all;
    overflow: scroll;
  }

  input[type='checkbox'] {
    cursor: pointer;
  }
`

interface TrProps {
  checked?: boolean
}

const StyledTr = styled.tr<TrProps>`
  background: ${({ checked }) => (checked ? '#f5f5f5' : 'unset')};
`

const RowCheckTd = styled.td`
  text-align: center;
`

interface CaretProps {
  activated?: boolean
  direction?: string
}

const Caret = styled.div<CaretProps>`
  width: 0;
  height: 0;
  margin: 1px 0;
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
  margin-left: 8px;
  vertical-align: top;
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
  id: string | number
  checked?: boolean
  columns: Array<string | number | ReactNode>
}

export interface OrderBy {
  field?: string
  direction?: string
}

interface TableProps {
  headers: Array<string>
  withRowCheck?: string
  rows?: Array<RowInterface>
  emptyPlaceholder?: ReactNode
  loading?: boolean
  loadingPlaceholder?: ReactNode
  orderBy?: OrderBy
  onOrderBy?: (params: OrderBy) => void
  onRowCheckChange?: (id: string | number, checked: boolean) => void
}

export default function Table({
  className,
  style,
  headers,
  withRowCheck,
  rows,
  emptyPlaceholder,
  loading,
  loadingPlaceholder,
  orderBy,
  onOrderBy,
  onRowCheckChange,
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

  if (withRowCheck) {
    headerElements.unshift(<th key="rowCheck">{withRowCheck}</th>)
  }

  var thead = (
    <thead>
      <tr>{headerElements}</tr>
    </thead>
  )

  if (!loading) {
    if (rows?.length) {
      var tbody = (
        <tbody>
          {rows.map(({ id, checked, columns }) => (
            <StyledTr key={id} checked={checked}>
              {withRowCheck && (
                <RowCheckTd key="rowCheck">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (onRowCheckChange) {
                        onRowCheckChange(id, e.target.checked)
                      }
                    }}
                  ></input>
                </RowCheckTd>
              )}
              {columns.map((column, i) => (
                <td key={i}>{column}</td>
              ))}
            </StyledTr>
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
