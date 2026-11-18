import { Navigate } from 'react-router-dom';

/** The foundation /account page is the one account page; /me simply forwards there. */
export default function MePage() {
  return <Navigate to="/account" replace />;
}
