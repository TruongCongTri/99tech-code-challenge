# Problem 4: Three ways to sum to n

## Overview
This directory contains the solution for the "Three ways to sum to n" algorithmic challenge. The goal is to provide three distinct implementations of a function that calculates the sum of integers from `1` to `n`, demonstrating an understanding of different programming paradigms and algorithm complexities.

## Implementations

1.  **Mathematical Formula (Optimized)**
    * **Method:** Uses the arithmetic progression formula: `n * (n + 1) / 2`.
    * **Complexity:** Time: $O(1)$ | Space: $O(1)$
    * **Best for:** Extremely large numbers where performance and memory are critical.

2.  **Iterative Approach**
    * **Method:** Uses a standard `for` loop to accumulate the total.
    * **Complexity:** Time: $O(n)$ | Space: $O(1)$
    * **Best for:** General-purpose summation without recursion depth limits.

3.  **Recursive Approach**
    * **Method:** The function calls itself, adding `n` to the sum of `n-1`.
    * **Complexity:** Time: $O(n)$ | Space: $O(n)$ (due to the call stack)
    * **Best for:** Demonstrating functional programming concepts (Note: Not recommended for very large `n` due to stack overflow risks).

## How to Run
This project is fully configured with TypeScript (`ts-node`) and Jest (`ts-jest`). **No manual compilation is required.**

### Prerequisites
* **Node.js** (v14 or higher)

### 1. Install Dependencies
Navigate into the Problem 4 directory and install the required dev dependencies:
```bash
cd src/problem4
npm install
```

### 2. Run the Test Suite (Recommended)
The solution includes a comprehensive Jest test suite to verify the accuracy of all three functions against edge cases (e.g., negative numbers, zero, and large integers). To run the tests:
```bash
npm run test
```

* Note on `run test`: I highly favor running the tests to evaluate this problem. Using the test suite makes it much easier to track inputs, change data for edge cases, and verify accuracy without modifying the core logic.

### 3. Execute the Code Directly (Alternative)
To run the implementations and print the sample outputs directly to the console:
```bash
npm run start
```
(This executes `ts-node index.ts` under the hood).


* Note on `npm start`: To keep the test suite output clean, the console.log statements inside index.ts may be commented out by default. You will need to uncomment them before running npm start if you wish to see the results printed in your terminal.



