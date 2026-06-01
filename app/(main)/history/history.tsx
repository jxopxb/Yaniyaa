import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, BookOpen, Trash2, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ReadingHistoryPage() {
  // 1. [ดึงสิทธิ์ตัวตนจริง]: ตรวจสอบคุกกี้ว่าผู้ใช้คนนี้ล็อกอินอยู่ไหม
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // 2. ป้องกันข้อมูลกำพร้า: ถ้าไม่ได้ล็อกอิน ดีดกลับหน้าล็อกอินทันที สไตล์เว็บบอร์ดลักชูรี
  // 🟢 [แก้ไข]: เปลี่ยนพาธให้ไปที่ /login เหมือนกับหน้าอื่นๆ ในระบบมึง
  if (!session || !session.user) {
    redirect("/login");
  }

  // ได้ ID บัญชีจริงที่มีตัวตนอยู่บนฐานข้อมูล Neon แน่นอน
  const currentUserId = session.user.id;

  // 3. ดึงข้อมูลประวัติการอ่านทั้งหมดของ User คนนี้จาก Neon
  const histories = await prisma.readingHistory.findMany({
    where: { userId: currentUserId }, 
    include: {
      novel: true,
      chapter: true,
    },
    orderBy: {
      updatedAt: "desc", // เอาเรื่องที่เพิ่งอ่านล่าสุดขึ้นก่อน
    },
  });

  return (
    // pt-40 เพื่อรักษาระดับหลบ Fixed Navbar ให้เท่ากันทั้งแอป Yaniyaa
    <main className="min-h-screen bg-background pb-40 pt-40 relative overflow-hidden selection:bg-primary/10 dark:selection:bg-primary/20">
      
      {/* Background Line Decoration */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-zinc-900/[0.02] via-transparent to-transparent dark:from-white/[0.02] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* [1] HEADER SECTION — หัวข้อสไตล์นิตยสารไฮเอนด์ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14 border-b border-zinc-200/60 dark:border-white/5 pb-8 animate-in fade-in duration-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-sans font-bold text-primary tracking-[0.25em] uppercase">// ARCHIVES</span>
            </div>
            <h1 className="text-3xl font-novel font-bold tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Reading History
            </h1>
            <p className="text-xs font-sans text-muted-foreground">บันทึกประวัติและบันทึกหน้าหนังสือที่คุณเปิดอ่านค้างไว้</p>
          </div>

          <Link 
            href="/novel" 
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

        {/* [2] HISTORY LIST AREA — สถาปัตยกรรมการ์ดเรียงแถวแนวตั้งแบบโปร่งใส */}
        <div className="space-y-4">
          {histories.length > 0 ? (
            histories.map((item) => (
              <div 
                key={item.id}
                className="group relative rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-black/[0.01] dark:bg-card/5 backdrop-blur-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/20 hover:bg-zinc-50/[0.02] dark:hover:bg-white/[0.01]"
              >
                {/* ฝั่งข้อมูลหนังสือ */}
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  {/* หน้าปกขนาดย่อม */}
                  <div className="w-14 aspect-[3/4] relative rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 shrink-0 shadow-md">
                    {/* 🟢 [แก้ไข]: เปลี่ยนจาก item.novel.image เป็น item.novel.coverImage ให้ตรงกับ Schema ใน DB มึง หน้าปกจะได้ขึ้นโชว์สวยๆ */}
                    {item.novel.coverImage ? (
                      <img src={item.novel.coverImage} alt={item.novel.title} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[7px] text-zinc-500 font-mono">NO IMAGE</div>
                    )}
                  </div>

                  {/* ชื่องเรื่องและตอนที่อ่านค้าง */}
                  <div className="space-y-1">
                    <h3 className="font-novel font-bold text-base text-foreground tracking-tight transition-colors group-hover:text-primary">
                      {item.novel.title}
                    </h3>
                    <p className="text-xs font-sans text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
                      <span>อ่านถึง:</span>
                      <span className="text-zinc-800 dark:text-zinc-300 font-medium">{item.chapter.title}</span>
                    </p>
                    <p className="text-[9px] font-sans text-zinc-400 dark:text-zinc-600">
                      เปิดอ่านล่าสุดเมื่อ: {new Date(item.updatedAt).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} น.
                    </p>
                  </div>
                </div>

                {/* ปุ่มลิงก์คลิกกลับไปอ่านต่อแบบคลีนๆ */}
                <Link
                  href={`/novel/${item.novelId}/chapter/${item.chapterId}`}
                  className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/5 bg-transparent text-zinc-800 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:border-primary/20 dark:hover:border-primary/20 text-[10px] font-sans font-bold uppercase tracking-widest transition-all"
                >
                  Continue
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ))
          ) : (
            /* เคสว่างเปล่า (Empty History Case) */
            <div className="text-center py-24 border border-dashed border-zinc-200 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
              <p className="text-[10px] font-sans tracking-[0.3em] text-muted-foreground/60 uppercase">No history logged yet</p>
              <Link href="/novel" className="text-[10px] font-sans text-primary hover:underline uppercase tracking-widest mt-2">
                Browse books ➔
              </Link>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}