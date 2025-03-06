import React, { useState } from "react";
import { TextField, Button, Box, Typography, Container } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../store/registerSlice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.register); // Get loading & error state

  const [formData, setFormData] = useState({
    username: "",
    user_first_name: "",
    user_last_name: "",
    email: "",
    password: "",
    user_role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(register(formData));
      if (register.fulfilled.match(resultAction)) {
        navigate("/login"); // Redirect after successful registration
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          textAlign: "center",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="First Name"
            name="user_first_name"
            margin="normal"
            value={formData.user_first_name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            name="user_last_name"
            margin="normal"
            value={formData.user_last_name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="User Role"
            name="user_role"
            margin="normal"
            value={formData.user_role}
            onChange={handleChange}
            required
          />

          {/* Show loading state */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>

        {/* Show error message if registration fails */}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ textDecoration: "none" }}>
            Login
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Register;
