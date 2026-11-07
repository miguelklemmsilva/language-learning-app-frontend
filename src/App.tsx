import { BrowserRouter } from "react-router-dom";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { amplifyConfig } from "./constants/AmplifyConfig";
import { queryClient, queryPersister } from "./api/queryClient";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import RootNavigator from "./routes/RootNavigator";

Amplify.configure(amplifyConfig);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, buster: "v1" }}
        >
          <Authenticator.Provider>
            <RootNavigator />
          </Authenticator.Provider>
        </PersistQueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
