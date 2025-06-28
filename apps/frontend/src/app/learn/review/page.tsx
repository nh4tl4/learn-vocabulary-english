'use client';

import { Suspense } from 'react';
import ReviewContent from './ReviewContent';

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
