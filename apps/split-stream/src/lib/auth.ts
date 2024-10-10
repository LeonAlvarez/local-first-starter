export const users = [
  { id: 1, email: "admin@example.com", password: "admin123" },
  { id: 2, email: "user@example.com", password: "user123" },
];

export function authenticateUser(email: string, password: string) {
  return users.find(
    (user) => user.email === email && user.password === password
  );
}
