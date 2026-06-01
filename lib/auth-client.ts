import { createAuthClient } from "better-auth/react";
// 🚨 [แก้ไขจุดนี้]: เปลี่ยนจาก "better-auth/plugins" เป็น "better-auth/client/plugins"
import { adminClient } from "better-auth/client/plugins"; 

export const authClient = createAuthClient({
  baseUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    adminClient() // 🔓 [แก้ไขจุดนี้]: เอาคอมเมนต์ออก เพื่อให้หน้าบ้านรู้จักฟิลด์ role อัตโนมัติ!
  ]
});

export const { signIn, signUp, signOut, useSession } = authClient;