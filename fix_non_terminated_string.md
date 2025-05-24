# How to Fix Non-Terminated String Errors

If you're encountering a "non-terminated string" error in your JavaScript/TypeScript code, follow these steps to identify and fix the issue:

## 1. Check for Missing Closing Quotes

The most common cause of this error is a missing closing quote. Look for strings that start with a quote but don't end with one:

```javascript
// Incorrect
const name = 'John;

// Correct
const name = 'John';
```

## 2. Check for Template Literals

Template literals use backticks (`) and can span multiple lines. Make sure all template literals have closing backticks:

```javascript
// Incorrect
const greeting = `Hello ${name};

// Correct
const greeting = `Hello ${name}`;
```

## 3. Check for Multi-line Strings

In JavaScript, strings can't span multiple lines unless you use template literals or escape the newline:

```javascript
// Incorrect
const message = 'This is a multi-line
string';

// Correct
const message = 'This is a multi-line\nstring';
// or
const message = `This is a multi-line
string`;
```

## 4. Check for Special Characters

Sometimes, special characters or Unicode characters can cause issues:

```javascript
// Incorrect (using smart quotes)
const name = "John";

// Correct
const name = "John";
```

## 5. Check for Escape Sequences

Make sure all escape sequences are properly formed:

```javascript
// Incorrect
const path = 'C:\Users\John';

// Correct
const path = 'C:\\Users\\John';
```

## 6. Check for Comments

Sometimes, comments can interfere with string parsing:

```javascript
// Incorrect
const name = 'John // This is a comment';

// Correct
const name = 'John'; // This is a comment
```

## 7. Systematic Approach

If you can't find the issue by manual inspection, try:

1. Commenting out sections of code to isolate the problem
2. Creating a minimal test case
3. Using a linter or code formatter
4. Using a different text editor that shows invisible characters

## 8. Common Locations for Errors

Check these common locations for string errors:

- URL strings
- File paths
- Regular expressions
- JSON strings
- Template literals with expressions
- String concatenation

## 9. Tools to Help

- ESLint: Can catch many string-related errors
- Prettier: Formatting can reveal string issues
- VS Code: Shows syntax highlighting for unclosed strings
- TypeScript: Provides better error messages for string issues

## 10. Last Resort

If all else fails, try:

1. Retyping the problematic strings
2. Saving the file with a different encoding
3. Copying the code to a new file
4. Using a different text editor
