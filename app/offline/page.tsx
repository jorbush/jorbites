import React from 'react';

const OfflinePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">You are offline</h1>
      <p className="text-lg">Please check your internet connection.</p>
    </div>
  );
};

export default OfflinePage;