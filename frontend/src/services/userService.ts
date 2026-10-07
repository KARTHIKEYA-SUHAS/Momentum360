import api from "./api";

export type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

export type CreateUserRequest = {
  email: string;
  password: string;
  role: UserRole;
};

export type CreatedUser = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export async function createUser(
  data: CreateUserRequest,
): Promise<CreatedUser> {
  const response = await api.post<CreatedUser>("/users", data);

  return response.data;
}
