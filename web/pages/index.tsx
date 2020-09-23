import { useRouter } from 'next/router'
import styled from 'styled-components'

import { useLineItemsQuery } from '../queries/lineItems.graphql'
import Table from '../components/Table'

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
`

export default function Home() {
  const {
    query: { field, value },
  } = useRouter()
  const { data, loading } = useLineItemsQuery({
    variables: {
      searchInput: {
        field: field as string,
        value: value as string,
      },
    },
  })

  const rows = data?.lineItems.edges.map(
    ({
      node: { id, name, bookedAmount, actualAmount, adjustments, campaign },
    }) => ({
      id: `${id}`,
      columns: [name, campaign.name, bookedAmount, actualAmount, adjustments],
    })
  )

  return loading ? (
    'loading'
  ) : (
    <Container>
      <Table
        headers={[
          'title',
          'campaign',
          'bookedAmount',
          'actualAmount',
          'adjustments',
        ]}
        rows={rows}
      ></Table>
    </Container>
  )
}
