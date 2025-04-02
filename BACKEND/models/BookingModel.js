import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    Booking_ID: {
      type: "Number",
      required: true,
    },

    Hall_Name: {
      type: "String",
      required: true,
    },
    Booking_Person_ID: {
      type: "String",
      // required: true,
      default: null
    },
    Booking_Person_Name: {    // New field added
      type: "String",
      required: true,
    },
    User_Email: {  //  New field to store the user's email
      type: String,
      required: true,
    },
    Contact_Number: {    
      type: "Number",
      required: true,
    },
    User_type: {
      type: String,
      enum: ["student", "faculty", "visitor"], 
      required: true,
    },
    Affiliated: {  //jis bhi club ne book kia ha uska department
      type: "String",
      required: true,
    },
    Status: {
      type: "String",
      enum: ["rejected", "approved", "pending"],
      default: "pending",
    },
    Date: {
      type: "Date",
      required: true,
    },
    Time_From: {
      type: "Date",
      required: false,
    },
    Time_To: {
      type: "Date",
      required: false,
    },
    Reason: {
      type: "String",
      required: true,
    },
    Remark: {
      type: "String",
      required: false,
    },
    Price: {
      type: "Number",  // New field to store price of the booking
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("booking", bookingSchema);
