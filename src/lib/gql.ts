import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const GITHUB_PAT: string = '92c954b6ad38ebe6840389da512c890447d94e50'

const ENDPOINT: ApolloLink = createHttpLink({
    uri: 'https://api.github.com/graphql',
})

const authLink = setContext(() => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem('token');
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        // authorization: token ? `Bearer ${token}` : "",
        authorization: `Bearer ${GITHUB_PAT}`,
      }
    }
  })

export const client = new ApolloClient({
  link: authLink.concat(ENDPOINT),
  cache: new InMemoryCache()
})

