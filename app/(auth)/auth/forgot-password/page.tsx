import { Metadata } from "next"
import ForgotPasswordForm from "./ForgotPasswordForm"

export const metadata: Metadata = {
    title: "ลืมรหัสผ่าน - YANIYAA",
    description:
        "ลืมรหัสผ่าน YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: [
        "ลืมรหัสผ่าน",
        "Forgot Password",
        "Yaniyaa Forgot Password",
        "Better Auth",
        "เว็ปอ่านนิยายออนไลน์ฟรี",
        "ระบบยืนยันตัวตน",
    ],
}

export default function SignInPage() {
    return <ForgotPasswordForm />
}
