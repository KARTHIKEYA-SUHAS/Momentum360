import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ScreenHeader from "../components/ScreenHeader";

import EmployeesScreen from "../screens/employees/EmployeesScreen";
import AddEmployeeScreen from "../screens/employees/AddEmployeeScreen";
import TeamDetailsScreen from "../screens/employees/TeamDetailsScreen";

export type EmployeesStackParamList = {
  EmployeeList: undefined;
  AddEmployee: undefined;
  TeamDetails: {
    managerId: string;
  };
};

const Stack = createNativeStackNavigator<EmployeesStackParamList>();

export default function EmployeesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EmployeeList"
        component={EmployeesScreen}
        options={{
          header: () => (
            <ScreenHeader
              title="Employees"
              subtitle="Manage your organization's employees."
            />
          ),
        }}
      />

      <Stack.Screen
        name="AddEmployee"
        component={AddEmployeeScreen}
        options={({ navigation }) => ({
          header: () => (
            <ScreenHeader
              title="Add Employee"
              subtitle="Create a new employee and their account."
              showBack
              onBackPress={() => navigation.goBack()}
            />
          ),
        })}
      />

      <Stack.Screen
        name="TeamDetails"
        component={TeamDetailsScreen}
        options={({ navigation }) => ({
          header: () => (
            <ScreenHeader
              title="Team Details"
              subtitle="View team information and work location."
              showBack
              onBackPress={() => navigation.goBack()}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
}
