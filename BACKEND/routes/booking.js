import express from "express";
import {
  createBooking,
  deleteBooking,
  getAdminBookings,
  getAllBookings,
  getAvailableTimes,
  getBooking,
  getUserBookings,
  updateBooking,
  verifyuser,
} from "../controllers/booking.js";
import { protectUserRoutes } from "../middleware/authmiddleware.js";
import { protectAdminRoutes } from "../middleware/adminVerify.js";

const router = express.Router();

// General routes
// AVAILABLE SLOTS FOR PARTICULAR HALL
router.get("/availableslots", getAvailableTimes);
// User Verification Route
router.get("/verifyuser", verifyuser);

// GET User Bookings (Protected)
router.get("/userBookings", protectUserRoutes, getUserBookings);

// Admin Routes (Protected)
router.post("/createBooking", protectUserRoutes, createBooking); 
// router.post("/createBooking", protectAdminRoutes, createBooking); // Only admin can create bookings
router.get("/allBookings", getAllBookings); // Only admin can view all bookings
router.get("/adminBookings", protectAdminRoutes, getAdminBookings); // Only admin can view admin bookings
router.delete("/deleteBooking", protectAdminRoutes, deleteBooking); // Only admin can delete bookings
router.patch("/updateBooking", protectAdminRoutes, updateBooking); // Only admin can update bookings

// GET Booking by ID (Protected)
router.get("/:id", protectUserRoutes, getBooking);

export default router;
