import React from 'react';
import ErrorPage from 'src/components/ErrorPage';

export default function Error404() {
  return (
    <ErrorPage
      error="404 ERROR"
      title="Page not found."
      description="Sorry, we couldn’t find the page you’re looking for."
    />
  );
}
