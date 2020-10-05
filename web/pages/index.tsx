import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { invert, debounce } from 'lodash'
import { useRouter } from 'next/router'
import { useApolloClient } from '@apollo/client'
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
  LineItemsDocument,
} from '../queries/lineItems.graphql'
import {
  SearchByCampaignQueryVariables,
  useSearchByCampaignQuery,
} from '../queries/searchByCampaign.graphql'
import { useUpdateAdjustmentsMutation } from '../queries/updateAdjustments.graphql'
import { useReviewLineItemMutation } from '../queries/reviewLineItem.graphql'
import Table, { OrderBy } from '../components/Table'
import Label from '../components/Label'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1280px;
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
  min-width: 1024px;
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
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 24px;
  margin-bottom: 16px;
  padding: 0 8px;
`

const Total = styled.div`
  margin-left: auto;
`

const StyledAnchor = styled.a`
  color: #007bff;
  transition: color 0.23s linear;
  cursor: pointer;

  &:hover {
    color: #16a085;
  }
`

const CellInput = styled.input`
  padding: 0;
  border: 0;
`

const transArgs = {
  title: 'name',
  campaign: 'campaigns.name',
  bookedAmount: 'booked_amount',
  actualAmount: 'actual_amount',
  adjustments: 'adjustments',
  billableAmount: 'billable_amount',
}

const reversedTransArgs = invert(transArgs)

export default function Home() {
  const client = useApolloClient()
  const router = useRouter()
  const campaign = router.query.campaign as string
  const search = {
    field: router.query.searchField as string,
    value: router.query.searchValue as string,
  }
  const orderBy = {
    field: router.query.orderByField as string,
    direction: router.query.orderByDirection as string,
  }

  if (campaign !== undefined) {
    var mode = 'campaign'
  } else if (search.field && search.value) {
    var mode = 'search'
  } else {
    var mode = 'all'
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

  let lineItemsQueryVars: LineItemsQueryVariables = {}
  let searchByCampaignQueryVars: SearchByCampaignQueryVariables = { campaign }

  if (mode == 'search') {
    lineItemsQueryVars.search = search
  }

  if (orderBy.field && orderBy.direction) {
    lineItemsQueryVars.orderBy = orderBy
    searchByCampaignQueryVars.orderBy = orderBy
  }

  const {
    data: lineItemQueryResult,
    loading: lineItemQueryLoading,
    fetchMore: lineItemFetchMore,
    refetch: lineItemRefetch,
  } = useLineItemsQuery({
    variables: lineItemsQueryVars,
    skip: mode === 'campaign',
  })

  const {
    data: searchByCampaignResult,
    loading: searchByCampaignQueryLoading,
    fetchMore: searchByCampaignFetchMore,
    refetch: searchByCampaignRefetch,
  } = useSearchByCampaignQuery({
    variables: searchByCampaignQueryVars,
    skip: mode !== 'campaign',
  })

  var queryVars = useMemo(() => {
    if (mode === 'campaign') {
      return searchByCampaignQueryVars
    } else {
      return lineItemsQueryVars
    }
  }, [router.query])
  var data = mode === 'campaign' ? searchByCampaignResult : lineItemQueryResult
  var pageLoading =
    mode === 'campaign' ? searchByCampaignQueryLoading : lineItemQueryLoading
  var fetchMore =
    mode === 'campaign' ? searchByCampaignFetchMore : lineItemFetchMore
  var refetch = mode === 'campaign' ? searchByCampaignRefetch : lineItemRefetch

  const [updateAdjustments] = useUpdateAdjustmentsMutation()

  const [reviewLineItem] = useReviewLineItemMutation()

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
    async function effect() {
      setRefreshing(true)
      await refetch(queryVars)
      setRefreshing(false)
    }
    effect()
  }, [router.query])

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

  const rows = useMemo(
    () =>
      data?.lineItems.edges.map(
        ({
          node: {
            id,
            reviewed,
            name,
            bookedAmount,
            actualAmount,
            adjustments,
            campaign,
          },
        }) => {
          const adjustmentsHandler = debounce(async (e) => {
            const newAdjustments = Number.parseFloat(e.target.value)
            const diff = newAdjustments - adjustments

            client.writeQuery({
              query: LineItemsDocument,
              data: {
                ...data,
                lineItems: {
                  ...data.lineItems,
                  total: data.lineItems.total + diff,
                },
              },
            })

            await updateAdjustments({
              variables: {
                input: {
                  id,
                  value: newAdjustments,
                },
              },
            })
          }, 400)

          const adjustmentsField = reviewed ? (
            adjustments
          ) : (
            <CellInput
              type="number"
              defaultValue={adjustments}
              onChange={(e) => {
                e.persist()
                adjustmentsHandler(e)
              }}
            ></CellInput>
          )

          return {
            id,
            checked: reviewed,
            columns: [
              name,
              <Link href={`?campaign=${campaign.id}`} shallow>
                <StyledAnchor>{campaign.name}</StyledAnchor>
              </Link>,
              bookedAmount,
              actualAmount,
              adjustmentsField,
              actualAmount + adjustments,
            ],
          }
        }
      ),
    [data]
  )

  const total = data?.lineItems.total

  if (mode === 'search') {
    var label = <Label onCancel={handleCloseFilter}>Search</Label>
  } else if (mode === 'campaign') {
    var label = <Label onCancel={handleCloseFilter}>Campaign</Label>
  }

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
        {label}
        <Total>Total: {total}</Total>
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
            'billableAmount',
          ]}
          withRowCheck="reviewed"
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
          onRowCheckChange={(id: string, checked) => {
            if (checked) {
              reviewLineItem({ variables: { input: { id } } })
            } else {
              reviewLineItem({ variables: { input: { id, revoke: true } } })
            }
          }}
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
