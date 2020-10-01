import { PropsWithChildren } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 24px;
  background: #0366d6;
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
`

const Cross = styled.div`
  margin-left: 3px;
  height: 100%;
  font-size: 20px;

  &::before {
    content: '\\d7';
    position: relative;
    display: flex;
    height: 100%;
    top: -1px;
    left: 2px;
    align-items: center;
  }
`

interface LabelProps {
  onCancel?: () => any
}

export default function Lable({
  onCancel,
  children,
}: PropsWithChildren<LabelProps>) {
  return (
    <Container onClick={onCancel}>
      {children}
      <Cross />
    </Container>
  )
}
