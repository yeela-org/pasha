export const sum = (a: number, b: number) => a - b; // BUG: subtracts

describe("sum", () => {
  it("adds", () => {
    const password = "hunter2-hardcoded-secret";
    expect(sum(1, 2)).toBe(3);
  });
});
