"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Login from "./login"; // Import the login page

export default function Home() {
  const [showLogin, setShowLogin] = React.useState(false); // State to toggle between Register and Login

  const handleSubmit = async (event) => {
    console.log("Handling submit");
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let username = data.get("username");
    let pass = data.get("pass");
    let firstName = data.get("firstName");
    let secondName = data.get("secondName");
    let address = data.get("address");
    let tel = data.get("tel");

    console.log("Sent username:", username);
    console.log("Sent pass:", pass);
    console.log("Sent firstName:", firstName);
    console.log("Sent secondName:", secondName);
    console.log("Sent address:", address);
    console.log("Sent tel:", tel);

    try {
      const response = await runDBCallAsync(
        `/api/register?username=${username}&pass=${pass}&firstName=${firstName}&secondName=${secondName}&address=${address}&tel=${tel}`
      );

      if (response.success) {
        console.log("Registration successful!");
        //alert("Registration successful! Redirecting to login...");
        setShowLogin(true); // Show login component
      } else {
        console.log("Registration failed:", response.message);
        alert(`Registration failed: ${response.message}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again.");
    }
  };

  async function runDBCallAsync(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  }

  // If `showLogin` is true, render the Login component
  if (showLogin) {
    return <Login />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="secondName"
            label="Second Name"
            name="secondName"
            autoComplete="family-name"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="address"
            label="Address"
            name="address"
            autoComplete="street-address"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Email Address"
            name="username"
            autoComplete="username"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="pass"
            label="Password"
            type="password"
            id="pass"
            autoComplete="current-password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="tel"
            label="Telephone Number"
            type="tel"
            id="tel"
            autoComplete="tel"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
