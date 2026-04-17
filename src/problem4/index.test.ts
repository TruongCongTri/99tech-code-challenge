import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./index";

// Helper function to measure execution time and memory footprint
function measurePerformance(fn: (n: number) => number, input: number) {
  const startMemory = process.memoryUsage().heapUsed;
  const startTime = performance.now();

  const result = fn(input);

  const endTime = performance.now();
  const endMemory = process.memoryUsage().heapUsed;

  return {
    result,
    timeMs: endTime - startTime,
    // Calculate the difference and convert to Kilobytes (KB)
    memoryKb: (endMemory - startMemory) / 1024,
  };
}

describe("Problem 4: Three ways to sum to n", () => {
  const testCases = [
    { input: 5, expected: 15 },
    { input: 100, expected: 5050 },
    { input: 5000, expected: 12502500 },
  ];

  const benchmarkResults: any[] = [];
  afterAll(() => {
    console.log("\n================ PERFORMANCE BENCHMARK ================");
    console.table(benchmarkResults);
    console.log("=======================================================\n");
  });

  describe("Implementation A: Mathematical Formula [Expected: O(1) Time, O(1) Space]", () => {
    test.each(testCases)("Input: $input", ({ input, expected }) => {
      const { result, timeMs, memoryKb } = measurePerformance(
        sum_to_n_a,
        input,
      );

      expect(result).toBe(expected);

      benchmarkResults.push({
        Algorithm: "A: Math Formula",
        "Input (n)": input,
        "Time (ms)": timeMs.toFixed(6),
        "Memory Delta (KB)": memoryKb.toFixed(6),
      });
    });
  });

  describe("Implementation B: Iterative Loop [Expected: O(n) Time, O(1) Space]", () => {
    test.each(testCases)("Input: $input", ({ input, expected }) => {
      const { result, timeMs, memoryKb } = measurePerformance(
        sum_to_n_b,
        input,
      );

      expect(result).toBe(expected);

      benchmarkResults.push({
        Algorithm: "B: Iterative Loop",
        "Input (n)": input,
        "Time (ms)": timeMs.toFixed(6),
        "Memory Delta (KB)": memoryKb.toFixed(6),
      });
    });
  });

  describe("Implementation C: Recursion [Expected: O(n) Time, O(n) Space]", () => {
    test.each(testCases)("Input: $input", ({ input, expected }) => {
      const { result, timeMs, memoryKb } = measurePerformance(
        sum_to_n_c,
        input,
      );

      expect(result).toBe(expected);

      benchmarkResults.push({
        Algorithm: "C: Recursion",
        "Input (n)": input,
        "Time (ms)": timeMs.toFixed(6),
        "Memory Delta (KB)": memoryKb.toFixed(6),
      });
    });
  });
});
