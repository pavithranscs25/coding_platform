export const sqlCategories = [
  ['SQL Fundamentals', ['SELECT', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'DISTINCT']],
  ['SQL Operations', ['INSERT', 'UPDATE', 'DELETE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN']],
  ['Advanced SQL', ['Subqueries', 'CTE', 'Window Functions', 'CASE', 'Aggregate Functions', 'Indexes']],
]
export const schema = [
  { name: 'employees', columns: ['id', 'name', 'salary', 'department_id'], rows: [[1, 'Arun', 65000, 1], [2, 'Meena', 48000, 2], [3, 'Karthik', 55000, 1], [4, 'Priya', 72000, 3], [5, 'Ravi', 40000, 'NULL'], [6, 'Divya', 72000, 2]] },
  { name: 'departments', columns: ['id', 'name'], rows: [[1, 'Engineering'], [2, 'Sales'], [3, 'Product']] },
]
const blank = '-- Write your query here\n'
// [title, difficulty, description, starter, cols, rows]
const rows = [
  ['Find all employees with salary greater than 50000', 'Easy', 'Return id, name and salary of employees earning more than 50000.', 'SELECT *\nFROM employees\nWHERE salary > 50000;', ['id', 'name', 'salary'], [[1, 'Arun', 65000], [3, 'Karthik', 55000], [4, 'Priya', 72000], [6, 'Divya', 72000]]],
  ['Find the second highest salary', 'Medium', 'Return the second highest distinct salary.', blank, ['second_highest'], [[65000]]],
  ['Find employees by department', 'Easy', 'Return each employee name with their department name.', blank, ['name', 'department'], [['Arun', 'Engineering'], ['Karthik', 'Engineering'], ['Meena', 'Sales'], ['Divya', 'Sales'], ['Priya', 'Product']]],
  ['Find duplicate records', 'Medium', 'Find salary values shared by more than one employee, with their count.', blank, ['salary', 'count'], [[72000, 2]]],
  ['Find departments with more than 1 employee', 'Medium', 'Return department names having more than one employee (sample data is small).', blank, ['department', 'employees'], [['Engineering', 2], ['Sales', 2]]],
  ['Find the highest salary in each department', 'Medium', 'Return department name and its highest salary.', blank, ['department', 'max_salary'], [['Engineering', 65000], ['Sales', 72000], ['Product', 72000]]],
  ["Find employees who don't belong to any department", 'Easy', 'Return the names of employees whose department_id is NULL.', blank, ['name'], [['Ravi']]],
  ['Calculate average salary by department', 'Medium', 'Return each department name with its average salary.', blank, ['department', 'avg_salary'], [['Engineering', 60000], ['Sales', 60000], ['Product', 72000]]],
]
export const dbProblems = rows.map(([title, difficulty, description, starter, cols, r], i) => ({
  id: i + 1, title, difficulty, topic: 'SQL', description, schema, starter, expected: { cols, rows: r },
}))
