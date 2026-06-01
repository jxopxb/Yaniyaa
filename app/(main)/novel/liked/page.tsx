import { Metadata } from "next"
import LikedNovelsPage from "./liked"
import Navbar from "@/app/(landing)/Navbar"

export const metadata: Metadata = {
    title: "รายการโปรด — YANIYAA",
    description:
        "รายการโปรด YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: [
        "รายการโปรด",
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
            <LikedNovelsPage />
        </>
    )
}