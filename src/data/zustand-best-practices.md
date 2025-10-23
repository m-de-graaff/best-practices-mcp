## 🧠 1. Picking State

### ❌ Don’t: Pick the whole state
Selecting the **entire store** (`useStore()`) causes every subscribed component to re-render whenever *any* part of the state changes.

```tsx
const gifts = useGiftStore(); // ❌ bad
```

Every change in the store triggers a re-render, even if the component only uses one value.

✅ Do: Pick a single slice or value
Select only what your component actually needs.

```tsx
const count = useGiftStore((state) => state.count);
const increment = useGiftStore((state) => state.increment);
```

✅ Keeps renders minimal and scoped.
✅ Improves performance in large UIs.

✅ Do: Pick multiple values/actions with shallow comparison
When you need multiple state values, combine them with shallow from Zustand:

```tsx
import { shallow } from "zustand/shallow";

const { count, gifts, increment } = useGiftStore(
  (state) => ({
    count: state.count,
    gifts: state.gifts,
    increment: state.increment,
  }),
  shallow
);
```

✅ Prevents re-renders when only unrelated values change.
⚠️ Avoid combining too many values in one selector; it becomes unmanageable.

⚙️ 2. Calculated / Derived State
❌ Don’t: Calculate inside an action only
If you compute derived values only inside actions, components won’t re-render when dependencies change.

```tsx
// ❌ Wrong
const useCartStore = create((set, get) => ({
  items: [],
  getTotal: () => get().items.reduce((acc, i) => acc + i.price, 0),
}));
```

```tsx
const total = useCartStore((state) => state.getTotal()); // Won’t re-render
```
✅ Do: Derive the value in the selector itself
Compute derived values directly in your selector so that React re-renders when dependencies change.

```tsx
const total = useCartStore(
  (state) => state.items.reduce((acc, i) => acc + i.price, 0)
);
```

✅ React now tracks dependencies.
✅ Keeps derived values consistent with the store.

✅ Do: Delay expensive calculations
If the derived computation is heavy, calculate it only when needed.

```tsx
const getTotal = useCartStore((state) => state.getTotal);

const handleShowTotal = () => {
  const total = getTotal();
  alert(`Your total: ${total}`);
};
```

✅ Defers work until necessary.
✅ Keeps UI snappy for frequent updates.

🔒 3. Private State with TypeScript
Sometimes, you need to hide internal implementation details.

❌ Don’t: Use underscores
Underscore naming (_privateCount) does not actually make state private.

```tsx
interface StoreState {
  _secretValue: string; // ❌ still accessible
}
```

✅ Do: Use narrower types
Expose a public interface that omits private properties.

```tsx
interface FullStore {
  count: number;
  increment: () => void;
  _secret: string; // internal only
}

interface PublicStore extends Omit<FullStore, "_secret"> {}

export const useCounterStore = create<FullStore>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  _secret: "hidden",
}));

export const usePublicCounterStore = useCounterStore as unknown as UseBoundStore<StoreApi<PublicStore>>;
```

✅ Keeps internal values hidden in TypeScript.
✅ Forces consumers to use the public API only.

🧩 4. Architecture Tips
✅ Organize stores by domain
Split stores by logical domain rather than by component.

```bash
/stores
 ├─ useUserStore.ts
 ├─ useCartStore.ts
 ├─ useSettingsStore.ts
 └─ useNotificationStore.ts
```
Each store handles a single concern and exposes clear actions.

✅ Use middlewares wisely
Zustand middlewares (like persist, subscribeWithSelector, and immer) are powerful, but combine them sparingly:

```tsx
import { create } from "zustand";
import { persist, subscribeWithSelector, devtools } from "zustand/middleware";

export const useUserStore = create(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        user: null,
        setUser: (u) => set({ user: u }),
      })),
      { name: "user-storage" }
    )
  )
);
```

✅ Provides persistence, time travel, and debugging.
⚠️ Avoid deeply nesting middlewares; prefer composition utilities.

✅ Memoize heavy selectors
If a derived selector is expensive, memoize with React hooks:

```tsx
const expensiveValue = useMemo(
  () => computeComplexStuff(useStore.getState().data),
  [useStore((s) => s.data)]
);
```

✅ Use Biome or ESLint for hygiene
Replace traditional ESLint rules with Biome equivalents:

```json
{
  "linter": {
    "rules": {
      "complexity": {
        "useSimplifiedLogicExpression": "on"
      },
      "correctness": {
        "noUnusedVariables": "on"
      }
    }
  }
}
```
Biome helps maintain clean, type-safe store logic automatically.

🧪 5. Testing Your Zustand Store
Use the store directly in tests—no React needed:

```ts
import { useUserStore } from "@/stores/useUserStore";

test("increments count", () => {
  const store = useUserStore.getState();
  store.increment();
  expect(store.count).toBe(1);
});
```

✅ Decoupled, fast unit tests.
✅ Ideal for CI pipelines or Vitest setups.

🚀 6. Performance Checklist
✅ Practice	💡 Benefit
Pick only needed slices	Fewer re-renders
Use shallow when selecting multiple values	Avoid unnecessary updates
Derive values in selectors, not actions	Correct dependency tracking
Split stores by domain	Maintainability
Persist only essential state	Faster load, less I/O
Use Biome for linting	Consistent code quality
Test stores directly	Faster and cleaner tests

🧾 Example Store Template (TypeScript)
```tsx
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((s) => ({ count: s.count + 1 })),
        decrement: () => set((s) => ({ count: s.count - 1 })),
      }),
      { name: "counter-store" }
    )
  )
);
```

🏁 Summary
DO:

Select minimal slices of state.

Use shallow comparison for multi-value selectors.

Derive computed values in selectors, not actions.

Use TypeScript’s narrower interfaces for private state.

Persist and debug with Zustand middlewares.

Keep stores small, domain-focused, and testable.

DON’T:

Pick the whole store in components.

Over-combine values in a single selector.

Calculate derived state in actions only.

Abuse underscores for hiding internal state.

Deeply nest middleware chains unnecessarily.

