import { Metadata } from "next"
import MyNovelsPage from "./my-novels"
import Navbar from "../(landing)/Navbar"

export const metadata: Metadata = {
    title: "นิยายของฉัน — YANIYAA",
    description:
        "นิยายของฉัน YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: [
        "นิยายของฉัน",
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
            <MyNovelsPage />
        </>
    )
}