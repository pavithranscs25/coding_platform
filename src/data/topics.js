const g = (group, names) => names.map((n) => { const [name, slug] = n.split('|'); return { name, group, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') } })
export const topics = [
  ...g('Fundamentals', ['Variables', 'Data Types', 'Operators', 'Input & Output', 'Conditional Statements|conditions', 'Loops', 'Functions']),
  ...g('Data Structures', ['Arrays', 'Strings', 'Linked Lists', 'Stack', 'Queue', 'Hashing', 'Trees', 'Graphs']),
  ...g('Algorithms', ['Searching', 'Sorting', 'Recursion', 'Two Pointers', 'Sliding Window', 'Greedy', 'Dynamic Programming', 'Backtracking']),
  ...g('Advanced Topics', ['Bit Manipulation', 'Prefix Sum', 'Binary Search', 'Heap', 'Graph Algorithms']),
]
export const topicGroups = ['Fundamentals', 'Data Structures', 'Algorithms', 'Advanced Topics']
// Placeholder learning content: { intro, sections: [[heading, text, optionalCode]] }
export const content = {
  loops: { intro: 'Loops allow us to execute a block of code repeatedly until a condition is satisfied.', sections: [
    ['What are loops?', 'A loop repeats a block of code while a condition holds, so you avoid copy-pasting statements.'],
    ['for loop', 'Best when you know how many times to repeat.', 'for (let i = 0; i < 5; i++) {\n    console.log(i);\n}'],
    ['while loop', 'Best when repeating until a condition changes.', 'let n = 3;\nwhile (n > 0) {\n    console.log(n);\n    n--;\n}'],
    ['do-while loop', 'Runs the body once before checking the condition.', 'let x = 0;\ndo {\n    console.log(x);\n    x++;\n} while (x < 3);'],
    ['Nested loops', 'A loop inside a loop. Work multiplies: n × m iterations.', 'for (let i = 1; i <= 3; i++) {\n    for (let j = 1; j <= 3; j++) {\n        console.log(i * j);\n    }\n}'],
    ['Common mistakes', 'Off-by-one errors (< vs <=), forgetting to update the loop variable (infinite loop), and modifying a collection while iterating over it.'],
  ] },
  arrays: { intro: 'An array stores an ordered collection of items accessible by index.', sections: [
    ['Creating arrays', 'Indexes start at 0.', 'const nums = [4, 8, 15];\nconsole.log(nums[0]); // 4'],
    ['Traversing', 'Use a loop to visit every element.', 'for (const n of nums) console.log(n);'],
    ['Common mistakes', 'Reading past the last index and confusing length with the last index (length - 1).'],
  ] },
  strings: { intro: 'A string is a sequence of characters.', sections: [
    ['Basics', 'Strings can be indexed and sliced like arrays.', 'const s = "logic";\nconsole.log(s[0], s.length);'],
    ['Common operations', 'Concatenate, compare, reverse and search.', 'console.log(s.toUpperCase(), s.includes("gi"));'],
    ['Common mistakes', 'Strings are immutable in most languages; build a new string instead of editing in place.'],
  ] },
  conditions: { intro: 'Conditional statements choose which code runs based on a condition.', sections: [
    ['if / else', 'Run code only when a condition is true.', 'if (age >= 18) {\n    console.log("Adult");\n} else {\n    console.log("Minor");\n}'],
    ['else if & switch', 'Chain multiple conditions.', 'if (s > 90) grade = "A";\nelse if (s > 75) grade = "B";\nelse grade = "C";'],
    ['Common mistakes', 'Using = instead of ==/===, and forgetting braces around multi-line blocks.'],
  ] },
  functions: { intro: 'A function is a reusable named block of code that can take inputs and return a result.', sections: [
    ['Defining functions', 'Parameters in, return value out.', 'function add(a, b) {\n    return a + b;\n}'],
    ['Calling functions', 'Call by name with arguments.', 'console.log(add(2, 3)); // 5'],
    ['Common mistakes', 'Forgetting to return a value and mutating shared state unexpectedly.'],
  ] },
  searching: { intro: 'Searching finds an element in a collection.', sections: [
    ['Linear search', 'Check every element. O(n).', 'for (let i = 0; i < a.length; i++) {\n    if (a[i] === target) return i;\n}\nreturn -1;'],
    ['Binary search', 'On sorted data, halve the range each step. O(log n).'],
    ['Common mistakes', 'Applying binary search to unsorted data; integer overflow when computing mid.'],
  ] },
  sorting: { intro: 'Sorting arranges elements in a defined order.', sections: [
    ['Bubble sort', 'Repeatedly swap adjacent out-of-order items. O(n²).', 'for (let i = 0; i < n - 1; i++)\n  for (let j = 0; j < n - i - 1; j++)\n    if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];'],
    ['Faster sorts', 'Merge sort and quick sort run in O(n log n).'],
    ['Common mistakes', 'Wrong loop bounds and forgetting that default sorts may compare as strings.'],
  ] },
}
