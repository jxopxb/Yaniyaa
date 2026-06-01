import { Metadata } from "next"
import ReadingHistoryPage from "./history"
import Navbar from "@/app/(landing)/Navbar"

export const metadata: Metadata = {
    title: "ประวัติการอ่านนิยาย — YANIYAA",
    description:
        "ประวัติการอ่านนิยาย YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: [
        "ประวัติการอ่านนิยาย",
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
            <ReadingHistoryPage />
        </>
    )
}