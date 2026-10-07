import { useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";

import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { useNavigation } from "@react-navigation/native";
import ToastMessage from "../../components/ToastMessage";

import { createUser } from "../../services/userService";
import {
  createEmployee,
  getEmployees,
  getNextEmployeeCode,
  type Employee,
} from "../../services/employeeService";
import {
  getDepartments,
  type Department,
} from "../../services/departmentService";
import DateTimePicker from "@react-native-community/datetimepicker";

type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

const roles: UserRole[] = ["ADMIN", "HR", "MANAGER", "EMPLOYEE"];
const designations = [
  "Software Engineer",
  "Senior Software Engineer",
  "Full Stack Developer",
  "QA Engineer",
  "QA Lead",
  "Tech Lead",
  "Engineering Manager",
  "Project Manager",
  "HR Manager",
  "HR Executive",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer",
  "Business Analyst",
  "Intern",
  "Other",
];

export default function AddEmployeeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<UserRole | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeCodeLoading, setEmployeeCodeLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [showJoiningDatePicker, setShowJoiningDatePicker] = useState(false);
  const [joiningDateValue, setJoiningDateValue] = useState(new Date());
  const [designation, setDesignation] = useState("");
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
  const [customDesignation, setCustomDesignation] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [managerId, setManagerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const navigation = useNavigation();
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setDepartmentsLoading(true);

        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Failed to load departments:", error);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setEmployeesLoading(true);

        const data = await getEmployees();

        setEmployees(data);
      } catch (error) {
        console.error("Failed to load employees:", error);
      } finally {
        setEmployeesLoading(false);
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    const loadNextEmployeeCode = async () => {
      try {
        setEmployeeCodeLoading(true);

        const nextCode = await getNextEmployeeCode();

        setEmployeeCode(nextCode);
      } catch (error) {
        console.error("Failed to load next employee code:", error);
      } finally {
        setEmployeeCodeLoading(false);
      }
    };

    loadNextEmployeeCode();
  }, []);

  const handleCreateEmployee = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // 1. Create the user account
      const user = await createUser({
        email: email.trim(),
        password,
        role: role!,
      });

      // 2. Create the employee and link it to the user
      await createEmployee({
        employeeCode: employeeCode.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfJoining,
        departmentId,
        designation:
          designation === "Other" ? customDesignation.trim() : designation,
        phone: phone.trim() || undefined,
        managerId: managerId || undefined,
        userId: user.id,
      });
      setToastMessage("Employee created successfully.");
      setShowToast(true);

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error("Create employee failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    setFormError("");

    if (!email.trim()) {
      setFormError("Email is required.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return false;
    }

    if (!password.trim()) {
      setFormError("Password is required.");
      return false;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return false;
    }

    if (!role) {
      setFormError("Role is required.");
      return false;
    }

    if (!employeeCode.trim()) {
      setFormError("Employee code is required.");
      return false;
    }

    if (employeeCode.trim().length < 4) {
      setFormError("Employee code must be at least 4 characters.");
      return false;
    }

    if (!firstName.trim()) {
      setFormError("First name is required.");
      return false;
    }

    if (firstName.trim().length < 2) {
      setFormError("First name must be at least 2 characters.");
      return false;
    }

    if (!lastName.trim()) {
      setFormError("Last name is required.");
      return false;
    }

    if (lastName.trim().length < 1) {
      setFormError("Last name must be at least 1 character.");
      return false;
    }

    if (!dateOfJoining.trim()) {
      setFormError("Date of joining is required.");
      return false;
    }

    const joiningDate = new Date(dateOfJoining);

    if (Number.isNaN(joiningDate.getTime())) {
      setFormError("Please enter a valid date of joining.");
      return false;
    }

    if (!designation.trim()) {
      setFormError("Designation is required.");
      return false;
    }

    if (designation === "Other") {
      if (!customDesignation.trim()) {
        setFormError("Custom designation is required.");
        return false;
      }

      if (customDesignation.trim().length < 2) {
        setFormError("Custom designation must be at least 2 characters.");
        return false;
      }
    }

    if (!departmentId) {
      setFormError("Department is required.");
      return false;
    }

    if (!managerId) {
      setFormError("Manager is required.");
      return false;
    }

    return true;
  };

  const formatJoiningDate = (date: string) => {
    if (!date) {
      return "";
    }

    const [year, month, day] = date.split("-");

    const dateValue = new Date(Number(year), Number(month) - 1, Number(day));

    return dateValue.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1 bg-slate-50">
      {showToast ? (
        <ToastMessage
          message={toastMessage}
          title="Employee Created"
          type="success"
          onHide={() => setShowToast(false)}
        />
      ) : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      >
        {/* Account Information */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-900">
            Account Information
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            Create the user's login account.
          </Text>

          <View className="gap-4 mt-5">
            <Input
              label="Email"
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="Password"
              placeholder="Enter password"
              isPassword
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Role Dropdown */}
            <View className="relative">
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Role
              </Text>

              <Pressable
                onPress={() => setShowRoleDropdown((current) => !current)}
                className={`h-12 flex-row items-center justify-between rounded-xl border bg-white px-4 ${
                  showRoleDropdown ? "border-blue-600" : "border-slate-200"
                }`}
              >
                <Text
                  className={`text-base ${
                    role ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {role ?? "Select role"}
                </Text>

                <Ionicons
                  name={
                    showRoleDropdown
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={16}
                  color="#64748B"
                />
              </Pressable>

              {showRoleDropdown ? (
                <View className="absolute left-0 right-0 top-[76px] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  {roles.map((item) => {
                    const isSelected = role === item;

                    return (
                      <Pressable
                        key={item}
                        onPress={() => {
                          setRole(item);
                          setShowRoleDropdown(false);
                        }}
                        className={`border-b border-slate-100 px-4 py-4 last:border-b-0 ${
                          isSelected ? "bg-blue-50" : "bg-white"
                        }`}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text
                            className={`text-base font-medium ${
                              isSelected ? "text-blue-600" : "text-slate-900"
                            }`}
                          >
                            {item}
                          </Text>

                          {isSelected ? (
                            <Ionicons
                              name="checkmark"
                              size={19}
                              color="#2563EB"
                            />
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Employee Information */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-900">
            Employee Information
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            Enter the employee's work information.
          </Text>

          <View className="gap-4 mt-5">
            <Input
              label="Employee Code"
              placeholder="Generating..."
              autoCapitalize="characters"
              value={employeeCode}
              editable={false}
            />

            <Input
              label="First Name"
              placeholder="Enter first name"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={lastName}
              onChangeText={setLastName}
            />

            <Input
              label="Phone"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Date of Joining
              </Text>

              <Pressable
                onPress={() => setShowJoiningDatePicker(true)}
                className="flex-row items-center justify-between h-12 px-4 bg-white border rounded-xl border-slate-200"
              >
                <Text
                  className={`text-base ${
                    dateOfJoining ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {dateOfJoining
                    ? formatJoiningDate(dateOfJoining)
                    : "Select date of joining"}
                </Text>

                <Ionicons name="calendar-outline" size={20} color="#64748B" />
              </Pressable>

              {showJoiningDatePicker ? (
                <DateTimePicker
                  value={joiningDateValue}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowJoiningDatePicker(false);

                    if (selectedDate) {
                      setJoiningDateValue(selectedDate);

                      const year = selectedDate.getFullYear();
                      const month = String(
                        selectedDate.getMonth() + 1,
                      ).padStart(2, "0");
                      const day = String(selectedDate.getDate()).padStart(
                        2,
                        "0",
                      );

                      setDateOfJoining(`${year}-${month}-${day}`);
                    }
                  }}
                />
              ) : null}
            </View>

            <View className="relative z-30">
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Designation
              </Text>

              <Pressable
                onPress={() =>
                  setShowDesignationDropdown((current) => !current)
                }
                className={`h-12 flex-row items-center justify-between rounded-xl border bg-white px-4 ${
                  showDesignationDropdown
                    ? "border-blue-600"
                    : "border-slate-200"
                }`}
              >
                <Text
                  className={`text-base ${
                    designation ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {designation || "Select designation"}
                </Text>

                <Ionicons
                  name={
                    showDesignationDropdown
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={16}
                  color="#64748B"
                />
              </Pressable>

              {showDesignationDropdown ? (
                <View className="absolute left-0 right-0 top-[76px] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <ScrollView
                    style={{ maxHeight: 220 }}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                  >
                    {designations.map((item) => {
                      const isSelected = designation === item;

                      return (
                        <Pressable
                          key={item}
                          onPress={() => {
                            setDesignation(item);
                            setShowDesignationDropdown(false);

                            if (item !== "Other") {
                              setCustomDesignation("");
                            }
                          }}
                          className={`border-b border-slate-100 px-4 py-4 ${
                            isSelected ? "bg-blue-50" : "bg-white"
                          }`}
                        >
                          <View className="flex-row items-center justify-between">
                            <Text
                              className={`text-base font-medium ${
                                isSelected ? "text-blue-600" : "text-slate-900"
                              }`}
                            >
                              {item}
                            </Text>

                            {isSelected ? (
                              <Ionicons
                                name="checkmark"
                                size={19}
                                color="#2563EB"
                              />
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}
            </View>

            {designation === "Other" ? (
              <Input
                label="Custom Designation"
                placeholder="Enter designation"
                value={customDesignation}
                onChangeText={setCustomDesignation}
              />
            ) : null}

            {/* Department */}
            <View className="relative z-20">
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Department
              </Text>

              <Pressable
                onPress={() => setShowDepartmentDropdown((current) => !current)}
                className={`h-12 flex-row items-center justify-between rounded-xl border bg-white px-4 ${
                  showDepartmentDropdown
                    ? "border-blue-600"
                    : "border-slate-200"
                }`}
              >
                <Text
                  className={`text-base ${
                    departmentId ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {departments.find(
                    (department) => department.id === departmentId,
                  )?.name ?? "Select department"}
                </Text>

                <Ionicons
                  name={
                    showDepartmentDropdown
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={16}
                  color="#64748B"
                />
              </Pressable>

              {showDepartmentDropdown ? (
                <View className="absolute left-0 right-0 top-[76px] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <ScrollView
                    style={{ maxHeight: 220 }}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                  >
                    {departmentsLoading ? (
                      <View className="px-4 py-5">
                        <Text className="text-sm text-slate-500">
                          Loading departments...
                        </Text>
                      </View>
                    ) : departments.length === 0 ? (
                      <View className="px-4 py-5">
                        <Text className="text-sm text-slate-500">
                          No departments available.
                        </Text>
                      </View>
                    ) : (
                      departments.map((department) => {
                        const isSelected = departmentId === department.id;

                        return (
                          <Pressable
                            key={department.id}
                            onPress={() => {
                              setDepartmentId(department.id);
                              setShowDepartmentDropdown(false);
                            }}
                            className={`border-b border-slate-100 px-4 py-4 ${
                              isSelected ? "bg-blue-50" : "bg-white"
                            }`}
                          >
                            <View className="flex-row items-center justify-between">
                              <Text
                                className={`text-base font-medium ${
                                  isSelected
                                    ? "text-blue-600"
                                    : "text-slate-900"
                                }`}
                              >
                                {department.name}
                              </Text>

                              {isSelected ? (
                                <Ionicons
                                  name="checkmark"
                                  size={19}
                                  color="#2563EB"
                                />
                              ) : null}
                            </View>
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              ) : null}
            </View>

            {/* Manager */}
            <View
              className={`relative ${showManagerDropdown ? "z-50" : "z-10"}`}
            >
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Manager
              </Text>

              <Pressable
                onPress={() => setShowManagerDropdown((prev) => !prev)}
                className="flex-row items-center justify-between h-12 px-4 bg-white border rounded-xl border-slate-200"
              >
                {managerId ? (
                  (() => {
                    const manager = employees.find(
                      (employee) => employee.id === managerId,
                    );

                    return manager ? (
                      <View className="flex-row items-center flex-1">
                        <Text
                          className="text-base font-medium text-slate-900"
                          numberOfLines={1}
                        >
                          {manager.firstName} {manager.lastName}
                        </Text>

                        {manager.designation ? (
                          <Text
                            className="flex-shrink ml-2 text-sm text-slate-500"
                            numberOfLines={1}
                          >
                            • {manager.designation}
                          </Text>
                        ) : null}
                      </View>
                    ) : (
                      <Text className="text-base text-slate-400">
                        Select manager
                      </Text>
                    );
                  })()
                ) : (
                  <Text className="text-base text-slate-400">
                    Select manager
                  </Text>
                )}

                <Ionicons
                  name={showManagerDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#64748B"
                />
              </Pressable>

              {showManagerDropdown ? (
                <View className="absolute bottom-[52px] left-0 right-0 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <ScrollView
                    style={{ maxHeight: 220 }}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                  >
                    {employeesLoading ? (
                      <View className="px-4 py-5">
                        <Text className="text-sm text-slate-500">
                          Loading managers...
                        </Text>
                      </View>
                    ) : employees.filter(
                        (employee) =>
                          employee.isActive &&
                          employee.status === "ACTIVE" &&
                          employee.user?.role === "MANAGER",
                      ).length === 0 ? (
                      <View className="px-4 py-5">
                        <Text className="text-sm text-slate-500">
                          No active managers available.
                        </Text>
                      </View>
                    ) : (
                      employees
                        .filter(
                          (employee) =>
                            employee.isActive &&
                            employee.status === "ACTIVE" &&
                            employee.user?.role === "MANAGER",
                        )
                        .map((employee) => {
                          const isSelected = managerId === employee.id;

                          return (
                            <Pressable
                              key={employee.id}
                              onPress={() => {
                                setManagerId(employee.id);
                                setShowManagerDropdown(false);
                              }}
                              className={`border-b border-slate-100 px-4 py-4 ${
                                isSelected ? "bg-blue-50" : "bg-white"
                              }`}
                            >
                              <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                  <Text
                                    className={`text-base font-medium ${
                                      isSelected
                                        ? "text-blue-600"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {employee.firstName} {employee.lastName}
                                  </Text>

                                  <Text className="mt-1 text-sm text-slate-500">
                                    {employee.employeeCode}
                                    {employee.designation
                                      ? ` • ${employee.designation}`
                                      : ""}
                                  </Text>
                                </View>

                                {isSelected ? (
                                  <Ionicons
                                    name="checkmark"
                                    size={19}
                                    color="#2563EB"
                                  />
                                ) : null}
                              </View>
                            </Pressable>
                          );
                        })
                    )}
                  </ScrollView>
                </View>
              ) : null}
            </View>
          </View>
        </View>
        {formError ? (
          <View className="px-4 py-3 mb-4 border border-red-200 rounded-xl bg-red-50">
            <Text className="text-sm font-medium text-red-600">
              {formError}
            </Text>
          </View>
        ) : null}

        {/* Action */}
        <Button
          title="Create Employee"
          onPress={handleCreateEmployee}
          loading={loading}
        />
      </ScrollView>
    </View>
  );
}
