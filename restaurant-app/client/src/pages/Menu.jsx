import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";

import { fetchFoods } from "../features/food/foodSlice";
import { addToCart } from "../features/cart/cartSlice";

export default function Menu() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(
    (state) => state.food
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const filters = {};

    if (search.trim()) filters.search = search.trim();
    if (category) filters.category = category;

    dispatch(fetchFoods(filters));
  }, [dispatch, search, category]);

  const categories = [
    "Biryani",
    "Pizza",
    "Burger",
    "Starters",
    "Drinks",
    "Desserts"
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Our Restaurant Menu
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Fresh food, delicious taste.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={7}>
          <TextField
            fullWidth
            label="Search food"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={5}>
          <TextField
            select
            fullWidth
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>

            {categories.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {loading && <CircularProgress />}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && items.length === 0 && (
        <Alert severity="info">No food items found.</Alert>
      )}

      <Grid container spacing={3}>
        {!loading &&
          items.map((food) => (
            <Grid item xs={12} sm={6} md={4} key={food._id}>
              <Card sx={{ height: "100%" }}>
                {food.image && (
                  <CardMedia
                    component="img"
                    height="190"
                    image={food.image}
                    alt={food.name}
                  />
                )}

                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {food.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ my: 1 }}
                  >
                    {food.description}
                  </Typography>

                  <Typography variant="h6" color="primary">
                    ₹{food.price}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={!food.isAvailable}
                    onClick={() => dispatch(addToCart(food))}
                  >
                    {food.isAvailable ? "Add to Cart" : "Unavailable"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}