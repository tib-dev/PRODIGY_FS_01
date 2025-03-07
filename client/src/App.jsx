import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Unauthorized from "./pages/Unauthorized";

// Helper function to check authentication
const getTokenFromCookies = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("accessToken="))
    ?.split("=")[1];
};

function App() {
  const user = useSelector((state) => state.auth.user); // Access user from Redux store

  const { accessToken } = useSelector((state) => state.auth);
  const tokenInCookies = getTokenFromCookies();

  // Protected Route Component
  const ProtectedRoute = ({ element }) => {
    return accessToken || tokenInCookies ? (
      element
    ) : (
      <Navigate to="/login" replace />
    );
  };

  // Public Route Component (Prevents access when logged in)
  const PublicRoute = ({ element }) => {
    return !accessToken && !tokenInCookies ? (
      element
    ) : (
      <Navigate to="/" replace />
    );
  };

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute element={<Home />} />} />

      {/* Conditionally render the Admin route based on the user role */}
      {user?.user_role === "admin" ? (
        <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />
      ) : (
        <Route
          path="/denied"
          element={<ProtectedRoute element={<Unauthorized />} />}
        />
      )}

      <Route path="/login" element={<PublicRoute element={<Login />} />} />
      <Route
        path="/register"
        element={<PublicRoute element={<Register />} />}
      />
    </Routes>
  );
}

export default App;
