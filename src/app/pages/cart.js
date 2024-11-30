"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]); // State to store cart items
  const [loading, setLoading] = useState(true); // State for loading 

  // Fetch cart items from the API
  useEffect(() => {
    async function fetchCartItems() {
      console.log("Fetching cart items...");
      try {
        const response = await fetch("/api/getCart");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API response:", result);

        if (result.success) {
          setCartItems(result.cart || []);
          console.log("Cart items set:", result.cart);
        } else {
          console.error("Failed to fetch cart items:", result.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setLoading(false);
        console.log("Loading set to false");
      }
    }

    fetchCartItems();
  }, []);

  console.log("Rendered cartItems:", cartItems);

  // Function to decrease the quantity of an item
  async function decreaseQuantity(itemId) {
    try {
      const response = await fetch(`/api/decreaseQuantity?id=${itemId}`, {
        method: "PATCH", // Use PATCH to update quantity
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Decrease response:", result);

      if (result.success) {
        // Update the cart items state
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item
          ).filter((item) => item.quantity > 0) // Remove items with quantity 0
        );
        alert("Item quantity decreased!");
      } else {
        console.error("Failed to decrease item quantity:", result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error decreasing item quantity:", error);
      alert("An error occurred while decreasing the item quantity. Please try again.");
    }
  }

  // Function to handle checkout
  async function handleCheckout() {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert("Order confirmed! Check your email for the details.");
        setCartItems([]); // Clear the cart after checkout
      } else {
        console.error("Checkout failed:", result.error || "Unknown error");
        alert("Checkout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  }

  return (
    <Box component="section" sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Your Cart
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : cartItems.length > 0 ? (
        <>
          {cartItems.map((item) => (
            <Box
              key={item._id}
              sx={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                p: 2,
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>
                <strong>Product:</strong> {item.pname} <br />
                <strong>Quantity:</strong> {item.quantity}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={() => decreaseQuantity(item._id)}
              >
                Remove 1
              </Button>
            </Box>
          ))}
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            sx={{ mt: 3 }}
          >
            Checkout
          </Button>
        </>
      ) : (
        <Typography>Your cart is empty.</Typography>
      )}
    </Box>
  );
}
