import { isRouteErrorResponse, useRouteError } from 'react-router';

import { getErrorMessage } from '@/shared/api/api-error';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : getErrorMessage(error, 'This page could not be loaded.');

  return (
    <main className="route-error">
      <p className="eyebrow">Route error</p>
      <h1>We hit an unexpected page error.</h1>
      <p>{message}</p>
      <a className="button-link" href="/users">
        Return to users
      </a>
    </main>
  );
}
