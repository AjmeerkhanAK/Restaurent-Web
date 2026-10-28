import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";

import api from "../services/api";
import { clearCart } from "../features/cart/cartSlice";

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((state) => state.cart.items);
  const token = useSelector((state) => state.auth?.token);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    pincode: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleChange = (event) => {
    setAddress({
      ...address,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token && !localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/orders", {
        items: items.map((item) => ({
          food: item._id,
          quantity: item.quantity
        })),
        address,
        paymentMethod: "COD"
      });

      dispatch(clearCart());

      navigate(`/orders/${response.data.order._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not place your order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, mx: "auto", p: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {[
        { name: "fullName", label: "Full Name" },
        { name: "phone", label: "Phone Number" },
        { name: "street", label: "Street Address" },
        { name: "city", label: "City" },
        { name: "pincode", label: "PIN Code" }
      ].map((field) => (
        <TextField
          key={field.name}
          fullWidth
          required
          label={field.label}
          name={field.name}
          value={address[field.name]}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      ))}

      <TextField
        fullWidth
        select
        label="Payment Method"
        value="COD"
        disabled
        sx={{ mb: 2 }}
      >
        <MenuItem value="COD">Cash on Delivery</MenuItem>
      </TextField>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Order Total: ₹{total}
      </Typography>

      <Button
        fullWidth
        variant="contained"
        type="submit"
        disabled={loading || items.length === 0}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </Button>
    </Box>
  );
}