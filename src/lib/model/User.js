import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
