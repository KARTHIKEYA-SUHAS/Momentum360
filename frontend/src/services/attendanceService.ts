import api from "./api";

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "ON_LEAVE"
  | "HOLIDAY";

export type AttendanceRecord = {
  id: string;
  organizationId: string;

  employeeId: string;

  employee: {
    id: string;
    userId: string | null;
    employeeCode: string;
    firstName: string;
    lastName: string;
    designation: string | null;
    status: string;
    isActive: boolean;
  };

  attendanceDate: string;
  status: AttendanceStatus;

  checkIn: string | null;
  checkOut: string | null;

  workMode: string | null;

  checkInLatitude: string | null;
  checkInLongitude: string | null;

  markedByUserId: string | null;

  createdAt: string;
  updatedAt: string;
};

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const response = await api.get("/attendance");

  return response.data;
}

export async function checkIn(
  latitude?: number,
  longitude?: number,
): Promise<AttendanceRecord> {
  const response = await api.post("/attendance/check-in", {
    ...(latitude !== undefined && { latitude }),
    ...(longitude !== undefined && { longitude }),
  });

  return response.data;
}

export async function checkOut(): Promise<AttendanceRecord> {
  const response = await api.post("/attendance/check-out");

  return response.data;
}
