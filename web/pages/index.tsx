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
  SearchByCampaignDocument,
  SearchByCampaignQuery,
} from '../queries/searchByCampaign.graphql'
import { useUpdateAdjustmentsMutation } from '../queries/updateAdjustments.graphql'
import { useReviewLineItemMutation } from '../queries/reviewLineItem.graphql'
import { useReviewCampaignMutation } from '../queries/reviewCampaign.graphql'
import Table, { OrderBy } from '../components/Table'
import Label from '../components/Label'
import bindScroll from '../utils/bindScroll'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1440px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 16px;
`

const HeadContainer = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
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
  min-width: 1280px;
  flex-grow: 1;

  th:first-child {
    width: 128px;
  }
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
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 8px;

  > * {
    margin: 8px 0;
  }
`

const StyledLabel = styled(Label)`
  margin-right: 8px;
`

const Total = styled.div`
  margin-left: auto;

  label {
    margin: 0;
    font-weight: bold;
  }
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
  position: relative;
  top: -1px;
  left: -5px;
  width: 100%;
  padding: 0 4px;
  border: 1px solid;
  border-color: rgba(11, 11, 11, 0.2);
`

const CampaignReviewCheckbox = styled.div`
  display: flex;
  align-items: center;

  input {
    margin-right: 4px;
    cursor: pointer;
  }

  label {
    margin: 0;
    font-weight: bold;
    user-select: none;
    cursor: pointer;
  }
`

const LabelContent = styled.div`
  max-width: 240px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

interface CoverHeaderProps {
  visible: boolean
}

const CoverHeader = styled.div<CoverHeaderProps>`
  position: fixed;
  top: 0;
  width: calc(100% - 32px);
  padding-top: 8px;
  background: white;
  transform: translateY(${({ visible }) => (visible ? 0 : '-100%')});
  transition: 0.4s transform;
  z-index: 1;
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
  const [showCoverHeader, setShowCoverHeader] = useState<boolean>()

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

  const [updateAdjustments] = useUpdateAdjustmentsMutation({
    ignoreResults: true,
  })

  const [reviewLineItem] = useReviewLineItemMutation({ ignoreResults: true })
  const [reviewCampaign] = useReviewCampaignMutation({ ignoreResults: true })

  const headContainerRef = useRef<HTMLDivElement>()
  const coverHeaderRef = useRef<HTMLDivElement>()
  const tableRef = useRef<HTMLTableElement>()
  const footerRef = useRef<HTMLDivElement>()
  const campaignReviewCheckboxInputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (!pageLoading) {
      const observer = new IntersectionObserver(async (entries) => {
        if (
          entries[0].intersectionRatio === 1 &&
          data.lineItems.pageInfo.hasNextPage &&
          !refreshing
        ) {
          try {
            setFetchingMore(true)
            await fetchMore({
              variables: {
                after: data.lineItems.pageInfo.endCursor,
              },
            })
          } catch {
            // workaround for handling weird exception when fast refresh
            router.reload()
          } finally {
            setFetchingMore(false)
          }
        }
      })
      observer.observe(footerRef.current)
      return () => {
        observer.disconnect()
      }
    }
  }, [data, refreshing])

  const InfoBarRef = useRef<HTMLDivElement>()

  useEffect(() => {
    if (InfoBarRef.current) {
      const { bottom: infoBarBottom } = InfoBarRef.current.getClientRects()[0]
      const { bottom: prevSibBottom } = (InfoBarRef.current
        .previousSibling as HTMLElement).getClientRects()[0]
      const rootMarginTop = prevSibBottom - infoBarBottom

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].intersectionRatio === 0) {
            setShowCoverHeader(true)
          } else {
            setShowCoverHeader(false)
          }
        },
        // Use rootMargin as a workaround to include the region cantains the "total" field. The value is the distance between the bottom of InfoBar's previous sibling and the bottom of InfoBar.
        { threshold: [0, 0.0001], rootMargin: `${rootMarginTop}px 0px 0px` }
      )
      observer.observe(headContainerRef.current)
      return () => {
        observer.disconnect()
      }
    }
  }, [pageLoading])

  useEffect(() => {
    // .table-responsive is an internal wrapper from react-bootstrap table
    // it's a scrollable container
    if (coverHeaderRef.current && tableRef.current) {
      return bindScroll(
        coverHeaderRef.current.querySelector('.table-responsive'),
        tableRef.current.parentNode as HTMLElement
      )
    }
  }, [coverHeaderRef.current, tableRef.current])

  useEffect(() => {
    // reversed scroll binding
    if (coverHeaderRef.current && tableRef.current) {
      return bindScroll(
        tableRef.current.parentNode as HTMLElement,
        coverHeaderRef.current.querySelector('.table-responsive')
      )
    }
  }, [coverHeaderRef.current, tableRef.current])

  useEffect(() => {
    async function effect() {
      // avoid weird undefined error when fast refresh in development environment
      try {
        // only refreshing after initial page loading
        if (!pageLoading) {
          setRefreshing(true)
          await refetch(queryVars)
        }
      } catch {
      } finally {
        setRefreshing(false)
      }
    }
    effect()
  }, [router.query])

  const handleTabSelect = useCallback((key) => {
    setTab(key)
  }, [])

  const handleOrderBy = useCallback(
    ({ field, direction }: OrderBy) => {
      router.replace({
        query: {
          ...router.query,
          orderByField: transArgs[field],
          orderByDirection: direction,
        },
      })
    },
    [router.query]
  )

  useEffect(() => {
    const topOffset =
      headContainerRef.current.getClientRects()[0].height -
      InfoBarRef.current.getClientRects()[0].height

    if (window.scrollY > topOffset) {
      window.scrollTo(0, topOffset)
    }
  }, [router.query])

  const handleFormChange = useCallback((e) => {
    setFormInput(e.target.value)
  }, [])

  const handleCloseFilter = useCallback(() => {
    router.push({
      query: {},
    })
  }, [])

  const handleReviewCampaign = useCallback(
    (e) => {
      const reviewed = e.target.checked

      client.writeQuery({
        query: SearchByCampaignDocument,
        data: {
          ...data,
          lineItems: {
            ...data.lineItems,
            edges: data.lineItems.edges.map((edge) => ({
              ...edge,
              node: { ...edge.node, reviewed },
            })),
          },
          campaign: {
            ...(data as SearchByCampaignQuery).campaign,
            reviewed,
          },
        },
      })

      reviewCampaign({
        variables: { input: { id: campaign, revoke: !reviewed } },
      })
    },
    [data, campaign]
  )

  const handleReviewLineItem = useCallback(
    (id: string, checked: boolean) => {
      // manually optimistic update due to weird behaviors of useMutation optimistic response
      if (mode === 'campaign') {
        if (!checked) {
          var campaignReviewed = false
        } else if (
          data.lineItems.edges.every(({ node }) =>
            node.id === id ? checked : node.reviewed
          )
        ) {
          var campaignReviewed = true
        }

        client.writeQuery({
          query: SearchByCampaignDocument,
          data: {
            ...data,
            lineItems: {
              ...data.lineItems,
              edges: data.lineItems.edges.map((edge) => ({
                ...edge,
                node: {
                  ...edge.node,
                  reviewed: edge.node.id === id ? checked : edge.node.reviewed,
                },
              })),
            },
            campaign: {
              ...(data as SearchByCampaignQuery).campaign,
              reviewed: campaignReviewed,
            },
          },
        })
      } else {
        client.writeQuery({
          query: LineItemsDocument,
          data: {
            ...data,
            lineItems: {
              ...data.lineItems,
              edges: data.lineItems.edges.map((edge) => ({
                ...edge,
                node: {
                  ...edge.node,
                  reviewed: edge.node.id === id ? checked : edge.node.reviewed,
                },
              })),
            },
          },
        })
      }

      reviewLineItem({
        variables: { input: { id, revoke: !checked } },
      })
    },
    [data, mode]
  )

  const form = (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (formInput) {
          router.push({
            pathname: '/',
            query: { searchField: curTab, searchValue: formInput },
          })
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
    </form>
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
          const adjustmentsHandler = debounce((value) => {
            const newAdjustments = Number.parseFloat(value)
            const diff = newAdjustments - adjustments

            client.writeQuery({
              query: LineItemsDocument,
              data: {
                ...data,
                lineItems: {
                  ...data.lineItems,
                  edges: data.lineItems.edges.map((edge) => ({
                    ...edge,
                    node: {
                      ...edge.node,
                      adjustments:
                        edge.node.id === id
                          ? newAdjustments
                          : edge.node.adjustments,
                    },
                  })),
                  total: data.lineItems.total + diff,
                },
              },
            })

            updateAdjustments({
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
                adjustmentsHandler(e.target.value || 0)
              }}
            ></CellInput>
          )

          return {
            id,
            checked: reviewed,
            columns: [
              name,
              <Link
                href={`?campaign=${campaign.id}`}
                passHref
                scroll={false}
                shallow
              >
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

  const headContainerOffset = useMemo(() => {
    if (headContainerRef.current) {
      const { top, height } = headContainerRef.current.getClientRects()[0]
      return top + window.scrollY + height
    }
    return 0
  }, [headContainerRef.current])

  const total = data?.lineItems.total

  if (data) {
    if (mode === 'search') {
      var label = (
        <StyledLabel onCancel={handleCloseFilter}>
          <LabelContent>
            Search{' '}
            {
              { 'campaign.name': 'Campaign', line_item: 'Line-item' }[
                search.field
              ]
            }
            : {search.value}
          </LabelContent>
        </StyledLabel>
      )
    } else if (mode === 'campaign') {
      var label = (
        <StyledLabel onCancel={handleCloseFilter}>
          <LabelContent>
            Campaign: {(data as SearchByCampaignQuery)?.campaign.name}
          </LabelContent>
        </StyledLabel>
      )
      var campaignReviewCheckbox = (
        <CampaignReviewCheckbox>
          <input
            type="checkbox"
            ref={campaignReviewCheckboxInputRef}
            checked={(data as SearchByCampaignQuery).campaign.reviewed}
            onChange={handleReviewCampaign}
          ></input>
          <label
            // use onClick instead of htmlFor to prevent scrolling side-effect
            onClick={(e) => {
              campaignReviewCheckboxInputRef.current.click()
            }}
          >
            reviewed
          </label>
        </CampaignReviewCheckbox>
      )
    }
  }

  return (
    <Container style={{ minHeight: `calc(100vh + ${headContainerOffset}px)` }}>
      <HeadContainer ref={headContainerRef}>
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
        <InfoBar ref={InfoBarRef}>
          {label}
          {campaignReviewCheckbox}
          <Total>
            <label>Total:</label> {total}
          </Total>
        </InfoBar>
      </HeadContainer>
      <CoverHeader visible={showCoverHeader} ref={coverHeaderRef}>
        <HeadContainer>
          <InfoBar>
            {label}
            {campaignReviewCheckbox}
            <Total>
              <label>Total:</label> {total}
            </Total>
          </InfoBar>
        </HeadContainer>
        <StyledTable
          style={{ marginBottom: 0 }}
          headers={[
            'title',
            'campaign',
            'bookedAmount',
            'actualAmount',
            'adjustments',
            'billableAmount',
          ]}
          withRowCheck="reviewed"
          orderBy={{
            field: reversedTransArgs[orderBy.field],
            direction: orderBy.direction,
          }}
          onOrderBy={handleOrderBy}
        ></StyledTable>
      </CoverHeader>
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
          onRowCheckChange={handleReviewLineItem}
          ref={tableRef}
        ></StyledTable>
      </TableWrapper>
      {fetchingMore && <TablePlaceholder uniqueKey="table-placeholder" />}
      <footer ref={footerRef}></footer>
    </Container>
  )
}
