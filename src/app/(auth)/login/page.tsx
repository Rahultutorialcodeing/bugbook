import { Metadata } from "next";
import React from "react";
import LoginForm from "./LoginForm";
import Link from "next/link";
import LoginImag from "@/assets/login-image.jpg";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login",
};

export default function Login() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">Login to bugbook</h1>
          <div className="space-y-5">
            <LoginForm />
            <Link
              href={"/signup"}
              className="block text-center hover:underline"
            >
              Don&apos;t have account? Sign up
            </Link>
          </div>
        </div>
        <Image
          src={LoginImag}
          alt="image nit found"
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
}
