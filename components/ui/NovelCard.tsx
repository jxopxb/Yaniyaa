"use client";

import { Star, Users, Clock, Heart } from "lucide-react"; // ✨ เพิ่ม Heart เข้ามา
import { timeAgo } from "@/lib/utils";

interface Novel {
  id: string;
  title: string;
  author: any; 
  role: string;
  rating: number;
  readers: number | string; 
  badge?: string;
  type: string;
  image: string;
  coverImage?: string; 
  category?: string; 
  createdAt?: Date | string; 
  _count?: {                  
    readingHistories: number;
    likes: number; // ✨ รองรับยอดกดใจจาก Database
  };
}

export default function NovelCard({
  novel,
}: {
  novel: Novel;
}) {
  
  const authorName = novel.author?.name || (typeof novel.author === "string" ? novel.author : null) || "นักเขียนยานิย่า";
  const firstLetter = authorName.charAt(0).toUpperCase();

  // 👁️ คำนวณยอดต่างๆ: ดึงจากสถิติจริงใน DB ก่อน ถ้าไม่มีให้ถอยไปใช้ฟิลด์ตัวเลขดิบ
  const totalReaders = novel._count?.readingHistories ?? novel.readers ?? 0;
  const totalLikes = novel._count?.likes ?? 0;

  // 🪄 ฟังก์ชันย่อตัวเลขให้ดูแพง (เช่น 1500 -> 1.5K, 10000 -> 10K)
  const formatCompactNumber = (number: number | string) => {
    const num = Number(number);
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  return (
    <div className="group flex flex-col bg-card rounded-2xl border border-border/30 overflow-hidden transition-all duration-500 hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 cursor-pointer">
      
      {/* Image Section */}
      <div className="relative aspect-video xl:aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={novel.coverImage || novel.image} 
          alt={novel.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* ⏳ บัดจ์บอกเวลาลงนิยาย */}
        {novel.createdAt && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/60 backdrop-blur-md flex items-center gap-1.5 text-[9px] font-medium text-foreground/80 border border-white/5 shadow-sm">
            <Clock className="w-2.5 h-2.5 text-muted-foreground/80" />
            <span>{timeAgo(novel.createdAt)}</span>
          </div>
        )}

        {/* Badge ประเภทนิยาย */}
        <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[8px] font-bold tracking-tight shadow-sm backdrop-blur-sm ${
          novel.type === "FREE" 
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        }`}>
          {novel.badge || (novel.type === "FREE" ? "อ่านฟรี" : "ใช้คอยน์")}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1 gap-4">
        {/* Title */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-card-foreground tracking-wide line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {novel.title}
          </h3>
        </div>

        {/* Author Box */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
            {firstLetter}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-card-foreground/80">
              {authorName}
            </span>

            <span className="text-[8px] text-muted-foreground/40 tracking-widest uppercase font-light">
              {novel.role || "Author"}
            </span>
          </div>
        </div>

        {/* 📊 Stats Section: เพิ่มยอดถูกใจ และปรับตัวเลขให้ดูแพง */}
        <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground/60">

          {/* แท็กหมวดหมู่ */}
          {novel.category && (
            <span className="inline-block px-1.5 py-0.5 rounded bg-muted/40 dark:bg-white/[0.02] text-[9px] font-semibold text-muted-foreground/50 tracking-wider border border-border/10 uppercase">
              {novel.category}
            </span>
          )}

          {/* ❤️ [ใหม่] แสดงยอดคนกดใจจริงๆ */}
          <div className="flex items-center gap-1 hover:text-foreground transition-colors" title="ยอดถูกใจ">
            <Heart className="h-3 w-3 fill-red-500/10 text-red-500 stroke-[1.5]" />
            <span>{formatCompactNumber(totalLikes)}</span>
          </div>

          {/* 👁️ แสดงยอดคนอ่านจริงๆ */}
          <div className="flex items-center gap-1 hover:text-foreground transition-colors" title="ยอดเข้าอ่าน">
            <Users className="h-3 w-3 stroke-[1.5]" />
            <span>{formatCompactNumber(totalReaders)}</span>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-auto pt-3.5 flex items-center justify-between border-t border-border/20">
          <span className="text-xs font-medium text-card-foreground tracking-wide">
            {novel.type === "FREE" ? "ฟรี" : "ใช้คอยน์"}
          </span>

          <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold border border-border/20 text-muted-foreground/30 tracking-widest uppercase">
            {novel.type}
          </span>
        </div>
      </div>
    </div>
  );
}