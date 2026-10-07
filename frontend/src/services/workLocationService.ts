import api from "./api";

export type WorkMode = "OFFICE" | "WFH";

export type OfficeLocation = {
  id: string;
  name: string;
  address?: string | null;
  isActive: boolean;
};

export type TeamWorkLocation = {
  id: string;
  organizationId: string;
  managerId: string;
  workMode: WorkMode;
  officeLocationId: string | null;
  officeLocation: OfficeLocation | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TeamWorkLocationRequest = {
  workMode: WorkMode;
  officeLocationId?: string;
};

export async function getTeamWorkLocation(
  managerId: string,
): Promise<TeamWorkLocation> {
  const response = await api.get<TeamWorkLocation>(
    `/work-locations/teams/${managerId}`,
  );

  return response.data;
}

export async function getOfficeLocations(): Promise<OfficeLocation[]> {
  const response = await api.get<OfficeLocation[]>("/work-locations/offices");

  return response.data;
}

export async function createTeamWorkLocation(
  managerId: string,
  data: TeamWorkLocationRequest,
): Promise<TeamWorkLocation> {
  const response = await api.post<TeamWorkLocation>(
    `/work-locations/teams/${managerId}`,
    data,
  );

  return response.data;
}

export async function updateTeamWorkLocation(
  managerId: string,
  data: TeamWorkLocationRequest,
): Promise<TeamWorkLocation> {
  const response = await api.patch<TeamWorkLocation>(
    `/work-locations/teams/${managerId}`,
    data,
  );

  return response.data;
}
