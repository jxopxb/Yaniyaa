import { Metadata } from "next"
import EditNovelPage from "./edit"
import Navbar from "@/app/(landing)/Navbar"

export const metadata: Metadata = {
    title: "แก้ไขนิยาย — YANIYAA",
    description:
        "แก้ไขนิยาย YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: [
        "แก้ไขนิยาย",
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
            <EditNovelPage />
        </>
    )
}