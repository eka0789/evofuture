# 🧪 Testing Guide

## Overview

This directory contains all test files for the Evolution Future platform. We use Vitest as our test runner with React Testing Library for component testing.

## Test Structure

```
tests/
├── setup.ts                      # Test configuration and mocks
├── lib/                          # Library/utility tests
│   ├── utils.test.ts            # Utility function tests
│   ├── feature-flags.test.ts    # Feature flag tests
│   └── logger.test.ts           # Logger tests
└── components/                   # Component tests
    └── Button.test.tsx          # Button component tests
```

## Running Tests

### Watch Mode (Development)
```bash
npm test
```
Runs tests in watch mode. Tests re-run when files change.

### Run Once
```bash
npm run test:run
```
Runs all tests once and exits. Used in CI/CD.

### Coverage Report
```bash
npm run test:coverage
```
Generates a coverage report in the `coverage/` directory.

### UI Mode
```bash
npm run test:ui
```
Opens an interactive UI for running and debugging tests.

## Writing Tests

### Test File Naming
- Unit tests: `*.test.ts` or `*.test.tsx`
- Place tests in the `tests/` directory
- Mirror the source file structure

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/utils';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toBe(null);
  });
});
```

### Component Testing

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const { user } = render(<MyComponent />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

## Test Coverage

### Current Coverage

```
✅ 19 tests passing
⏭️ 1 test skipped
📊 Coverage: ~80%
```

### Coverage Goals
- **Utilities**: 90%+ coverage
- **Components**: 80%+ coverage
- **API Routes**: 70%+ coverage
- **Overall**: 80%+ coverage

## Mocked Dependencies

The following are automatically mocked in `tests/setup.ts`:

### Next.js Router
```typescript
useRouter() // Mocked with common methods
usePathname() // Returns '/'
useSearchParams() // Returns empty URLSearchParams
```

### NextAuth
```typescript
useSession() // Returns authenticated test user
signIn() // Mocked function
signOut() // Mocked function
```

## Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// ❌ Bad - testing implementation
expect(component.state.count).toBe(1);

// ✅ Good - testing behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 2. Use Descriptive Test Names
```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should display error message when form is invalid', () => { ... });
```

### 3. Arrange, Act, Assert
```typescript
it('should increment counter', () => {
  // Arrange
  render(<Counter />);
  
  // Act
  fireEvent.click(screen.getByRole('button'));
  
  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 4. Test Edge Cases
```typescript
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });
});
```

### 5. Keep Tests Independent
```typescript
// ❌ Bad - tests depend on each other
let counter = 0;
it('test 1', () => { counter++; });
it('test 2', () => { expect(counter).toBe(1); });

// ✅ Good - tests are independent
it('test 1', () => {
  let counter = 0;
  counter++;
  expect(counter).toBe(1);
});
```

## Common Testing Patterns

### Testing Async Functions
```typescript
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

### Testing Errors
```typescript
it('should throw error', () => {
  expect(() => dangerousFunction()).toThrow('Error message');
});
```

### Testing with Timers
```typescript
it('should debounce', () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  const debounced = debounce(fn, 1000);
  
  debounced();
  debounced();
  debounced();
  
  vi.advanceTimersByTime(1000);
  expect(fn).toHaveBeenCalledTimes(1);
  
  vi.useRealTimers();
});
```

### Testing API Calls
```typescript
it('should call API', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ data: 'test' }),
  });
  global.fetch = mockFetch;
  
  const result = await apiCall();
  expect(mockFetch).toHaveBeenCalledWith('/api/endpoint');
  expect(result.data).toBe('test');
});
```

## Debugging Tests

### Run Single Test
```bash
npm test -- tests/lib/utils.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- -t "should handle"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Before deployment

See `.github/workflows/ci.yml` for configuration.

## Adding New Tests

### 1. Create Test File
```bash
# For utilities
touch tests/lib/my-util.test.ts

# For components
touch tests/components/MyComponent.test.tsx
```

### 2. Write Tests
```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

### 3. Run Tests
```bash
npm test
```

### 4. Check Coverage
```bash
npm run test:coverage
```

## Troubleshooting

### Tests Not Running
```bash
# Clear cache
rm -rf node_modules/.vite
npm test
```

### Import Errors
```bash
# Regenerate Prisma client
npx prisma generate
```

### Mock Not Working
Check `tests/setup.ts` for existing mocks or add new ones.

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure tests pass
3. Maintain coverage above 80%
4. Update this README if needed

---

**Happy Testing! 🧪**
