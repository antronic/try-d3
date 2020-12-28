import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const GITHUB_PAT: string = '903013f36de30c102a1b73a2d98769155fe91adc'

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

