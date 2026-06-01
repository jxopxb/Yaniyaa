"use client";

import React from "react";
import { CheckCircle2, Sparkles, Home, BookOpen } from "lucide-react";

export default function SendNovel() {
  return (
    <div className="min-h-screen bg-background text-zinc-950 dark:text-zinc-50 pt-28 pb-32 px-4 sm:px-8 font-sans transition-colors duration-700 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* 🌟 Aura Effect & Animated Checkmark */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-2xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-full border border-zinc-200/80 dark:border-white/[0.04] bg-white dark:bg-white/[0.02] flex items-center justify-center text-emerald-500 shadow-sm">
            <CheckCircle2 size={26} strokeWidth={1.5} className="animate-in zoom-in-50 duration-500" />
          </div>
          <Sparkles size={14} className="absolute top-2 right-2 text-amber-500/40 animate-bounce" />
        </div>

        {/* 🏛️ Core Text State */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
            Submission Successful
          </div>
          <h1 className="text-2xl sm:text-3xl font-extralight tracking-tight">
            ส่งข้อมูลให้ <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 to-zinc-500 dark:from-white dark:to-zinc-500">แอดมินตรวจสอบแล้ว</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto font-light leading-relaxed">
            ระบบได้นำส่งต้นฉบับของมึงเข้าสู่คิวรออนุมัติเรียบร้อยแล้ว กองบรรณาธิการ Yaniyaa จะใช้เวลาประเมินภายใน 24 ชั่วโมง
          </p>
        </div>

        {/* Divider Line */}
        <div className="w-12 h-[1px] bg-zinc-200 dark:bg-white/10 mx-auto" />

        {/* 🔙 Luxury Action Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
          {/* 🏠 ปุ่มกลับหน้าหลัก + Hover เส้นใต้สี Primary */}
          <a
            href="/novel"
            className="group inline-flex items-center gap-2 text-[11px] font-light tracking-[0.12em] uppercase text-zinc-400 hover:text-primary border-b border-transparent hover:border-primary pb-1 transition-all duration-300 cursor-pointer"
          >
            <Home size={12} className="text-zinc-400/60 group-hover:text-primary transition-colors duration-300" />
            กลับสู่หน้าหลัก
          </a>

          <span className="text-zinc-200 dark:text-zinc-800 hidden sm:inline text-xs pb-1">|</span>

          {/* 📚 ปุ่มไปหน้าคลังนิยาย + Hover เส้นใต้สี Primary */}
          <a
            href="/my-novels"
            className="group inline-flex items-center gap-2 text-[11px] font-light tracking-[0.12em] uppercase text-zinc-400 hover:text-primary border-b border-transparent hover:border-primary pb-1 transition-all duration-300 cursor-pointer"
          >
            <BookOpen size={12} className="text-zinc-400/60 group-hover:text-primary transition-colors duration-300" />
            ดูคลังผลงานของคุณ
          </a>
        </div>

      </div>
    </div>
  );
}