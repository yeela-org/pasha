export const divide = (a: number, b: number) => a / b; // no zero check

export function getUser(users: { id: number }[], id: number) {
  return users[id]; // BUG: indexes by id instead of finding by id
}
