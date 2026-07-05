---
name: create-react-component
description: Standard template for creating a responsive Tailwind React component and API hook.
---

# React Component and API Template

Use this approach when creating a simple component that fetches and displays data.

1. **API function (with Axios):** `src/api/services.ts`
```typescript
import axiosInstance from './axiosInstance';

export const fetchServices = async () => {
  const response = await axiosInstance.get('/services');
  return response.data; // Data structure might vary based on the backend
};
```

2. **React Component (Tailwind + TanStack Query):** `src/components/ServiceList.tsx`
```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchServices } from '../api/services';

const ServiceList: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices
  });

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">An error occurred!</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((service: any) => (
          <div key={service.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg">{service.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-blue-600 font-bold">{service.price} ₼</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceList;
```

**Note:**
- Always communicate the `isLoading` and `isError` states to the user in the UI.
- In your design, start with a 1-column layout for mobile screens (`grid-cols-1`), and increase for larger screens (`md:grid-cols-2`).
