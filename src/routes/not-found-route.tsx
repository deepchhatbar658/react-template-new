import { Link } from 'react-router';

export function NotFoundRoute() {
  return (
    <main className="route-error">
      <p className="eyebrow">404</p>
      <h1>This page does not exist.</h1>
      <p>Check the address or return to the user workspace.</p>
      <Link className="button-link" to="/users">
        Go to users
      </Link>
    </main>
  );
}
