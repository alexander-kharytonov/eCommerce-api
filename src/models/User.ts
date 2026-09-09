import { hash } from "bcryptjs";
import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { responseOptions } from "./transform";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: responseOptions,
    toObject: responseOptions,
  },
);

export type User = InferSchemaType<typeof userSchema>;

userSchema.pre("save", async function hashPassword(this: HydratedDocument<User>) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 12);
  }
});

export const UserModel = model<User>("User", userSchema);
