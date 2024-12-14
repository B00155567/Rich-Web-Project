"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import validator from "email-validator";
import Login from "./login"; // Import the login page

export default function Home() {
  const [showLogin, setShowLogin] = React.useState(false); // State to toggle between Register and Login
  const [open, setOpen] = React.useState(false); // State to manage dialog visibility
  const [errorHolder, setErrorHolder] = React.useState(""); // State to store error messages

  const handleClose = () => setOpen(false); // Close the dialog

  const validateForm = (data) => {
    let errorMessage = "";

    const username = data.get("username");
    const pass = data.get("pass");
    const firstName = data.get("firstName");
    const secondName = data.get("secondName");
    const address = data.get("address");
    const tel = data.get("tel");

    if (!validator.validate(username)) {
      errorMessage += "Invalid email format. ";
    }
    if (!pass || pass.length < 6) {
      errorMessage += "Password must be at least 6 characters long. ";
    }
    if (!firstName || !secondName || !address || !tel) {
      errorMessage += "All fields are required. ";
    }

    return errorMessage;
  };

  const handleSubmit = async (event) => {
    console.log("Handling submit");
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    // Validate form data
    const errorMessage = validateForm(data);

    if (errorMessage.length > 0) {
      setErrorHolder(errorMessage);
      setOpen(true); // Show dialog with error messages
      return;
    }

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
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{"Error"}</DialogTitle>
          <DialogContent>
            <DialogContentText>{errorHolder}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
