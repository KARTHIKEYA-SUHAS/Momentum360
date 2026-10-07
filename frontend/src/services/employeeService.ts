import api from "./api";

export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED";

export type Department = {
  id: string;
  name: string;
};

export type Manager = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  status: EmployeeStatus;
  isActive: boolean;
};

export type Employee = {
  id: string;
  organizationId: string;
  userId: string | null;
  user: {
    id: string;
    email: string;
    role: "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";
    isActive: boolean;
  };
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfJoining: string;
  designation: string | null;
  departmentId: string;
  department: Department;
  managerId: string | null;
  manager: Manager | null;
  status: EmployeeStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReportingManager = {
  id: string;
  employeeId: string;
  reportingManagerId: string;
  createdAt: string;
  reportingManager: Manager;
};

export type CreateEmployeeRequest = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  dateOfJoining: string;
  departmentId: string;
  phone?: string;
  designation?: string;
  managerId?: string;
  userId?: string;
};

export async function createEmployee(
  data: CreateEmployeeRequest,
): Promise<Employee> {
  const response = await api.post<Employee>("/employees", data);

  return response.data;
}

export async function getEmployees(): Promise<Employee[]> {
  const response = await api.get<Employee[]>("/employees");

  return response.data;
}

export async function getNextEmployeeCode(): Promise<string> {
  const response = await api.get<string>("/employees/next-code");
  return response.data;
}

export async function getEmployee(employeeId: string): Promise<Employee> {
  const response = await api.get<Employee>(`/employees/${employeeId}`);

  return response.data;
}

export async function getReportingManagers(
  employeeId: string,
): Promise<ReportingManager[]> {
  const response = await api.get<ReportingManager[]>(
    `/employees/${employeeId}/reporting-managers`,
  );

  return response.data;
}
