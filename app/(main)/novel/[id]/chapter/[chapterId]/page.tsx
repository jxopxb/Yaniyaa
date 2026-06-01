import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, ArrowRight } from "lucide-react";
import { updateReadingHistory } from "@/app/actions/history";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string; chapterId: string }>;
}

export default async function ChapterDetailPage({ params }: Props) {
  // 1. แกะ ID ของทั้งตัวนิยายหลัก และ ตอนปัจจุบัน ออกจาก params (Next.js 16)
  const { id, chapterId } = await params;

  // 2. [ระบบความปลอดภัย Better Auth]: ดึงเซสชันจริงจากเบราว์เซอร์ผู้ใช้ส่งต่อให้ Server
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // ถ้าเช็คแล้วไม่ได้ล็อกอิน (ไม่มีตัวตน) ดีดเด้งกลับไปหน้า login ทันทีป้องกัน Error P2003
  if (!session || !session.user) {
    redirect("/login");
  }

  // ได้ ID ของบัญชีผู้ใช้จริงบนฐานข้อมูล Neon มาใช้งานแบบไร้รอยต่อ
  const currentUserId = session.user.id; 

  // 3. ดึงข้อมูลของตอนปัจจุบัน พร้อมรวมข้อมูลของนิยายหลักมาใช้ร่วมด้วย
  // 🟢 [แก้ไข]: สั่ง include นิยายแม่ และสั่งซ้อนเข้าไปลากข้อมูลคนเขียน (author) จริงจากตาราง User ออกมาด้วยมึง!
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { 
      novel: {
        include: {
          author: true // ✨ ลากข้อมูล User เจ้าของนิยายเรื่องนี้ออกมาแบบครบมิติ
        }
      } 
    },
  });

  // Handle กรณีที่ไม่พบเนื้อหาในฐานข้อมูล Neon
  if (!chapter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        <p className="text-[10px] tracking-[0.3em] text-muted-foreground/60 uppercase">CHAPTER NOT FOUND</p>
      </div>
    );
  }

  // 4. [ระบบเปลี่ยนตอน]: หาตอนก่อนหน้า (lt = Less Than) และตอนถัดไป (gt = Greater Than)
  const prevChapter = await prisma.chapter.findFirst({
    where: {
      novelId: chapter.novelId,
      id: { lt: chapterId }, 
    },
    orderBy: { id: "desc" },
  });

  const nextChapter = await prisma.chapter.findFirst({
    where: {
      novelId: chapter.novelId,
      id: { gt: chapterId }, 
    },
    orderBy: { id: "asc" },
  });

  // 5. [ระบบประวัติการอ่าน]: สั่งรันคำสั่งบันทึกประวัติด้วย ID ผู้ใช้จริงลงฐานข้อมูล Neon แบบ Background อัตโนมัติ
  if (currentUserId) {
    updateReadingHistory(currentUserId, id, chapterId);
  }

  // 🎯 ดึงชื่อคนเขียนนิยายเรื่องนี้ออกมาใช้งานเผื่อกรณีอยากโชว์ใต้ชื่อเรื่อง
  const authorName = (chapter.novel as any).author?.name || "นักเขียนยานิย่า";

  return (
    <main className="min-h-screen bg-background pb-40 pt-40 relative overflow-hidden selection:bg-primary/10 dark:selection:bg-primary/20 selection:text-primary dark:selection:text-white">
      
      {/* BACKGROUND DECORATION: เส้นโครงสร้างแนวตั้งมินิมอลลิสต์ */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-zinc-900/[0.03] via-transparent to-transparent dark:from-white/[0.03] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-zinc-900/[0.01] via-transparent to-transparent dark:from-white/[0.01] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 relative z-10">
        
        {/* [1] HEADER NAVIGATION — ปุ่มย้อนกลับสไตล์แอปหรู */}
        <div className="mb-14 border-b border-zinc-200/60 dark:border-white/5 pb-8 animate-in fade-in duration-700">
          <Link 
            href={`/novel/${id}`} 
            className="group inline-flex items-center gap-3 text-[9px] text-muted-foreground/50 dark:text-muted-foreground/40 hover:text-primary font-sans font-bold uppercase tracking-[0.15em] transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-background/30 backdrop-blur-xl shadow-sm transition-all group-hover:border-primary/50 group-hover:bg-primary/10">
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
            </div>
            <span className="hidden md:block opacity-60 group-hover:text-primary transition-opacity duration-300 text-[10px] tracking-[0.12em] uppercase">
              เลือกตอนอื่นๆ
            </span>
          </Link>
          
          <div className="mt-8 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-primary font-bold tracking-[0.2em] uppercase">// {chapter.novel.title}</span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono"> {authorName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-novel font-bold tracking-tight bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              {chapter.title}
            </h1>
          </div>
        </div>

        {/* [2] READING CONTENT AREA — หน้ากระดาษเนื้อหาอ่านง่ายแบบกระจายแสงสายตา */}
        <article className="prose prose-zinc dark:prose-invert max-w-none mb-24 animate-in fade-in duration-1000 delay-150 prose-p:m-0">
          <p className="text-zinc-700 dark:text-zinc-300 text-base leading-[2.2rem] tracking-wide whitespace-pre-wrap font-sans font-normal antialiased">
            {chapter.content}
          </p>
        </article>

        {/* [3] BOTTOM UTILITY CONTROLS — แถบเปลี่ยนตอนสลับโหมด พร้อมเช็คลิงก์จริงจากฐานข้อมูล */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-black/[0.02] dark:bg-card/10 backdrop-blur-3xl animate-in fade-in duration-1000 delay-300">
          
          {/* ปุ่มย้อนไปตอนก่อนหน้า (Prev) */}
          {prevChapter ? (
            <Link
              href={`/novel/${id}/chapter/${prevChapter.id}`}
              className="group flex items-center gap-2 text-[10px] font-sans font-bold tracking-widest text-zinc-700 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors uppercase pl-2"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> ย้อนกลับ
            </Link>
          ) : (
            <span className="flex items-center gap-2 text-[10px] font-sans tracking-widest text-zinc-400 dark:text-zinc-600 opacity-30 uppercase pl-2 cursor-not-allowed select-none">
              <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
            </span>
          )}
          
          {/* สัญลักษณ์ตรงกลางบอกสถานะเล่มหนังสือ */}
          <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-zinc-400 dark:text-zinc-600" /> 
            {!nextChapter ? "End of piece" : "Reading"}
          </span>
          
          {/* ปุ่มกดไปตอนถัดไป (Next) */}
          {nextChapter ? (
            <Link
              href={`/novel/${id}/chapter/${nextChapter.id}`}
              className="group flex items-center gap-2 text-[10px] font-sans font-bold tracking-widest text-zinc-700 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors uppercase pr-2"
            >
              ตอนต่อไป <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span className="flex items-center gap-2 text-[10px] font-sans tracking-widest text-zinc-400 dark:text-zinc-600 opacity-30 uppercase pr-2 cursor-not-allowed select-none">
              ตอนต่อไป <ChevronRight className="w-4 h-4" />
            </span>
          )}

        </div>

      </div>
    </main>
  );
}