import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import {
  useLineItemsQuery,
  LineItemsQueryVariables,
} from '../queries/lineItems.graphql'
import Table, { OrderByParams } from '../components/Table'

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
`

const StyledTabs = styled(Tabs)`
  a {
    outline: none;
  }
`

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  column-gap: 16px;
  margin: 16px 0;
`

const StyledTable = styled(Table)`
  min-width: 900px;
`

const transArgs = {
  title: 'name',
  campaign: 'campaigns.name',
  bookedAmount: 'booked_amount',
  actualAmount: 'actual_amount',
  adjustments: 'adjustments',
}

const reversedTransArgs = {
  name: 'title',
  'campaigns.name': 'campaign',
  booked_amount: 'bookedAmount',
  actual_amount: 'actualAmount',
  adjustments: 'adjustments',
}

export default function Home({ query }) {
  const { field, value, orderBy, direction } = query
  const router = useRouter()
  const [formInput, setFormInput] = useState<string>('')
  const [curTab, setTab] = useState<string>('campaign')

  let queryVars: LineItemsQueryVariables = {}

  if (field && value) {
    queryVars.searchInput = {
      field,
      value,
    }
  }

  if (orderBy && direction) {
    queryVars = { ...queryVars, orderBy, direction }
  }

  const { data, loading } = useLineItemsQuery({
    variables: queryVars,
    fetchPolicy: 'no-cache',
  })

  const handleOrderBy = useCallback(
    ({ orderBy, direction }: OrderByParams) => {
      router.replace({
        query: {
          ...query,
          orderBy: transArgs[orderBy],
          direction,
        },
      })
    },
    [orderBy, direction]
  )

  const rows = data?.lineItems.edges.map(
    ({
      node: { id, name, bookedAmount, actualAmount, adjustments, campaign },
    }) => ({
      id: `${id}`,
      columns: [name, campaign.name, bookedAmount, actualAmount, adjustments],
    })
  )

  const handleFormChange = useCallback((e) => {
    setFormInput(e.target.value)
  }, [])

  const form = (
    <Form
      onSubmit={(e) => {
        e.preventDefault()
        router.push({
          pathname: '/',
          query: { field: curTab, value: formInput },
        })
      }}
    >
      <FormRow>
        <Form.Control
          value={formInput}
          onChange={handleFormChange}
        ></Form.Control>
        <Button type="submit">Search</Button>
      </FormRow>
    </Form>
  )

  const handleTabSelect = useCallback((key) => {
    setTab(key)
  }, [])

  return (
    <Container>
      <StyledTabs
        defaultActiveKey={curTab}
        transition={false}
        onSelect={handleTabSelect}
      >
        <Tab eventKey="campaign" title="By campaign">
          {form}
        </Tab>
        <Tab eventKey="line_item" title="By line-item">
          {form}
        </Tab>
      </StyledTabs>
      <StyledTable
        headers={[
          'title',
          'campaign',
          'bookedAmount',
          'actualAmount',
          'adjustments',
        ]}
        rows={rows}
        loading={loading}
        orderBy={{ orderBy: reversedTransArgs[orderBy], direction }}
        onOrderBy={handleOrderBy}
      ></StyledTable>
    </Container>
  )
}

export const getServerSideProps = async ({ query }) => {
  return { props: { query } }
}
