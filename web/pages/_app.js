import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { relayStylePagination } from '@apollo/client/utilities'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'

const GRAPHQL_URL =
  typeof window === undefined ? process.env.GRAPHQL_URL : '/graphql'

const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          lineItems: relayStylePagination(),
        },
      },
    },
  }),
})

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  )
}

export default MyApp
