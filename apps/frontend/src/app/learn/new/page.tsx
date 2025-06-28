'use client';

import { Suspense } from 'react';
import LearnNewContent from './LearnNewContent';

export default function LearnNewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LearnNewContent />
    </Suspense>
  );
}
