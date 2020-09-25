import styled from 'styled-components'

import { useLineItemsQuery } from '../queries/lineItems.graphql'
import Table from '../components/Table'

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
`

export default function Home({ query: { field, value } }) {
  const { data, loading } = useLineItemsQuery({
    variables: {
      searchInput: {
        field,
        value,
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

export const getServerSideProps = async ({ query }) => {
  return { props: { query } }
}
