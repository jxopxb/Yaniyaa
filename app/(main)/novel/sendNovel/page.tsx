import { Metadata } from "next"
import Navbar from "@/app/(landing)/Navbar"
import SendNovel from "./sendNovel"

export const metadata: Metadata = {
    title: "สร้างนิยาย — YANIYAA",
    description:
        "สร้างนิยาย YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: [
        "สร้างนิยาย",
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
            <SendNovel />
        </>
    )
}