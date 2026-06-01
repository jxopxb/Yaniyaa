import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins"
import { prisma } from "@/lib/prisma"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },

    // เพิ่มการตั้งค่าสำหรับผู้ให้บริการโซเชียล
    socialProviders: {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    },


    // เพิ่มส่วนนี้เพื่ออนุญาตให้เชื่อมบัญชีอัตโนมัติเมื่ออีเมลตรงกัน
    account: {
        accountLinking: {
            enabled: true, 
            trustedProviders: ["google", "github", "line", "facebook"], 
            // ยอมรับให้อีเมลจาก 4 เจ้านี้ผูกกับบัญชีหลักได้
        }
      },
    plugins: [admin()],
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
})
