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
import Register from './pages/register';
import Login from './pages/login';
import Cart from './pages/cart';
import Admin from './pages/admin';

export default function MyApp() {
  const [showLogin, setShowLogin] = useState(false);
  const [showDash, setShowDash] = useState(false);
  const [showFirstPage, setShowFirstPage] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [data, setData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [role, setRole] = useState(null);
  const [temperature, setTemperature] = useState(null);

  // Fetch temperature on component load
  useEffect(() => {
    async function fetchTemperature() {
      try {
        const response = await fetch("/api/getWeather");
        if (!response.ok) {
          throw new Error(`Failed to fetch temperature: ${response.status}`);
        }
        const result = await response.json();
        setTemperature(result.temp);
      } catch (error) {
        console.error("Error fetching temperature:", error);
      }
    }
    fetchTemperature();
  }, []);

  useEffect(() => {
    async function fetchSessionData() {
      try {
        const sessionResponse = await fetch("/api/getData");
        const sessionResult = await sessionResponse.json();

        if (sessionResult && sessionResult.role) {
          console.log("User role:", sessionResult.role);
          setRole(sessionResult.role); // Set the role based on the session
        } else {
          console.log("No user session found");
          setRole(null); // Reset role if no session is found
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    }
    fetchSessionData();
  }, []);

  useEffect(() => {
    fetch("/api/getProducts")
      .then((res) => res.json())
      .then((data) => {
        setData(data || []);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  async function fetchCartItems() {
    try {
      const response = await fetch("/api/getCart");
      const result = await response.json();
      if (result.success) {
        setCartItems(result.cart || []);
      } else {
        console.error("Failed to fetch cart items.");
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  }

  async function addToCart(productName) {
    try {
      const sessionResponse = await fetch("/api/getData");
      const sessionResult = await sessionResponse.json();

      if (sessionResult && sessionResult.email) {
        console.log("User is logged in:", sessionResult.email);

        const response = await fetch(`/api/putInCart?pname=${encodeURIComponent(productName)}`);
        const result = await response.json();

        if (result.success) {
          alert("Item added to cart successfully!");
        } else {
          alert(result.message || "Failed to add item to cart.");
        }
      } else {
        alert("Please log in to add items to the cart.");
        runShowLogin();
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("An error occurred. Please try again.");
    }
  }

  function runShowLogin() {
    resetViews();
    setShowLogin(true);
  }

  function runShowDash() {
    resetViews();
    setShowDash(true);
  }

  function runShowFirst() {
    resetViews();
    setShowFirstPage(true);
  }

  function runShowRegister() {
    resetViews();
    setShowRegister(true);
  }

  function runShowAdmin() {
    if (role === "admin") {
      resetViews();
      setShowAdmin(true);
    } else {
      alert("Access denied. Only admin users can access this page.");
    }
  }

  function runShowCart() {
    resetViews();
    setShowCart(true);
    fetchCartItems();
  }

  function resetViews() {
    setShowFirstPage(false);
    setShowLogin(false);
    setShowDash(false);
    setShowRegister(false);
    setShowCart(false);
    setShowAdmin(false);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Krispy Kreme
          </Typography>
          {temperature !== null && (
            <Typography sx={{ mx: 2 }}>Temperature: {temperature}°C</Typography>
          )}
          <Button color="inherit" onClick={runShowFirst}>Home</Button>
          <Button color="inherit" onClick={runShowLogin}>Login</Button>
          <Button color="inherit" onClick={runShowRegister}>Register</Button>
          <Button color="inherit" onClick={runShowDash}>Dashboard</Button>
          <Button color="inherit" onClick={runShowCart}>Cart</Button>
          {role === "admin" && (
            <Button color="inherit" onClick={runShowAdmin}>
              Admin Panel
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {showFirstPage && (
        <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
          Shopping Homepage wooop
        </Box>
      )}
      {showLogin && <Login runShowDash={runShowDash} setRole={setRole} />}
      {showRegister && <Register />}
      {showDash && data && Array.isArray(data) && (
        <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
          {data.map((item, i) => (
            <div style={{ padding: "20px" }} key={i}>
              Unique ID: {item._id}
              <br />
              {item.pname} - ${item.price}
              <br />
              <Button onClick={() => addToCart(item.pname)} variant="outlined">Add to cart</Button>
            </div>
          ))}
        </Box>
      )}
      {showAdmin && <Admin />}
      {showCart && <Cart cartItems={cartItems} />}
    </Box>
  );
}
