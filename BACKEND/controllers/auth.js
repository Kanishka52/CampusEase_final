import asyncHandler from "express-async-handler";
import User from "../models/StudentModel.js";
import { generateToken } from "../config/genrateToken.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js"; //  Import email function


import student from "../models/CollegeStudentModel.js";
import faculty from "../models/FacultyModel.js";

export const verifyuser = async (req, res) => {
  try {
    const { id, type, name } = req.query;

    if (!id || !type || !name) {
      return res.status(400).json({ success: false, message: "Missing user ID, name, or type" });
    }

    console.log("ID:", id);
    console.log("Type:", type);
    console.log("Name:", name);

    let user;

    if (type === "student") {
      user = await student.findOne({ student_id: id, student_name: { $regex: new RegExp(`^${name}$`, "i") } });
      console.log("me hu  student");
    } else if (type === "faculty") {
      user = await faculty.findOne({ faculty_id: id, faculty_name: { $regex: new RegExp(`^${name}$`, "i") } });
      console.log("me hu  faculty");
    } else {
      return res.status(400).json({ success: false, message: "Invalid user type" });
    }
    // console.log("i m   stu");
    // console.log(user);
    
    if (user) {
      console.log(name);
      return res.status(200).json({
        verified: true,
        message: "User verified",
        name: name,
        
      });
    } else {
      // console.log("hhhhhhhh");
      
      return res.status(404).json({
        verified: false,
        message: "ID and name do not match or user not found",
      });
    }

  } catch (error) {
    console.error("Error in verification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




export const registerUser = asyncHandler(async (req, res) => {
  console.log("🔹 Register API called");
  console.log("Request Body:", req.body);

  const { Contact_Number, Applicant_Name, Password, Email, userType, userId } = req.body;
  

  // if (!Applicant_Name || !Contact_Number || !Password || !Email || !userId ||!userType) {
  if (!Applicant_Name || !Contact_Number || !Password || !Email ||!userType) {
    console.log(" Missing required fields");
    return res.status(400).json({ msg: "Please fill all required fields." });
  }

  const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{6,18}$/;
  if (!passwordRegex.test(Password)) {
    return res.status(402).json({ msg: "Password must be 6-18 characters long, include a number and a special character." });
  }

  console.log("debug1");
  
  const contactRegex = /^[0-9]{10}$/;
  if (!contactRegex.test(Contact_Number)) {
    console.log("❌ Invalid Contact Number:", Contact_Number);
    return res.status(409).json({ msg: "Contact Number must be exactly 10 digits." });
  }
  console.log("denug1111111");
  
  const userExist = await User.findOne({ Email });
  if (userExist) {
    console.log(" User already exists:", Email);
    return res.status(401).json({ msg: "User with this email already exists." });
  }
  console.log("debug1q");

  const userExistbyContact = await User.findOne({ Contact_Number });
  if (userExistbyContact) {
    console.log(" User already exists:", Contact_Number);
    return res.status(410).json({ msg: "User with this Contact Number already exists." });
  }
  console.log("debug2");

  
  const salt = await bcrypt.genSalt(10);
  const secpass = await bcrypt.hash(Password, salt);

  console.log("debug3");

  const user = await User.create({
    Contact_Number,
    Applicant_Name,
    Email,
    Password: secpass,
    userType,
    userId
  });

  console.log(" User Created Successfully:", user);

  if (user) {
    console.log(" User registered successfully:", user);

    //  Send Welcome Email
    const emailSubject = "Welcome to Our Platform!";
    // const emailBody = `Hello ${Applicant_Name},\n\nThank you for registering! Your username is: ${User_Name}.\n\nBest Regards,\nTeam CampusEase`;
    const emailBody = `Hello ${Applicant_Name},\n\nThank you for registering!\n\nBest Regards,\nTeam CampusEase`;

    // await sendEmail(Email, emailSubject, emailBody); //temporarily commented out

    res.status(201).json({
      _id: user._id,
      Contact_Number: user.Contact_Number,
      Applicant_Name: user.Applicant_Name,
      Email: user.Email,
      userType: user.userType,
      userId: user.userId,
      token: generateToken(user._id),
    });
  } else {
    console.log(" Failed to create user");
    return res.status(500).json({ msg: "Failed to create user." });
  }
});

export const authUser = asyncHandler(async (req, res) => {
  // const { identifier, Password } = req.body;
  // console.log(identifier);
  
  // const user = await User.findOne({
  //   $or: [{ Email: identifier }, { Contact_Number: identifier }],
  // });

  const { Email, Password } = req.body;

  console.log(`Email: ${Email}`);
  console.log("🔹 Login attempt for:", Email);
  const user = await User.findOne({ Email });
  console.log(user);
  
  if (!user) {
    console.log("here");
    return res.status(401).json({ msg: "Invalid credentials." });
  }

  const passwordCompare = await bcrypt.compare(Password, user.Password);
  if (passwordCompare) {
    res.status(200).json({
      _id: user._id,
      // User_Name: user.User_Name,
      Contact_Number: user.Contact_Number,
      Applicant_Name: user.Applicant_Name,
      Email: user.Email,
      userType: user.userType,
      userId: user.userId,
      token: generateToken(user._id),
    });
  } else {
    return res.status(401).json({ msg: "Invalid credentials." });
  }
});
