## 1. Introduction

**TanStack Query** (formerly React Query) is the industry-standard library for **server-state management** in React applications.  
It simplifies fetching, caching, synchronizing, and updating remote data.

## 2. Why Use TanStack Query

✅ Automatic caching & background refetching  
✅ Retry logic & stale-while-revalidate pattern  
✅ Built-in support for optimistic updates  
✅ Declarative data fetching with zero boilerplate  
✅ Devtools for debugging queries  
✅ Excellent TypeScript support  
## 3. Setup & Configuration

```bash
pnpm i @tanstack/react-query axios
```
Create a global QueryClient
```ts
// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});
```

Wrap the app
```tsx
// src/app/providers.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

4. Core Best Practices
Colocate queries near usage, not globally.

Use custom hooks for each API domain (useUserQuery, useProjectsQuery).

Never fetch directly in components — always through React Query.

Use meaningful queryKey arrays (e.g., ['projects', userId]).

Use enabled flag to conditionally start queries.

Use select to transform data before returning.

Type everything using Axios + Zod or open-api-generated types.

Prefer mutations for write operations (useMutation).

Use optimistic updates for fast UX.

Keep API logic pure (no side-effects like navigation inside fetchers).

5. Error & Loading States
Handle them gracefully and consistently:

```tsx
const { data, isPending, isError, error } = useQuery({
  queryKey: ['projects'],
  queryFn: getProjects,
});

if (isPending) return <Spinner />;
if (isError) return <ErrorState message={error.message} />;
```

For global handling, define custom error boundaries or toast notifications.

6. API Structure for Scalable Projects
Use a centralized API layer that defines your fetchers and hooks.

```ts
// src/api/projects.ts
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const getProjects = async () => {
  const { data } = await axios.get("/api/projects");
  return data;
};

export const useProjectsQuery = () =>
  useQuery({ queryKey: ["projects"], queryFn: getProjects });

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProject: any) => axios.post("/api/projects", newProject),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
};
```

7. Query Keys & Invalidation
Use structured query keys for predictable cache control.

```ts
queryClient.invalidateQueries({ queryKey: ['blog', blogId] });
```

Pattern your keys by domain and entity type:

```css
['user', id]
['projects', { page, filter }]
['notifications']
```

8. Mutations
Mutations should:

Handle optimistic updates

Rollback on error

Show loading/confirmation toasts

Example:

```ts
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (variables) => {
    await queryClient.cancelQueries(['user', variables.id]);
    const previousUser = queryClient.getQueryData(['user', variables.id]);
    queryClient.setQueryData(['user', variables.id], (old: any) => ({
      ...old,
      ...variables,
    }));
    return { previousUser };
  },
  onError: (_err, _vars, context) => {
    if (context?.previousUser) {
      queryClient.setQueryData(['user', context.previousUser.id], context.previousUser);
    }
  },
  onSettled: (data, error, variables) => {
    queryClient.invalidateQueries(['user', variables.id]);
  },
});
```

9. Toasts, Notifications & UX Feedback
Integrate your toast system inside success/error callbacks:

```ts
import { toast } from "sonner";

useMutation({
  mutationFn: createItem,
  onSuccess: () => toast.success("Item created!"),
  onError: (e) => toast.error(e.message),
});
```

10. Caching & Persistence
Use persistent caching between sessions:

```bash
pnpm i @tanstack/react-query-persist-client
```

```ts
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

const persister = createSyncStoragePersister({ storage: window.localStorage });
persistQueryClient({ queryClient, persister });
```

11. Pagination & Infinite Queries
For infinite scroll:

```ts
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

12. Example Folder Structure
```css
src/
 ├── api/
 │    ├── auth.ts
 │    ├── blog.ts
 │    ├── project.ts
 │    └── index.ts
 ├── hooks/
 │    ├── useAuth.ts
 │    └── useToast.ts
 ├── lib/
 │    └── queryClient.ts
 ├── components/
 │    └── ui/
 └── app/
      └── providers.tsx
```

13. Integrating with Biome
Biome replaces ESLint + Prettier.
Add a few linter rules to catch async or caching issues.

```jsonc
// biome.json
{
  "linter": {
    "rules": {
      "complexity": {
        "useSimplifiedLogicExpression": "error"
      },
      "correctness": {
        "noAsyncPromiseExecutor": "error",
        "noUndeclaredDependencies": "error"
      }
    }
  },
  "formatter": {
    "lineWidth": 100
  }
}
```

14. Common Pitfalls
❌ Fetching in useEffect manually
✅ Always use useQuery

❌ Missing queryKey
✅ Each query must have a unique key

❌ Mutating data without invalidating cache
✅ Call queryClient.invalidateQueries

❌ Navigation inside API functions
✅ Keep fetchers pure and handle navigation in UI logic

15. Final Checklist
Check	Area	Description
✅	Typed queries	Use generics for data/error types
✅	Central API layer	Keep API functions reusable
✅	Toast UX	Always give user feedback
✅	Devtools	Add <ReactQueryDevtools /> in dev
✅	Biome config	Ensure consistent style & linting
✅	Testing	Mock queries with MSW or QueryClient mock
✅	Caching	Use staleTime + gcTime effectively

Example Snippet – CRUD Generator (VSCode)
Add this snippet globally to crud-generator.json:

```json
{
  "TanStack CRUD Hook": {
    "prefix": "rqcrud",
    "body": [
      "import { useQuery, useMutation, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';",
      "import axios, { AxiosError } from 'axios';",
      "import { queryClient } from '@/lib/queryClient';",
      "interface ${TM_FILENAME_BASE/(.*)/${1:/capitalize}/}Type {}",
      "interface ${TM_FILENAME_BASE/(.*)/${1:/capitalize}/}FormType {}",
      "export async function get${TM_FILENAME_BASE/(.*)/${1:/capitalize}/}Fn() {",
      "  return (await axios.get('/api/${TM_FILENAME_BASE}')).data;",
      "}",
      "export const ${TM_FILENAME_BASE/(.*)/${1:/capitalize}/} = {",
      "  Get: { useQuery: () => useQuery({ queryKey: ['${TM_FILENAME_BASE}'], queryFn: get${TM_FILENAME_BASE/(.*)/${1:/capitalize}/}Fn }) },",
      "};"
    ]
  }
}
```

Summary
TanStack Query brings stability, scalability, and clarity to modern React data fetching.
When paired with Axios, TypeScript, and Biome, you gain:

Predictable data flow

Declarative fetching patterns

Instant cache management

Clean, typed, maintainable code

💡 Adopt a consistent query structure early — it scales better than any ad-hoc data fetching strategy.