import { Metadata } from "next"
import LoginForm from "./LoginForm"

export const metadata: Metadata = {
    title: "เข้าสู่ระบบ — YANIYAA",
    description:
        "เข้าสู่ระบบ YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: [
        "เข้าสู่ระบบ",
        "Sign In",
        "Yaniyaa Login",
        "Better Auth",
        "เว็ปอ่านนิยายออนไลน์ฟรี",
        "ระบบยืนยันตัวตน",
    ],
}

export default function SignInPage() {
    return <LoginForm />
}
