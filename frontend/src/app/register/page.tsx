"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/src/modules/auth/api";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async () => {
    try {
      await registerUser({ email, password, name });

      alert("Registered successfully!");

      router.push("/login");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col gap-4 w-80">
        <h2 className="text-xl font-semibold">Register</h2>

        <input
          className="border p-2"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-green-500 text-white p-2"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
}
