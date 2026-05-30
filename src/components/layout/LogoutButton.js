"use client";

import { LogOut } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const auth = getAuth(firebaseApp);
      await signOut(auth);
      
      await fetch("/api/auth/logout", { method: "POST" });
      
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
    >
      <LogOut size={18} />
      Log out
    </button>
  );
}
