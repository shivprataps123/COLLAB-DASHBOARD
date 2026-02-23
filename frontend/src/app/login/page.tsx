"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/src/modules/auth/api";
import { createDashboard } from "@/src/modules/dashboard/api";
import { createWorkspace, getWorkspaces } from "@/src/modules/workspace/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // const handleLogin = async () => {
  //   try {
  //     const res = await loginUser({ email, password });
  //     localStorage.setItem("token", res.data.token);

  //     // 1️⃣ Get workspaces
  //     const wsRes = await getWorkspaces();
  //     let workspace;

  //     if (wsRes.data.length === 0) {
  //       // 2️⃣ Create workspace if none exists
  //       workspace = await createWorkspace("My Workspace");
  //     } else {
  //       workspace = wsRes.data[0];
  //     }

  //     // 3️⃣ Create dashboard
  //     const dashRes = await createDashboard(
  //       "Main Dashboard",
  //       workspace.data?.id || workspace.id
  //     );

  //     // 4️⃣ Redirect to real dashboard ID
  //     router.push(`/dashboard/${dashRes.data.id}`);
  //   } catch (err) {
  //     alert("Login failed");
  //   }
  // };

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);

      // Just redirect to dashboard list page
      router.push("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };


  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col gap-4 w-80">
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
          className="bg-blue-500 text-white p-2"
          onClick={handleLogin}
        >
          Login
        </button>
        <p
          className="text-sm text-blue-500 cursor-pointer text-center"
          onClick={() => router.push("/register")}
        >
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}
