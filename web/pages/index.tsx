import { useState, useCallback, useEffect, useRef } from 'react'
import { invert } from 'lodash'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import LoadingPlaceholder from 'react-content-loader'

import {
  useLineItemsQuery,
  LineItemsQueryVariables,
} from '../queries/lineItems.graphql'
import Table, { OrderByParams } from '../components/Table'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 960px;
  min-height: 100vh;
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
  flex-grow: 1;
`

const TableWrapper = styled.div`
  flex-grow: 1;
`

const transArgs = {
  title: 'name',
  campaign: 'campaigns.name',
  bookedAmount: 'booked_amount',
  actualAmount: 'actual_amount',
  adjustments: 'adjustments',
}

const reversedTransArgs = invert(transArgs)

const TablePlaceholder = (props) => (
  <LoadingPlaceholder
    viewBox="0 0 240 120"
    height={120}
    width={'100%'}
    speed={2}
    backgroundColor="transparent"
    {...props}
  >
    <circle cx="60" cy="60" r="8" />
    <circle cx="120" cy="60" r="8" />
    <circle cx="180" cy="60" r="8" />
  </LoadingPlaceholder>
)

export default function Home({ query }) {
  const { field, value, orderBy, direction } = query
  const router = useRouter()
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [formInput, setFormInput] = useState<string>('')
  const [curTab, setTab] = useState<string>('campaign')

  let queryVars: LineItemsQueryVariables = {}

  if (field && value) {
    queryVars.searchParams = {
      field,
      value,
    }
  }

  if (orderBy && direction) {
    queryVars = { ...queryVars, orderBy, direction }
  }

  const { data, loading: pageLoading, fetchMore, refetch } = useLineItemsQuery({
    variables: queryVars,
  })

  const footerRef = useRef()

  useEffect(() => {
    if (!pageLoading) {
      const observer = new IntersectionObserver((entries) => {
        if (
          entries[0].intersectionRatio === 1 &&
          data.lineItems.pageInfo.hasNextPage
        ) {
          fetchMore({
            variables: {
              after: data.lineItems.pageInfo.endCursor,
            },
          })
        }
      })
      observer.observe(footerRef.current)
      return () => {
        observer.disconnect()
      }
    }
  }, [data])

  const handleOrderBy = useCallback(
    async ({ orderBy, direction }: OrderByParams) => {
      const nextQuery = {
        ...router.query,
        orderBy: transArgs[orderBy],
        direction,
      }
      router.replace(
        {
          query: nextQuery,
        },
        undefined,
        { shallow: true }
      )
      setRefreshing(true)
      await refetch(nextQuery)
      setRefreshing(false)
    },
    [router.query]
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
      onSubmit={async (e) => {
        e.preventDefault()
        if (formInput) {
          const searchParams = { field: curTab, value: formInput }
          router.push(
            {
              pathname: '/',
              query: searchParams,
            },
            undefined,
            { shallow: true }
          )
          setRefreshing(true)
          await refetch({ searchParams })
          setRefreshing(false)
        }
      }}
    >
      <FormRow>
        <Form.Control
          required
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
      <TableWrapper style={{ height: rows?.length ? 'auto' : '1px' }}>
        <StyledTable
          headers={[
            'title',
            'campaign',
            'bookedAmount',
            'actualAmount',
            'adjustments',
          ]}
          rows={rows}
          emptyPlaceholder={<div>No results.</div>}
          loading={!data || refreshing}
          loadingPlaceholder={
            <TablePlaceholder uniqueKey="table-placeholder" />
          }
          orderBy={{ orderBy: reversedTransArgs[orderBy], direction }}
          onOrderBy={handleOrderBy}
        ></StyledTable>
      </TableWrapper>
      <footer ref={footerRef}></footer>
    </Container>
  )
}

export const getServerSideProps = async ({ query }) => {
  return { props: { query } }
}
