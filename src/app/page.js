"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useState, useEffect } from "react";
import Register from './pages/register'; // Import the Register component
import Login from './pages/login'; // Import the Login component

// Function to handle adding a product to the cart
async function putInCart(productName) {
  try {
    // Step 1: Check if the user is logged in by fetching session data
    const sessionResponse = await fetch("/api/getData");
    const sessionResult = await sessionResponse.json();

    if (sessionResult && sessionResult.email) {
      console.log("User is logged in:", sessionResult.email);

      // Step 2: If logged in, proceed to add the product to the cart
      const response = await fetch(`/api/putInCart?pname=${encodeURIComponent(productName)}`);
      const result = await response.json();

      if (result.success) {
        alert("Item added to cart successfully!");
      } else {
        alert(result.message || "Failed to add item to cart.");
      }
    } else {
      // Step 3: If not logged in, alert the user and redirect to the login page
      alert("Please log in to add items to the cart.");
      runShowLogin();
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    alert("An error occurred. Please try again.");
  }
}


export default function MyApp() {
  const [showLogin, setShowLogin] = useState(false);
  const [showDash, setShowDash] = useState(false);
  const [showFirstPage, setShowFirstPage] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch the products from the API
    fetch("/api/getProducts")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  function runShowLogin() {
    setShowFirstPage(false);
    setShowLogin(true);
    setShowDash(false);
    setShowRegister(false);
  }

  function runShowDash() {
    setShowFirstPage(false);
    setShowLogin(false);
    setShowDash(true);
    setShowRegister(false);
  }

  function runShowFirst() {
    setShowFirstPage(true);
    setShowLogin(false);
    setShowDash(false);
    setShowRegister(false);
  }

  function runShowRegister() {
    setShowFirstPage(false);
    setShowLogin(false);
    setShowDash(false);
    setShowRegister(true);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MyApp
          </Typography>
          <Button color="inherit" onClick={runShowFirst}>First</Button>
          <Button color="inherit" onClick={runShowLogin}>Login</Button>
          <Button color="inherit" onClick={runShowDash}>Dashboard</Button>
          <Button color="inherit" onClick={runShowRegister}>Register</Button>
        </Toolbar>
      </AppBar>

      {showFirstPage && (
        <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
          This is a very basic application. This has a bar across the top and this box! How this app works is by creating two boxes. They are hidden in the background of the page. It is only when a user clicks one of the buttons, we change the "state" from hidden (false) to show (true).
        </Box>
      )}
      {showLogin && (
        <Login runShowDash={runShowDash} /> // Pass runShowDash as a prop
      )}
      {showDash && data && Array.isArray(data) && (
        <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
          {data.map((item, i) => (
            <div style={{ padding: "20px" }} key={i}>
              Unique ID: {item._id}
              <br />
              {item.pname} - ${item.price}
              <br />
              <Button onClick={() => putInCart(item.pname)} variant="outlined">Add to cart</Button>
            </div>
          ))}
        </Box>
      )}
      {showRegister && (
        <Register /> // Render the Register component
      )}
    </Box>
  );
}

