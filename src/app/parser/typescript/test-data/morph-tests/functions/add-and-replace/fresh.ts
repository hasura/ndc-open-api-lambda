/**
 * a function that multiplies two numbers
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * This function prints the double value of a given number
 */
export function doubleNumber(x: number) {
  console.log(`double of ${x} is ${multiply(2, x)}`);
}
