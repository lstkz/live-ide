import React from 'react';
import ErrorPage from 'src/components/ErrorPage';

export default function Error500() {
  return (
    <ErrorPage
      error="500 ERROR"
      title="Internal Server Error."
      description="Sorry, an unexpected error occurred."
    />
  );
}
