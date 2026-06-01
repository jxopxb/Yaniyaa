import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Heart, ArrowLeft, BookOpen, LogIn, ArrowRight, Crown } from "lucide-react";
import NovelCard from "@/components/ui/NovelCard";

export default async function LikedNovelsPage() {
  // ⚡ 1. ดึงเซสชันของยูสเซอร์ปัจจุบันบนเซิร์ฟเวอร์
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user?.id;

  // 🔒 CASE 1: ยังไม่ได้ล็อกอิน
  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 select-none">
        <div className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-amber-500/10 p-8 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-xl bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/20 mb-5">
            <Heart className="w-5 h-5 stroke-[1.2]" />
          </div>
          
          <h2 className="text-zinc-200 font-novel text-base font-semibold tracking-wide mb-1.5">
            เข้าสู่คลังใจยานิย่า
          </h2>
          <p className="text-[11px] text-zinc-500 font-sans max-w-[220px] leading-relaxed mb-6">
            กรุณาเข้าสู่ระบบเพื่อเปิดดูรายการนิยายทั้งหมดที่คุณเคยให้หัวใจไว้
          </p>
          
          <Link href="/auth/signin" className="w-full">
            <button className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-sans tracking-widest uppercase transition-all duration-300 active:scale-[0.98] cursor-pointer">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // 🔍 2. คิวรี่ข้อมูลคลังนิยายที่กดใจ
  const likedRecords = await prisma.like.findMany({
    where: { userId: currentUserId },
    include: {
      novel: {
        include: {
          author: true,
          _count: {
            select: {
              readingHistories: true,
              likes: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const novels = likedRecords.map((record) => record.novel);

  return (
    // ขยับ pt-32 เผื่อระยะหลบ Navbar ให้โชว์ช่องไฟสวยๆ
    <main className="min-h-screen bg-background pt-28 pb-26 selection:bg-amber-500/10">
      {/* 🎯 บีบกรอบรวมให้เหลือ max-w-6xl เพื่อไม่ให้การ์ดนิยายกว้างและบวมเกินไปบนจอคอม */}
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        
        {/* --- ZONE 1: Navigation & Title Layout --- */}
        <div>
          {/* ↩️ เพิ่ม mb-8 แยกกลุ่มปุ่มย้อนกลับให้ลอยตัวชัดเจน ไม่เบียดกับหัวข้อด้านล่าง */}
          <Link 
              href="/novel" 
              className="mb-6 group flex flex-row-reverse lg:flex-row items-center gap-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground transition-all hover:text-primary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/30 backdrop-blur-xl shadow-sm transition-all group-hover:border-primary/50 group-hover:bg-primary/10">
                <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="hidden md:block opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                กลับหน้าหลัก
              </span>
            </Link>

          {/* หัวเรื่องสไตล์พรีเมียม ขยับ pb-8 และ border ให้ห่างออกจากกลุ่มเนื้อหาพอดีคำ */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
            {/* ↕️ ปรับ space-y-2.5 เพิ่มระยะห่างระหว่าง tag กับ h1 ไม่ให้ชิดกันเป็นก้อน */}
            <div className="space-y-2.5">
                <div className="mb-6 inline-flex items-center gap-2 self-center lg:self-start rounded-full border border-primary/20 bg-primary/5 px-4 py-1 backdrop-blur-sm">
                <Crown className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-sans font-bold tracking-[0.25em] uppercase text-primary/80">
                    Yaniyaa • FAVORITE COLLECTION
                </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-novel font-light tracking-tight text-zinc-200 flex items-center gap-2.5 group cursor-default select-none">
                    <span className="relative pb-1">
                        รายการโปรด
                        {/* 🪄 ลูกเล่น: เส้นขีดใต้ความหนา 1px วิ่งสไลด์ออกนุ่มๆ สไตล์แบรนด์แฟชั่นไฮเอนด์ */}
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-amber-500/60 to-transparent transition-all duration-500 ease-out group-hover:w-full" />
                    </span>
                    
                    {/* 🪄 ลูกเล่น: หัวใจจากเดิมที่โปร่งแสง จะสว่างขึ้นและเอียงตัวสู้มือตอน Hover */}
                    <span className="text-base text-amber-500/30 transition-all duration-500 ease-out transform group-hover:text-amber-500 group-hover:scale-110 group-hover:-rotate-12 block select-none">
                        ♥︎
                    </span>
                </h1>
            </div>
            
            <p className="text-[11px] text-zinc-500 font-sans tracking-wide sm:pb-1">
              คลังโปรดทั้งหมด <span className="text-amber-500 font-bold font-mono text-xs">{novels.length}</span> เรื่อง
            </p>
          </div>
        </div>

        {/* --- ZONE 2: CONTENT GRID --- */}
        {novels.length > 0 ? (
          /* 📐 ปรับจำนวนคอลัมน์สัมพัทธ์กับกรอบ 6xl เพื่อให้ขนาดการ์ดหรูหราพอดี ไม่ยืดกว้าง */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8 pt-2">
            {novels.map((novel) => (
              <div key={novel.id} className="animate-in fade-in duration-300">
                <Link href={`/novel/${novel.id}`} className="block group">
                  <NovelCard novel={novel as any} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* 📭 CASE: คลังว่าง */
          <div className="flex flex-col items-center justify-center py-36 text-center select-none">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
              <BookOpen className="w-4 h-4 stroke-[1.2]" />
            </div>
            <h3 className="font-novel text-sm font-medium text-zinc-400 mb-1">
              ยังไม่มีนิยายในคลังใจ
            </h3>
            <p className="text-[11px] text-zinc-650 font-sans max-w-xs mb-6 tracking-wide">
              ออกไปค้นหานิยายเรื่องโปรดของคุณได้ที่หน้าคลังหลัก
            </p>
            
            <Link href="/novel">
              <button className="px-5 h-8 rounded-lg border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-all duration-300 uppercase tracking-widest cursor-pointer">
                Discover
              </button>
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}