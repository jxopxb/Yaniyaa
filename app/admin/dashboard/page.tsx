import { Metadata } from "next"
import AdminDashboardPage from "./dashboard"
import Navbar from "@/app/(landing)/Navbar"

export const metadata: Metadata = {
    title: "แอดมิน — YANIYAA",
    description:
        "แอดมิน YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: [
        "แอดมิน",
        "my novels",
        "บัญชีของฉัน", 
        "Yaniyaa My Novels",
        "Better Auth",
        "ระบบสมาชิก",
    ],
}

export default function SignUpPage() {
    return (
        <>
            <Navbar />
            <AdminDashboardPage />
        </>
    )
}