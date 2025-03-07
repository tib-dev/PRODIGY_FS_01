import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../store/authSlice"; // Ensure the correct path

const Unauthorized = () => {
  const user = useSelector(selectUser);

  return (
    <div>
      <h1>Hello, {user?.username || "Guest"}</h1>
      <h1>Unauthorized</h1>
      <p>You are not authorized to access this page.</p>
      <p>Please contact your system administrator: support@auth.com</p>
    </div>
  );
};

export default Unauthorized;
