---
name: create-react-form
description: Template for building robust React forms using React Hook Form, Zod validation, and Tailwind.
---

# React Form Component Template (Mobile-First)

When asked to create a form (e.g., Login, Booking, Profile Update), use this standard approach:

### 1. Zod Schema Validation
Always define the validation schema outside the component using `zod` to guarantee strict type safety.
```typescript
import { z } from "zod";

export const myFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Must be at least 6 characters"),
});

export type MyFormValues = z.infer<typeof myFormSchema>;
```

### 2. Form Setup (React Hook Form)
Connect the Zod schema to React Hook Form using `@hookform/resolvers/zod`.
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<MyFormValues>({
  resolver: zodResolver(myFormSchema)
});
```

### 3. UI and Mobile-First Rules
- **No Raw HTML inputs:** Always use the centralized `Input.tsx` and `Button.tsx` from `src/components/ui/`.
- **Error Messages:** Explicitly display validation errors under each input field in red (`text-red-500`).
- **Touch Targets:** Form inputs and submit buttons must have a minimum height of `h-11` or `h-12` for mobile usability.
- **Async State:** Ensure the submit `<Button loading={isPending} disabled={isPending}>` reflects the API request status (via TanStack Query mutation).
