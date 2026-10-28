import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack
} from "@mui/material";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart
} from "../features/cart/cartSlice";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((state) => state.cart.items);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Your cart is empty</Typography>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          Browse Menu
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Cart
      </Typography>

      <Stack spacing={2}>
        {items.map((item) => (
          <Card key={item._id}>
            <CardContent>
              <Typography variant="h6">
                {item.name}
              </Typography>

              <Typography>₹{item.price} per item</Typography>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <Button
                  onClick={() =>
                    dispatch(decreaseQuantity(item._id))
                  }
                >
                  −
                </Button>

                <Typography>{item.quantity}</Typography>

                <Button
                  onClick={() =>
                    dispatch(increaseQuantity(item._id))
                  }
                >
                  +
                </Button>

                <IconButton
                  color="error"
                  onClick={() =>
                    dispatch(removeFromCart(item._id))
                  }
                >
                  Remove
                </IconButton>
              </Stack>

              <Typography fontWeight="bold" sx={{ mt: 1 }}>
                Subtotal: ₹{item.price * item.quantity}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Typography variant="h5" sx={{ mt: 3 }}>
        Total: ₹{total}
      </Typography>

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => navigate("/checkout")}
      >
        Proceed to Checkout
      </Button>
    </Box>
  );
}