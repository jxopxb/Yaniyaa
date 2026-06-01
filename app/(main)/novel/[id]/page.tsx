import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import LikeButton from "@/components/ui/LikeButton"; // 👈 อิมพอร์ตปุ่มไลก์ที่เราเพิ่งสร้าง

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NovelDetailPage({ params }: Props) {
  const { id } = await params;

  // ⚡ ดึงข้อมูลเซสชันคนดูปัจจุบันบนเซิร์ฟเวอร์
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user?.id;

  // 🔍 คิวรี่ข้อมูลพ่วงยอดนับรวมสถิติไลก์/อ่านจริงจาก DB
  const novel = await prisma.novel.findUnique({
    where: { id },
    include: { 
      author: true, 
      chapters: {
        orderBy: { chapterNumber: "asc" } // เรียงตามเลขตอนชัวร์สุดมึง
      },
      _count: {
        select: {
          likes: true,
          readingHistories: true,
        }
      }
    },
  });

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-muted-foreground">
        ไม่พบนิยายที่คุณต้องการ
      </div>
    );
  }

  // 🎯 เช็กว่ายูสเซอร์คนนี้เคยกดไลก์นิยายเรื่องนี้ไปแล้วหรือยัง
  const hasLiked = currentUserId
    ? await prisma.like.findUnique({
        where: {
          userId_novelId: { userId: currentUserId, novelId: id },
        },
      }) !== null
    : false;

  const authorName = novel.author?.name || "นักเขียนยานิย่า";

  return (
    <main className="min-h-screen bg-background pt-28 pb-20 selection:bg-primary/20">
      <div className="max-w-3xl mx-auto px-6 space-y-12">
        
        {/* [1] ปุ่มย้อนกลับแบบมินิมอล */}
        <Link href="/novel" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-sans uppercase tracking-widest">
          <ArrowLeft className="w-3 h-3" /> กลับคลังสมุด
        </Link>

        {/* [2] ส่วนหัวเรื่อง (Layout หน้าปก + ข้อมูลนิยาย) */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end border-b border-border/20 pb-10">
          
          {/* หน้าปกนิยาย */}
          <div className="w-40 aspect-[3/4] relative bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            {novel.coverImage ? (
              <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-sans">No Cover</div>
            )}
          </div>

          {/* รายละเอียดเรื่อง + ปุ่มสถิติต่างๆ */}
          <div className="flex-1 space-y-4 text-center md:text-left w-full">
            <div className="space-y-2">
              <span className="inline-block text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold tracking-widest uppercase">
                Novel Profile
              </span>
              <h1 className="text-3xl md:text-4xl font-novel font-bold text-foreground tracking-tight">
                {novel.title}
              </h1>
              <p className="text-sm font-sans text-muted-foreground">
                ผู้เขียน: <span className="text-foreground/80">{authorName}</span>
              </p>
            </div>

            {/* 📊 บาร์รวมสถิติและปุ่มกด Like สไตล์ไฮเอนด์ */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              
              {/* 👁️ ยอดผู้อ่านจริงดิสเพลย์คลีนๆ */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/40 border border-border/10 text-xs text-muted-foreground font-medium">
                <Users className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{novel._count?.readingHistories || 0} คนอ่านจริง</span>
              </div>

              {/* ❤️ ปุ่ม Interactive กดถูกใจแบบลื่นๆ */}
              <LikeButton
                novelId={novel.id}
                userId={currentUserId}
                category={novel.category || "General"}
                initialIsLiked={hasLiked}
                initialLikesCount={novel._count?.likes || 0}
              />
            </div>

          </div>
        </div>

        {/* [3] รายการตอนนิยาย (Chapters List) */}
        <div className="space-y-6">
          <h2 className="text-lg font-novel font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> รายการตอนนิยาย
          </h2>

          <div className="grid gap-3">
            {novel.chapters.length > 0 ? (
              novel.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/novel/${id}/chapter/${chapter.id}`}
                  className="group flex justify-between items-center bg-secondary/5 border border-white/5 p-4 rounded-xl transition-all hover:border-primary/20 hover:bg-primary/[0.01] cursor-pointer block"
                >
                  <span className="font-sans text-sm text-zinc-300 group-hover:text-white transition-colors">
                    {chapter.title}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-sans group-hover:text-primary transition-colors">
                    อ่านตอนนีั ➔
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm font-sans text-muted-foreground italic py-4">ยังไม่มีตอนอัปเดต</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}