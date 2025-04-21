const mockDatabase: { [key: string]: any[] } = {};

export const recordAttendance = async (employeeId: string, date: string, status: string) => {
  if (!mockDatabase[employeeId]) {
    mockDatabase[employeeId] = [];
  }
  mockDatabase[employeeId].push({ date, status });
  return Promise.resolve({ success: true });
};

export const getAttendance = async (employeeId: string) => {
  return Promise.resolve(mockDatabase[employeeId] || []);
};
