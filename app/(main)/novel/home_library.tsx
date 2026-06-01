"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Grid2X2,
  Layers,
  Heart,
  Fan,
  Kayak,
  ShieldAlert,
  Drama,
  Flame,
  CaseSensitive,
  Aperture,
  Package,
  SlidersHorizontal, // ⚡ [เพิ่มใหม่]: ไอคอนสำหรับปุ่มเปิดเมนูมือถือ
  X                 // ⚡ [เพิ่มใหม่]: ไอคอนปุ่มปิดเมนู
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NovelCard from "@/components/ui/NovelCard";

const categoriesConfig = [
  { id: "all", label: "นิยายทั้งหมด", icon: Layers },
  { id: "romance", label: "โรแมนติก", icon: Heart },
  { id: "fantasy", label: "แฟนตาซี", icon: Fan },
  { id: "Adventure", label: "ผจญภัย", icon: Kayak },
  { id: "Action", label: "แอ็กชัน", icon: ShieldAlert },
  { id: "Drama", label: "ดราม่า", icon: Drama },
  { id: "Sci-fi", label: "ไซไฟ", icon: Flame },
  { id: "thai", label: "ภาษาไทย", icon: Aperture },
  { id: "english", label: "ภาษาอังกฤษ", icon: CaseSensitive }
];

interface LibraryPageProps {
  initialNovels: any[];
  initialSort?: string; 
}

export default function LibraryPage({ initialNovels, initialSort }: LibraryPageProps) {
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false); // ⚡ [เพิ่มใหม่]: State คุมเปิด/ปิด Drawer บนมือถือ
  
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "popular">(
    initialSort === "popular" || initialSort === "oldest" || initialSort === "latest"
      ? (initialSort as any)
      : "latest"
  );

  // ลอจิกนับจำนวนไอเทมในแต่ละหมวดหมู่
  const categories = categoriesConfig.map((cat) => {
    let count = 0;
    if (cat.id === "all") {
      count = initialNovels.length;
    } else if (cat.id === "thai" || cat.id === "english") {
      count = initialNovels.filter((n) => n.language === cat.id).length;
    } else if (cat.id === "free") {
      count = initialNovels.filter((n) => n.isFree === true).length;
    } else {
      count = initialNovels.filter((n) => n.category === cat.id).length;
    }
    return { ...cat, count };
  });

  // ลอจิกตัวกรองหมวดหมู่ และ ค้นหาข้อความ
  const filteredNovels = initialNovels.filter((novel) => {
    let matchesCategory = false;
    if (selectedCat === "all") {
      matchesCategory = true;
    } else if (selectedCat === "thai" || selectedCat === "english") {
      matchesCategory = novel.language === selectedCat; 
    } else if (selectedCat === "free") {
      matchesCategory = novel.isFree === true;
    } else {
      matchesCategory = novel.category === selectedCat;
    }

    const authorName = novel.author?.name || novel.author || "";
    const matchesSearch = 
      novel.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(authorName).toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // ลอจิกจัดเรียงลำดับนิยาย
  const sortedNovels = [...filteredNovels].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === "popular") {
      const readersA = a._count?.readingHistories ?? (Number(a.readers) || 0);
      const readersB = b._count?.readingHistories ?? (Number(b.readers) || 0);
      return readersB - readersA;
    }
    return 0;
  });

  // Shared Sidebar JSX Component สำหรับเอาไว้มัดรวมไปใช้ซ้ำทั้งจอใหญ่และจอเล็ก
  const SidebarContent = () => (
    <div className="flex flex-col h-full rounded-[2.5rem] lg:bg-card/30 lg:backdrop-blur-3xl lg:border lg:border-border/40 lg:shadow-2xl overflow-hidden">
      <div className="py-8 flex flex-col items-center justify-center border-b border-border/20 relative">
        <h2 className="text-primary font-bold tracking-[0.4em] uppercase text-[9px] mb-1">
          Yaniyaa Novels
        </h2>
        <p className="text-foreground/80 font-novel font-bold text-lg">หมวดหมู่นิยาย</p>
        
        {/* ปุ่มปิดเมนูแสดงเฉพาะบนมือถือ */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCat(cat.id);
              setIsMobileOpen(false); // คลิกเลือกแล้วปิดแผงเมนูมือถือทันที
            }}
            className={cn(
              "group flex w-full items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 cursor-pointer",
              selectedCat === cat.id
                ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(var(--primary),0.15)] scale-[1.02]"
                : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
            )}
          >
            <div className="flex items-center gap-4">
              <cat.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", selectedCat === cat.id ? "text-primary-foreground" : "text-primary")} />
              <span className="text-xs font-semibold font-sans tracking-wide">
                {cat.label}
              </span>
            </div>
            <div className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border",
              selectedCat === cat.id ? "border-primary-foreground/30 bg-primary-foreground/10" : "border-border/40 bg-muted/30"
            )}>
              {cat.count}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background pt-16 transition-colors duration-700">
      
      {/* 🟢 1. SIDEBAR DESKTOP: กางถาวรเฉพาะจอคอมพิวเตอร์ (lg ขึ้นไป) */}
      <aside className="fixed left-0 hidden h-[calc(100vh-64px)] w-[320px] flex-col p-6 lg:flex z-20">
        <SidebarContent />
      </aside>

      {/* 🟢 2. MOBILE DRAWER: แผงเมนูสไลด์เข้า-ออก สำหรับหน้าจอมือถือและแท็บเล็ต */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/60 backdrop-blur-sm z-50 lg:hidden transition-all duration-500",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        <div 
          className={cn(
            "fixed inset-y-0 left-0 w-[300px] sm:w-[320px] bg-card/95 backdrop-blur-2xl border-r border-border/40 p-4 shadow-2xl flex flex-col transition-transform duration-500 ease-out",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()} // ป้องกันกดโดนเมนูแล้วแผงปิดเอง
        >
          <SidebarContent />
        </div>
      </div>

      {/* --- MAIN CONTENT: พื้นที่แสดงผลการค้นหาและกล่องนิยาย --- */}
      <main className="flex-1 lg:ml-[320px] p-4 sm:p-6 lg:p-10">

        {/* Search & Filter Header */}
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center justify-between mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          {/* แถบด้านซ้าย: ค้นหา + ปุ่มฟิลเตอร์มือถือ */}
          <div className="flex items-center gap-3 w-full md:max-w-[360px]">
            {/* ปุ่มเปิดแผงหมวดหมู่ที่จะโผล่มาเฉพาะในหน้าจอมือถือ (lg:hidden) */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="flex lg:hidden items-center justify-center h-9 w-9 rounded-full border border-border/30 bg-muted/30 text-foreground hover:bg-primary/5 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            {/* ช่องกรอกข้อความปรับให้กว้างขยายเต็มในจอมือถือ */}
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="ค้นหานิยาย..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 text-xs font-sans rounded-full border border-border/20 bg-muted/30 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/50 transition-all"
                />
            </div>
          </div>

          {/* แถบด้านขวา: ปุ่มจัดเรียงลำดับ ลื่นๆ บนจอมือถือ */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-full py-1 md:py-0 self-start md:self-auto">
            
            {/* Sorting Segmented Control */}
            <div className="flex items-center gap-1 bg-card/20 backdrop-blur-md border border-border/30 p-1 rounded-xl h-10 sm:h-12">
              {[
                { id: "latest", label: "ล่าสุด" },
                { id: "oldest", label: "เก่าสุด" },
                { id: "popular", label: "ผู้อ่านมากสุด" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id as any)}
                  className={cn(
                    "px-3 sm:px-4 h-full rounded-lg text-[10px] font-medium tracking-wider font-sans transition-all duration-300 cursor-pointer whitespace-nowrap",
                    sortBy === option.id
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold scale-[0.98]"
                      : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/20"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-2xl border border-border/40 bg-card/20 transition-all hover:rotate-90 hover:text-primary cursor-pointer"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* NOVEL GRID: ปรับสัดส่วน Grid ให้เปิดหน้าจอเล็กแล้วไม่ยับ สตรีมมิ่งลงมา 2 คอลัมน์พอดิบพอดีบนบอดี้มือถือ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {sortedNovels.map((novel: any) => (
            <div key={novel.id} className="animate-in fade-in zoom-in-95 duration-500">
              <Link href={`/novel/${novel.id}`} className="block group">
                <NovelCard novel={novel} />
              </Link>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedNovels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 opacity-40">
            <Package className="w-16 h-16 mb-4 stroke-1" />
            <p className="font-novel text-lg">ไม่พบนิยายในหมวดหมู่นี้</p>
          </div>
        )}
      </main>
    </div>
  );
}