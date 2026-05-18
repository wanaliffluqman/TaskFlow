import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const graphqlUri = process.env.EXPO_PUBLIC_GRAPHQL_URL;

if (!graphqlUri) {
  throw new Error(
    "Missing EXPO_PUBLIC_GRAPHQL_URL. Please create mobile/.env and set EXPO_PUBLIC_GRAPHQL_URL=http://YOUR_BACKEND_URL/graphql",
  );
}

export const client = new ApolloClient({
  link: new HttpLink({
    uri: graphqlUri,
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          todos: {
            merge: false,
          },
        },
      },
    },
  }),
});
