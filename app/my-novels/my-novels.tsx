"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getMyNovels, deleteNovel } from "@/app/actions/novel";
import { 
  BookOpen, Edit3, Trash2, Plus, Crown, ArrowRight, Loader2, Eye 
} from "lucide-react";

interface Novel {
  id: string | number;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  category?: string | null;
  type?: string | null;
  status?: string | null;
  views?: number | null;
}

export default function MyNovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadNovels = async () => {
    const res = await getMyNovels();
    if (res.success && Array.isArray(res.data)) {
      setNovels(res.data as Novel[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNovels();
  }, []);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);

    startTransition(async () => {
      try {
        const res = await deleteNovel(deleteTarget.id);
        if (res.success) {
          setDeleteTarget(null); 
          loadNovels(); 
        } else {
          setDeleteError(res.error || "ไม่สามารถดำเนินการได้ในขณะนี้");
        }
      } catch (err) {
        setDeleteError("Network connection failed.");
      }
    });
  };

  const getStatusStyles = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "published":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const getStatusLabel = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case "draft": return "Draft";
      case "pending": return "Pending";
      case "published": return "Published";
      default: return status || "Draft";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#07090E] flex items-center justify-center text-xs tracking-widest uppercase text-zinc-400 animate-pulse">
        กำลังเชื่อมต่อคลังหนังสือของคุณ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-zinc-900 dark:text-zinc-100 transition-colors duration-700 pt-24 sm:pt-32 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header สไตล์สตูดิโอ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 sm:mb-16 pb-6 border-b border-zinc-200/60 dark:border-white/[0.04] gap-6 sm:gap-0">
          <div className="space-y-1 w-full sm:w-auto">
            <Link 
              href="/novel" 
              className="mb-6 group flex items-center gap-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground transition-all hover:text-primary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/30 backdrop-blur-xl shadow-sm transition-all group-hover:border-primary/50 group-hover:bg-primary/10">
                <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  กลับหน้าหลัก
              </span>
            </Link>
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 backdrop-blur-sm">
                <Crown className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-sans font-bold tracking-[0.25em] uppercase text-primary/80">
                    Yaniyaa • WORKSPACE
                </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight flex items-baseline gap-2">
              นิยาย
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent/40 to-primary/60">ของฉัน</span>
              <span className="text-zinc-400 font-mono text-sm sm:text-base">({novels.length})</span>
            </h1>
          </div>
          <Link 
            href="/novel/create"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:px-5 sm:py-2.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200/60 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 cursor-pointer shadow-sm active:scale-[0.97]"
          >
            <Plus size={12} /> เขียนเรื่องใหม่
          </Link>
        </div>

        {/* ถ้ายังไม่มีผลงานเลย */}
        {novels.length === 0 ? (
          <div className="border border-dashed border-zinc-200 dark:border-white/[0.04] rounded-3xl p-10 sm:p-16 text-center space-y-4">
            <BookOpen size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 sm:w-9 sm:h-9" strokeWidth={1} />
            <p className="text-xs sm:text-sm font-light text-zinc-400 px-4">คลังหนังสือว่างเปล่า... เริ่มจารึกนิยายชิ้นเอกเรื่องแรกของคุณเลยครับ</p>
          </div>
        ) : (
          /* Grid นิยาย */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {novels.map((novel) => (
              <div key={novel.id} className="group relative space-y-3 sm:space-y-4">
                
                {/* ปกนิยาย */}
                <div className="relative aspect-[3/4] w-full rounded-xl sm:rounded-2xl bg-zinc-100 dark:bg-white/[0.01] border border-zinc-200/60 dark:border-white/[0.04] overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:border-zinc-400 dark:group-hover:border-white/20">
                  <img 
                    src={novel.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e"} 
                    alt={novel.title || "Untitled"} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-md border backdrop-blur-md shadow-sm ${getStatusStyles(novel.status)}`}>
                    {getStatusLabel(novel.status)}
                  </div>

                  {/* 🛠️ แถบมืดตอน Hover เพื่อขึ้นปุ่มควบคุม - ปรับแก้เพื่อให้แสดงผลทุกหน้าจอ */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 opacity-0 group-hover:opacity-100">
                    <Link 
                      href={`/my-novels/${novel.id}/edit`}
                      className="p-2.5 sm:p-3 bg-white text-black rounded-full hover:scale-110 transition-transform cursor-pointer shadow-md"
                      title="แก้ไขนิยาย"
                    >
                      <Edit3 size={14} className="sm:w-4 sm:h-4" />
                    </Link>
                    <button 
                      onClick={() => setDeleteTarget({ id: String(novel.id), title: novel.title || "ไม่มีชื่อเรื่อง" })}
                      disabled={isPending}
                      className="p-2.5 sm:p-3 bg-zinc-900 text-red-400 border border-red-500/20 rounded-full hover:scale-110 transition-transform cursor-pointer shadow-md disabled:opacity-40"
                      title="ลบนิยาย"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* รายละเอียดด้านล่างปก */}
                <div className="space-y-1.5 px-1">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-zinc-400">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-1.5 sm:px-2 py-0.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200/40 dark:border-white/5 rounded text-zinc-400 truncate max-w-[45%]">
                      {novel.category || "ทั่วไป"}
                    </span>
                    
                    <div className="flex items-center gap-2.5 opacity-80">
                      <span>{novel.type || "FREE"}</span>
                      <div className="w-[1px] h-2.5 bg-zinc-300 dark:bg-white/10" />
                      <span className="flex items-center gap-1">
                        <Eye size={11} className="opacity-70" />
                        {novel.views ? Number(novel.views).toLocaleString() : "0"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-medium truncate pt-0.5 tracking-tight group-hover:text-primary transition-colors">
                    {novel.title}
                  </h3>
                  
                  <Link href={`/my-novels/${novel.id}/edit`} className="md:hidden text-[10px] font-medium text-primary hover:underline mt-0.5 block">
                    แก้ไขเนื้อหา &rarr;
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ════════════════════ 🏛 *MODAL ลบ* ════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-zinc-950/20 dark:bg-black/60 backdrop-blur-xl transition-opacity duration-500 animate-in fade-in"
            onClick={() => !isPending && setDeleteTarget(null)}
          />

          <div className="relative w-full max-w-[320px] sm:max-w-[360px] bg-white dark:bg-[#07090E] border border-zinc-200/80 dark:border-white/[0.03] rounded-3xl p-5 sm:p-6 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] text-center space-y-5 sm:space-y-7 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-zinc-100 dark:border-white/[0.02] text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.005]">
              <Trash2 size={14} strokeWidth={1.5} />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <p className="text-[8px] sm:text-[9px] font-sans font-bold tracking-[0.25em] text-zinc-400 dark:text-zinc-500 uppercase">
                Workspace Management
              </p>
              <h2 className="text-lg sm:text-xl font-extralight tracking-tight text-zinc-900 dark:text-zinc-100">
                ต้องการลบ <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 to-zinc-400 dark:from-white dark:to-zinc-500">ต้นฉบับเรื่องนี้?</span>
              </h2>
            </div>

            <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/[0.02] py-3 sm:py-4 px-3 rounded-2xl my-1 text-center">
              <span className="block text-[8px] sm:text-[9px] text-zinc-400 tracking-[0.15em] font-light uppercase mb-1">
                ARCHIVE TITLE
              </span>
              <p className="text-xs font-medium tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                “{deleteTarget.title}”
              </p>
            </div>

            <p className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 font-light max-w-[260px] mx-auto leading-relaxed">
              ข้อมูลและตอนย่อยทั้งหมดจะถูกทำลายถาวรจากฐานข้อมูลระบบ และไม่สามารถย้อนคืนสิทธิ์ได้
            </p>

            {deleteError && (
              <div className="text-[9px] sm:text-[10px] text-red-500 dark:text-red-400 font-light bg-red-500/5 py-2 rounded-xl border border-red-500/10">
                {deleteError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
                className="w-full py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border border-zinc-200 dark:border-white/5 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all duration-300 cursor-pointer disabled:opacity-40 active:scale-[0.98]"
              >
                ย้อนกลับ
              </button>
              
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl bg-red-600 text-white text-[9px] sm:text-[10px] font-bold tracking-widest uppercase shadow-[0_8px_20px_-6px_rgba(220,38,38,0.25)] hover:bg-red-700 transition-all duration-300 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                {isPending ? (
                  <>
                    <Loader2 size={10} className="animate-spin" />
                    ลบ...
                  </>
                ) : (
                  "ยืนยันการลบ"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}