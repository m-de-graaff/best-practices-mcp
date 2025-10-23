Best Practices
1. Use Strict Mode

Enable full type safety to catch potential issues early.
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

Strict mode ensures maximum correctness by enforcing type precision.

2. Leverage Type Inference

TypeScript infers most types automatically — avoid redundant declarations.
```ts
// ❌ Redundant
let count: number = 0;

// ✅ Inferred
let count = 0; // inferred as number

```
This keeps code cleaner and easier to maintain.

3. Avoid the any Type

any disables type checking — use unknown or generics instead.
```ts
// ❌ Avoid
function process(input: any) {
  console.log(input);
}

// ✅ Better
function process(input: unknown) {
  if (typeof input === "string") {
    console.log(input.toUpperCase());
  }
}
```

unknown forces explicit type narrowing, keeping type safety intact.

4. Use Interfaces and Types Wisely

Use interface for object shapes and contracts, and type for unions, intersections, and aliases.
```ts
interface User {
  id: number;
  name: string;
}

type UserRole = "admin" | "editor" | "viewer";
```

💡 Prefer interfaces for public APIs, types for internal logic.

5. Prefer readonly and Immutability

Prevent unintended mutations — it improves reliability and predictability.
```ts
interface Config {
  readonly apiUrl: string;
  readonly retries: number;
}

const config: Config = { apiUrl: "/api", retries: 3 };
```

6. Use Generics for Reusable Logic

Generics make components and utilities flexible while keeping type safety.
```ts
function identity<T>(value: T): T {
  return value;
}

const num = identity(42); // T = number
const name = identity("Mark"); // T = string
```

7. Use Utility Types

Leverage built-in helpers to transform or derive new types.

Utility	Description
Partial<T>	Make all properties optional
Required<T>	Make all properties required
Pick<T, K>	Select specific keys
Omit<T, K>	Exclude specific keys
Readonly<T>	Make all properties immutable
Record<K, T>	Create a map type
```ts
type User = { id: number; name: string; email?: string };
type SafeUser = Readonly<Required<User>>;
```

8. Apply Access Modifiers in Classes

Explicitly declare public, private, and protected.

```ts
class Account {
  private balance = 0;

  deposit(amount: number) {
    this.balance += amount;
  }

  getBalance() {
    return this.balance;
  }
}
```

9. Use Enums and Literal Types for Controlled Values

Avoid “magic strings” — enforce controlled inputs.

```ts
enum Status {
  Pending = "PENDING",
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

function setStatus(status: Status) {
  console.log(status);
}

setStatus(Status.Active);
```

Or use literal unions for smaller scopes:

```ts
type Theme = "light" | "dark";
```

10. Handle Null and Undefined Properly

Always consider both null and undefined cases.

```ts
function getLength(str?: string | null): number {
  return str?.length ?? 0;
}
```

Use the optional chaining (?.) and nullish coalescing (??) operators.

11. Follow Consistent Naming Conventions
Type	Convention	Example
Variables / Functions	camelCase	userName, getUserData()
Classes / Interfaces	PascalCase	UserService, UserProps
Enums	PascalCase	UserRole.Admin
File Names	kebab-case.ts	user-service.ts

Keep naming predictable and consistent across the repo.

12. Prefer Modern JS Features

Avoid var. Use let and const with destructuring.

```ts
// ❌
var message = "Hello";

// ✅
const message = "Hello";

const { name, email } = user;
```

13. Use Biome for Linting & Formatting

Biome replaces ESLint + Prettier with a single, faster toolchain.

🧩 Example .biome.json
```json
{
  "$schema": "https://biomejs.dev/schemas/latest/schema.json",
  "formatter": {
    "enabled": true,
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "style": {
        "useConst": "error",
        "noVar": "error",
        "useCamelCase": "warn"
      },
      "correctness": {
        "noUndeclaredVariables": "error"
      },
      "complexity": {
        "noUselessElse": "warn"
      }
    }
  }
}
```

🧠 Why Biome

Ultra-fast (Rust-based)

Combines formatting + linting + import sorting

TypeScript-aware rules built-in

Easy to run via pnpm biome check . or integrate into CI/CD

14. Document with JSDoc and TSDoc

Enhance your public APIs or shared utilities with clear annotations.

```ts
/**
 * Calculates the total price after discount.
 * @param price - Base price in euros
 * @param discount - Discount percentage (0–100)
 * @returns Final price after discount
 */
export function getDiscountedPrice(price: number, discount: number): number {
  return price - price * (discount / 100);
}
```

> Use JSDoc for readability — TypeScript still infers full types automatically.

15. Organize Types in a types/ Folder

For large repos, group your shared types in a dedicated workspace or package.

```pgsql
packages/
  types/
    user.ts
    api.ts
    index.ts
```

Then re-export and import cleanly:
```ts
// packages/types/index.ts
export * from "./user";
export * from "./api";
```

✅ Wrap-Up

TypeScript makes your codebase safer, clearer, and easier to scale — but only if used intentionally.
Keep these key ideas in mind:

Always enable strict mode

Avoid any like the plague

Use generics, utility types, and readonly for safety

Use Biome for consistency and speed

Document your contracts with JSDoc/TSDoc

By following these practices, you’ll keep your TypeScript projects fast, maintainable, and ready for long-term growth.