import { Navigate, Outlet } from 'react-router-dom';

function Forbidden() {
  return (
    <div>
      <h1>403 - Forbidden</h1>
      <p>You do not have permission to view this page.</p>
    </div>
  );
}

export default function ProtectedRoute({ role }) {
  const key = localStorage.getItem('user');
  const user = key ? JSON.parse(key) : null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && !user[role]) {
    return <Forbidden />;
  }

  return <Outlet />;
}
