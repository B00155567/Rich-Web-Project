"use client";
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Home() {
  const handleSubmit = async (event) => {
    console.log("handling submit");
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let email = data.get("email");
    let pass = data.get("pass");
    let firstName = data.get("firstName");
    let secondName = data.get("secondName");
    let address = data.get("address");
    let tel = data.get("tel");
    console.log("Sent email:" + email);
    console.log("Sent pass:" + pass);
    console.log("Sent firstName:" + firstName);
    console.log("Sent secondName:" + secondName);
    console.log("Sent address:" + address);
    console.log("Sent tel:" + tel);

    const response = await runDBCallAsync(
      `/api/register?email=${email}&pass=${pass}&firstName=${firstName}&secondName=${secondName}&address=${address}&tel=${tel}`
    );
    if (response.success) {
      console.log("Registration successful!");
    } else {
      console.log("Registration failed:", response.message);
    }
  };

  async function runDBCallAsync(url) {
    const res = await fetch(url);
    const data = await res.json();
    return data;
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
