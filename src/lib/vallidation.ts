import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const signupSchema = z.object({
  email: requiredString.email("Invalid email"),
  username: requiredString.regex(
    /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim,
    "Only letters, number, - and _ allowed",
  ),
  password: requiredString.min(8, "Must be at least 8 characters"),
});

export type SignupValues = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type loginValues = z.infer<typeof loginSchema>;
