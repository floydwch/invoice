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
import Table, { OrderBy } from '../components/Table'

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

const transArgs = {
  title: 'name',
  campaign: 'campaigns.name',
  bookedAmount: 'booked_amount',
  actualAmount: 'actual_amount',
  adjustments: 'adjustments',
}

const reversedTransArgs = invert(transArgs)

export default function Home() {
  const router = useRouter()
  const search = {
    field: router.query.searchField as string,
    value: router.query.searchValue as string,
  }
  const orderBy = {
    field: router.query.orderByField as string,
    direction: router.query.orderByDirection as string,
  }
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [fetchingMore, setFetchingMore] = useState<boolean>(false)
  const [formInput, setFormInput] = useState<string>('')
  const [curTab, setTab] = useState<string>('campaign')

  let queryVars: LineItemsQueryVariables = {}

  if (search.field && search.value) {
    queryVars.search = search
  }

  if (orderBy.field && orderBy.direction) {
    queryVars.orderBy = orderBy
  }

  const { data, loading: pageLoading, fetchMore, refetch } = useLineItemsQuery({
    variables: queryVars,
  })

  const footerRef = useRef()

  useEffect(() => {
    if (!pageLoading) {
      const observer = new IntersectionObserver(async (entries) => {
        if (
          entries[0].intersectionRatio === 1 &&
          data.lineItems.pageInfo.hasNextPage &&
          !refreshing
        ) {
          setFetchingMore(true)
          await fetchMore({
            variables: {
              after: data.lineItems.pageInfo.endCursor,
            },
          })
          setFetchingMore(false)
        }
      })
      observer.observe(footerRef.current)
      return () => {
        observer.disconnect()
      }
    }
  }, [data, refreshing])

  useEffect(() => {
    const handler = async () => {
      const {
        searchField,
        searchValue,
        orderByField,
        orderByDirection,
      } = Object.fromEntries(new URLSearchParams(location.search))

      if (searchField && searchValue) {
        var search = {
          field: searchField,
          value: searchValue,
        }
      }

      if (orderByField && orderByDirection) {
        var orderBy = {
          field: orderByField,
          direction: orderByDirection,
        }
      }

      setRefreshing(true)

      await refetch({
        search,
        orderBy,
      })

      setRefreshing(false)
    }

    router.events.on('routeChangeComplete', handler)

    return () => {
      router.events.off('routeChangeComplete', handler)
    }
  }, [])

  const handleOrderBy = useCallback(
    async ({ field, direction }: OrderBy) => {
      router.replace(
        {
          query: {
            ...router.query,
            orderByField: transArgs[field],
            orderByDirection: direction,
          },
        },
        undefined,
        { shallow: true }
      )
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
          router.push(
            {
              pathname: '/',
              query: { searchField: curTab, searchValue: formInput },
            },
            undefined,
            { shallow: true }
          )
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
      <TableWrapper
        key={router.query.value as string}
        style={{ height: rows?.length ? 'auto' : '1px' }}
      >
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
          orderBy={{
            field: reversedTransArgs[orderBy.field],
            direction: orderBy.direction,
          }}
          onOrderBy={handleOrderBy}
        ></StyledTable>
      </TableWrapper>
      {fetchingMore && <TablePlaceholder uniqueKey="table-placeholder" />}
      <footer ref={footerRef}></footer>
    </Container>
  )
}

export const getServerSideProps = async ({ query }) => {
  return { props: { query } }
}
