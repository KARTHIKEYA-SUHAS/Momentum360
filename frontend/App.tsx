import { NavigationContainer } from "@react-navigation/native";
import "./global.css";

import RootNavigator from "./src/navigations/RootNavigator";
import { AuthProvider } from "./src/store/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
