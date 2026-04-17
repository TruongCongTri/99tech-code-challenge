/**
 * Implementation A: Mathematical Formula (Arithmetic Progression)
 * * Complexity:
 * - Time Complexity: O(1).
 * It calculates the sum in a single mathematical operation, regardless of how large n is.
 * - Space Complexity: O(1).
 * No extra memory is allocated, only constant space.
 * */
export function sum_to_n_a(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Implementation B: Iterative Loop
 * * Complexity:
 * - Time Complexity: O(n).
 * The loop runs n times. If n is 1 thousand, it performs 1 thousand additions.
 * - Space Complexity: O(1).
 * It only uses a single integer variable (sum) to store the accumulator, making it very memory efficient.
 * */
export function sum_to_n_b(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Implementation C: Recursion
 * * Complexity:
 * - Time Complexity: O(n).
 * The function calls itself n times.
 * - Space Complexity: O(n).
 * Each recursive call adds a new frame to the call stack, consuming memory.
 * */
export function sum_to_n_c(n: number): number {
  // Base case: if n is 1 or less, stop the recursion
  if (n <= 1) {
    return n;
  }

  // Recursive case: n + the sum of all numbers before it
  return n + sum_to_n_c(n - 1);
}


// --- Testing the outputs ---
// console.log(sum_to_n_a(5)); // Outputs: 15
// console.log(sum_to_n_b(5)); // Outputs: 15
// console.log(sum_to_n_c(5)); // Outputs: 15