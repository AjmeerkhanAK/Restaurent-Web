import { configureStore } from "@reduxjs/toolkit";
import foodReducer from "../features/food/foodSlice";
import cartReducer from "../../src/features/card/cardSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    food: foodReducer
  }
});