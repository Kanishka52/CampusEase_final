
import bcrypt from "bcrypt";

const plainPassword = "kanishk@123"; // ← put your new password here
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }
  console.log("Hashed password:", hash);
});