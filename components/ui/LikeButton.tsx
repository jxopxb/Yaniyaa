"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLikeNovel } from "@/app/actions/novel";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // ⚡ ใช้แค่ motion ตัวเดียวอยู่ คลีนๆ

interface LikeButtonProps {
  novelId: string;
  userId: string | undefined;
  category: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
}

export default function LikeButton({
  novelId,
  userId,
  category,
  initialIsLiked,
  initialLikesCount,
}: LikeButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  const handleLike = async () => {
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    if (isPending) return;

    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikesCount((prev) => (nextIsLiked ? prev + 1 : prev - 1));

    startTransition(async () => {
      const res = await toggleLikeNovel(userId, novelId, category);
      if (!res.success) {
        setIsLiked(isLiked);
        setLikesCount(likesCount);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <motion.button
      onClick={handleLike}
      disabled={isPending}
      whileHover={{ scale: 1.02 }} // 🪄 ตอนเอาเมาส์ชี้ ขยายเบาๆ
      whileTap={{ scale: 0.95 }}   // 🪄 ตอนกดค้าง (Active) ปุ่มจะยุบตัวลงสไตล์ iOS ไฮเอนด์
      className={cn(
        "flex items-center gap-2.5 px-4.5 py-2.5 rounded-2xl border backdrop-blur-sm transition-all duration-300 disabled:opacity-60 cursor-pointer text-xs font-medium tracking-wide select-none",
        isLiked
          ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.12)] hover:border-red-500/40"
          : "bg-muted/30 border-border/10 text-muted-foreground hover:text-foreground hover:border-border/40 hover:bg-muted/50"
      )}
    >
      {/* 🔴 ก้อนแอนิเมชันหัวใจ: ใช้ key ดักสถานะเพื่อให้มันเล่นเอฟเฟกต์ Pop-Out ทุกครั้งที่กด */}
      <motion.div
        key={isLiked ? "liked" : "unliked"}
        animate={isLiked ? { scale: [1, 1.38, 1] } : { scale: 1 }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }} // หน่วงนุ่มๆ เด้งนิดๆ
        className="flex items-center justify-center"
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-colors duration-300 stroke-[1.5]",
            isLiked 
              ? "fill-red-500 stroke-red-500 filter drop-shadow-[0_2px_8px_rgba(239,68,68,0.3)]" // ❤️ แดงฉ่ำเรืองแสง
              : "fill-none stroke-current"
          )}
        />
      </motion.div>
      
      {/* 🔢 แอนิเมชันตัวเลขอัปเดตขยับสลับที่ตอนยอดเปลี่ยน */}
      <motion.span
        key={likesCount}
        initial={{ opacity: 0, y: isLiked ? 4 : -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="block tabular-nums"
      >
        {likesCount} ถูกใจ
      </motion.span>
    </motion.button>
  );
}