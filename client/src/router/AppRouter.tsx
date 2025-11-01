import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Placeholder = lazy(async () => ({ default: () => <div>App loading...</div> }));

export const AppRouter = (): JSX.Element => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/*" element={<Placeholder />} />
    </Routes>
  </Suspense>
);
