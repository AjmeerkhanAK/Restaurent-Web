import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from "@mui/material";

import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderDetails from "./pages/OrderDetails";

export default function App() {
  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Avengers Restaurant
          </Typography>

          <Button color="inherit" component={Link} to="/">
            Menu
          </Button>

          <Button color="inherit" component={Link} to="/cart">
            Cart
          </Button>

          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/orders/:id"
            element={<OrderDetails />}
          />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}