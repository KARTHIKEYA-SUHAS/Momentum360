import { NavigationContainer } from "@react-navigation/native";
import "./global.css";

import RootNavigator from "./src/navigations/RootNavigator";
import { AuthProvider } from "./src/store/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
