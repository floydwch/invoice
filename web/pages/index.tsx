import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { invert } from 'lodash'
import { useRouter } from 'next/router'
import Link from 'next/link'
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
import Label from '../components/Label'

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

const InfoBar = styled.div`
  width: 100%;
  height: 24px;
  margin-bottom: 16px;
  padding: 0 8px;
`

const StyledAnchor = styled.a`
  color: #007bff;
  transition: color 0.23s linear;
  cursor: pointer;

  &:hover {
    color: #16a085;
  }
`

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
  const [formInput, setFormInput] = useState<string>(
    ['campaign.name', 'line_item'].includes(search.field) ? search.value : ''
  )
  const [curTab, setTab] = useState<string>(
    ['campaign.name', 'line_item'].includes(search.field)
      ? search.field
      : 'campaign.name'
  )

  let queryVars: LineItemsQueryVariables = {}

  const isFilteredBySearch = search.field && search.value

  if (isFilteredBySearch) {
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

  const handleTabSelect = useCallback((key) => {
    setTab(key)
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

  const handleFormChange = useCallback((e) => {
    setFormInput(e.target.value)
  }, [])

  const handleCloseFilter = useCallback(() => {
    router.push(
      {
        query: {},
      },
      undefined,
      { shallow: true }
    )
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

  const labelMap = useMemo(() => {
    return {
      line_item: 'Search',
      'campaign.name': 'Search',
      campaign: 'Campaign',
    }
  }, [])

  const rows = data?.lineItems.edges.map(
    ({
      node: { id, name, bookedAmount, actualAmount, adjustments, campaign },
    }) => ({
      id: `${id}`,
      columns: [
        name,
        <Link href={`?searchField=campaign&searchValue=${campaign.id}`} shallow>
          <StyledAnchor>{campaign.name}</StyledAnchor>
        </Link>,
        bookedAmount,
        actualAmount,
        adjustments,
      ],
    })
  )

  return (
    <Container>
      <StyledTabs
        defaultActiveKey={curTab}
        transition={false}
        onSelect={handleTabSelect}
      >
        <Tab eventKey="campaign.name" title="By campaign">
          {form}
        </Tab>
        <Tab eventKey="line_item" title="By line-item">
          {form}
        </Tab>
      </StyledTabs>
      <InfoBar>
        {isFilteredBySearch && (
          <Label onCancel={handleCloseFilter}>{labelMap[search.field]}</Label>
        )}
      </InfoBar>
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
