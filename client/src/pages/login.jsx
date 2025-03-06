import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { Toaster, toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", server: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "", server: "" };
    let valid = true;

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      toast.error("Password must be at least 8 characters long");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const formData = { email, password };

    try {
      const action = await dispatch(login(formData));

      if (login.fulfilled.match(action)) {
        setErrors({ email: "", password: "", server: "" });
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        const errorMessage =
          action.payload || "Login failed. Please try again.";
        toast.error(errorMessage);
        setErrors((prev) => ({ ...prev, server: errorMessage }));
      }
    } catch (err) {
      toast.error("An error has occurred. Please try again later.");
      setErrors((prev) => ({
        ...prev,
        server: "An error has occurred. Please try again later.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Toaster richColors />
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
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={Boolean(errors.password)}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ textDecoration: "none" }}>
            Register
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
