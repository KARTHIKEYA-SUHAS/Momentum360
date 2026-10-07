import api from "./api";

export type Department = {
  id: string;
  name: string;
};

export async function getDepartments(): Promise<Department[]> {
  const response = await api.get<Department[]>("/departments");
  return response.data;
}
