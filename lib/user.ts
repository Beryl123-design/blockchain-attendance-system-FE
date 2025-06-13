export function getUserById(id: string) {
  // Mock implementation
  return { id, name: "John Doe", email: "john.doe@example.com" };
}

export function getAllUsers() {
  // Mock implementation
  return [
    { id: "1", name: "John Doe", email: "john.doe@example.com" },
    { id: "2", name: "Jane Smith", email: "jane.smith@example.com" },
  ];
}