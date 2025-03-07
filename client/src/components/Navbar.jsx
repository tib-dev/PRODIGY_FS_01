import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../store/authSlice";

export default function ButtonAppBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser); // User information from Redux
  const accessToken = useSelector((state) => state.auth.accessToken); // Access token from Redux

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap(); // Ensure logout completes

      // Clear cookies for accessToken and refreshToken
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      navigate("/login"); // Redirect to login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Menu Icon (For Mobile) */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Home Link */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
            }}
          >
            Home
          </Typography>

          {/* Authentication Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            {accessToken ? (
              <>
                <Button component={Link} to="/admin" color="inherit">
                  Admin Dashboard
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
                {user && (
                  <Avatar
                    alt={user.username || "User"}
                    src={user.avatar || "/static/images/avatar/default.png"}
                    sx={{ ml: 2, width: 40, height: 40 }}
                  />
                )}
              </>
            ) : (
              <>
                <Button component={Link} to="/login" color="inherit">
                  Login
                </Button>
                <Button component={Link} to="/register" color="inherit">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
