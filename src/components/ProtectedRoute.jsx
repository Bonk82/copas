import { Navigate } from "react-router-dom";
import { useSupa } from "../context/SupabaseContext";

// eslint-disable-next-line react/prop-types
export const ProtectedRoute = ({children}) => {
  const { loading,usuario } = useSupa();


  if (loading) return <h1>Loading</h1>;

  if (!usuario) return <Navigate to="/login" />;

  return <>{children}</>
}
