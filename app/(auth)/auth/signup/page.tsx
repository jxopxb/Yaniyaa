import { Metadata } from "next"
import SignupForm from "./SignupForm"

export const metadata: Metadata = {
    title: "สมัครสมาชิก — YANIYAA",
    description:
        "สมัครสมาชิก YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: [
        "สมัครสมาชิก",
        "Sign Up",
        "สร้างบัญชี",
        "Yaniyaa Signup",
        "Better Auth",
        "ระบบสมาชิก",
    ],
}

export default function SignUpPage() {
    return <SignupForm />
}