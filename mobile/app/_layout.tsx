import { Stack } from "expo-router";
import { ApolloProvider } from "@apollo/client/react";

import { client } from "../lib/apolloClient";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
