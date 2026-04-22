import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    roles: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: String,
      trim: true,
      default: "",
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    createdFrom: {
      type: String,
      enum: ["public", "internal"],
      default: "public",
    },
    passwordChangeRequest: {
      type: Boolean,
      default: false,
    },
    passwordChangeRequestAt: {
      type: Date,
      default: null,
    },
    passwordChangeRequestMessage: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

authSchema.index({ createdAt: -1 });

authSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

authSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", authSchema);

export default User;
