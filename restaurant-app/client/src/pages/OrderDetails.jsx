import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  Chip
} from "@mui/material";

import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import api from "../services/api";

const statusColors = {
  PLACED: "info",
  CONFIRMED: "primary",
  PREPARING: "warning",
  OUT_FOR_DELIVERY: "secondary",
  DELIVERED: "success",
  CANCELLED: "error"
};

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/orders/${id}`);

        if (active) {
          setOrder(response.data.order);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load order details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (!localStorage.getItem("token")) {
      setError("Please log in to view your order.");
      setLoading(false);
    } else {
      fetchOrder();
    }

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
        <Alert severity="error">{error}</Alert>

        <Button component={Link} to="/login" sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
    );
  }

  if (!order) {
    return <Alert severity="warning">Order not found.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Paper
        elevation={2}
        sx={{ p: 4, mb: 3, textAlign: "center", borderRadius: 3 }}
      >
        {order.orderStatus !== "CANCELLED" ? (
          <CheckCircleOutlineIcon
            color="success"
            sx={{ fontSize: 60, mb: 1 }}
          />
        ) : (
          <Alert severity="error">This order was cancelled.</Alert>
        )}

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {order.orderStatus === "CANCELLED"
            ? "Order Cancelled"
            : "Order Details"}
        </Typography>

        <Typography color="text.secondary">
          Order ID: {order._id}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Chip
            label={order.orderStatus.replaceAll("_", " ")}
            color={statusColors[order.orderStatus] || "default"}
          />
        </Box>

        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Placed on {new Date(order.createdAt).toLocaleString()}
        </Typography>
      </Paper>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Ordered Items
          </Typography>

          {order.items.map((item, index) => (
            <Box key={`${item.food}-${index}`} sx={{ py: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Box>
                  <Typography fontWeight="medium">
                    {item.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    ₹{item.price} × {item.quantity}
                  </Typography>
                </Box>

                <Typography fontWeight="bold">
                  ₹{item.price * item.quantity}
                </Typography>
              </Stack>

              {index < order.items.length - 1 && (
                <Divider sx={{ mt: 2 }} />
              )}
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Total Amount</Typography>

            <Typography variant="h6" color="primary" fontWeight="bold">
              ₹{order.totalAmount}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <LocalShippingOutlinedIcon color="primary" />

            <Typography variant="h6" fontWeight="bold">
              Delivery Address
            </Typography>
          </Stack>

          <Typography>{order.address.fullName}</Typography>
          <Typography>{order.address.phone}</Typography>
          <Typography>{order.address.street}</Typography>
          <Typography>
            {order.address.city} - {order.address.pincode}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Payment Information
          </Typography>

          <Typography>
            Method:{" "}
            {order.paymentMethod === "COD"
              ? "Cash on Delivery"
              : order.paymentMethod}
          </Typography>

          <Typography>
            Payment Status: {order.paymentStatus}
          </Typography>
        </CardContent>
      </Card>

      <Button
        component={Link}
        to="/"
        variant="contained"
        fullWidth
        sx={{ py: 1.5 }}
      >
        Continue Shopping
      </Button>
    </Box>
  );
}