
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  
  // ดึงข้อมูล Session จากฝั่ง Server
  const session = await auth.api.getSession({
    headers: await headers() 
  });

  // ถ้ามี Session (Login แล้ว) ให้เตะไปหน้า Dashboard ทันที
  if (session) {
      redirect("/novel");
  }

  return (
    <main className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20">
      {/* --- Shared: Back to Home Button --- */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-8 lg:right-auto lg:left-[50%] lg:ml-8 z-50">
        <Link 
          href="/" 
          className="group flex flex-row-reverse lg:flex-row items-center gap-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground transition-all hover:text-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/30 backdrop-blur-xl shadow-sm transition-all group-hover:border-primary/50 group-hover:bg-primary/10">
            <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          </div>
          <span className="hidden md:block opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            กลับหน้าหลัก
          </span>
        </Link>
      </div>
      

      {/* Render เนื้อหาทั้งหมด (ซ้าย+ขวา) จากแต่ละไฟล์ page.tsx */}
      <div className="flex min-h-screen w-full">
        {children}
      </div>
      
    </main>
  )
}