"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getNovelById, updateNovel, saveChapter, deleteOrphanedChapters, submitNovelForReview } from "@/app/actions/novel";
import { 
  Sparkles, FolderHeart, Landmark, Image as ImageIcon, 
  Plus, Trash2, Hash, ShieldCheck, Globe2, ChevronDown, Crown, ArrowRight, Send, CheckCircle2, AlertCircle, Upload
} from "lucide-react";
import Link from "next/link";

const NOVEL_CATEGORIES = [
  { id: "fantasy", label: "แฟนตาซี" },
  { id: "romance", label: "โรแมนติก" },
  { id: "Adventure", label: "ผจญภัย" },
  { id: "Action", label: "แอ็กชัน" },
  { id: "Drama", label: "ดราม่า" },
  { id: "Sci-fi", label: "ไซไฟ" },
];

const NOVEL_LANGUAGES = [
  { id: "thai", label: "Thai (TH)" },
  { id: "english", label: "English (EN)" },
];

export default function EditNovelPage() {
  const params = useParams();
  const novelId = params.id as string;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ✨ Ref สำหรับเรียกหน้าต่างอัปโหลดไฟล์
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    coverUrl: "",
    category: "fantasy",
    subCategory: "Magic School",
    rating: "General (G)",
    accessType: "FREE",
    copyright: "All Rights Reserved",
    language: "thai",
    tags: ["ดาร์กแฟนตาซี", "ต่างโลก"],
    chapters: [] as any[]
  });

  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success", callback?: () => void) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
      if (callback) callback();
    }, 1500); 
  };

  useEffect(() => {
    const fetchNovelData = async () => {
      const res = await getNovelById(novelId);
      if (res.success && res.data) {
        const d = res.data;
        setFormData({
          title: d.title,
          synopsis: d.description || "",
          coverUrl: d.coverImage,
          category: d.category,
          subCategory: "Magic School",
          rating: "General (G)",
          accessType: d.type,
          copyright: "All Rights Reserved",
          language: d.language,
          tags: ["ดาร์กแฟนตาซี", "ต่างโลก"],
          chapters: d.chapters && d.chapters.length > 0 
            ? d.chapters.map((ch: any) => ({ 
                id: ch.id, 
                title: ch.title, 
                content: ch.content, 
                status: ch.status || "draft" 
              }))
            : [{ id: Date.now(), title: "บทนำ: ปฐมบทแห่งโชคชะตา", content: "", status: "draft" }]
        });
      }
      setLoading(false);
    };
    fetchNovelData();
  }, [novelId]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const selectOption = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setActiveDropdown(null);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addChapter = () => {
    const newId = Date.now();
    const nextNumber = formData.chapters.length + 1;
    setFormData(prev => ({
      ...prev,
      chapters: [...prev.chapters, { id: newId, title: `ตอนที่ ${nextNumber}`, content: "", status: "draft" }]
    }));
  };

  // 🖼️ ฟังก์ชันจัดการเมื่อผู้ใช้เลือกไฟล์รูปภาพ
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // แปลงไฟล์เป็น Base64 เพื่อให้พรีวิวบนหน้าเว็บได้ทันที
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      showToast("กรุณาระบุชื่อเรื่องนิยายด้วยครับ", "error");
      return;
    }

    startTransition(async () => {
      const novelResult = await updateNovel(novelId, {
        title: formData.title,
        description: formData.synopsis,
        coverImage: formData.coverUrl, 
        category: formData.category, 
        language: formData.language,
      });

      if (!novelResult.success) {
        showToast(novelResult.error || "เกิดข้อผิดพลาดในการอัปเดตนิยาย", "error");
        return;
      }

      for (let i = 0; i < formData.chapters.length; i++) {
        const ch = formData.chapters[i];
        await saveChapter({
          novelId: novelId,
          title: ch.title,
          content: ch.content,
          chapterNumber: i + 1, 
          status: ch.status || "draft", 
        });
      }

      await deleteOrphanedChapters(novelId, formData.chapters.length);

      showToast("💾 บันทึกข้อมูลฉบับร่างเรียบร้อยแล้ว!", "success", () => {
        router.push("/my-novels");
        router.refresh();
      });
    });
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      showToast("กรุณาระบุชื่อเรื่องนิยายด้วยครับ", "error");
      return;
    }

    startTransition(async () => {
      const novelResult = await updateNovel(novelId, {
        title: formData.title,
        description: formData.synopsis,
        coverImage: formData.coverUrl, 
        category: formData.category, 
        language: formData.language,
      });

      if (!novelResult.success) {
        showToast(novelResult.error || "เกิดข้อผิดพลาดในการอัปเดตนิยาย", "error");
        return;
      }

      for (let i = 0; i < formData.chapters.length; i++) {
        const ch = formData.chapters[i];
        await saveChapter({
          novelId: novelId,
          title: ch.title,
          content: ch.content,
          chapterNumber: i + 1, 
          status: ch.status || "draft",
        });
      }

      await deleteOrphanedChapters(novelId, formData.chapters.length);

      const submitResult = await submitNovelForReview(novelId);
      
      if (submitResult.success) {
        showToast("🎉 ส่งนิยายให้แอดมินตรวจสอบเรียบร้อยแล้ว!", "success", () => {
          router.push("/my-novels");
          router.refresh();
        });
      } else {
        showToast(submitResult.error || "ส่งตรวจสอบไม่สำเร็จ", "error");
      }
    });
  };

  if (loading) return <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#07090E] flex items-center justify-center text-zinc-400 font-sans tracking-[0.3em] uppercase text-[10px] animate-pulse">Loading Canvas...</div>;

  return (
    <div className="min-h-screen bg-background text-zinc-900 dark:text-zinc-100 transition-colors duration-700 pt-32 pb-32 px-4 sm:px-6 lg:px-8 font-sans selection:bg-zinc-200 dark:selection:bg-white/10 relative">
      
      {/* ✨ Luxury Toast Notification */}
      <div 
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-full backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] border transition-all duration-500 ease-out pointer-events-none
          ${toast.show ? "translate-y-0 opacity-100 scale-100" : "-translate-y-8 opacity-0 scale-95"}
          ${toast.type === "success" 
            ? "bg-white/80 dark:bg-[#111] border-zinc-200/50 dark:border-white/10 text-zinc-900 dark:text-white" 
            : "bg-red-50 dark:bg-red-950/40 border-red-200/50 dark:border-red-500/20 text-red-600 dark:text-red-400"}
        `}
      >
        {toast.type === "success" ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} />}
        <span className="text-[11px] font-bold tracking-widest uppercase">{toast.message}</span>
      </div>

      <div className="max-w-[1300px] mx-auto">
        
        {/* Header Studio */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-6 border-b border-zinc-200/60 dark:border-white/[0.04]">
          <div className="space-y-4">
            <Link 
                href="/my-novels" 
                className="group flex items-center gap-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground transition-all hover:text-primary"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/30 backdrop-blur-xl shadow-sm transition-all group-hover:border-primary/50 group-hover:bg-primary/10">
                  <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                </div>
                <span className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    กลับหน้าคลังของฉัน
                </span>
            </Link>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 backdrop-blur-sm">
                  <Crown className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-sans font-bold tracking-[0.25em] uppercase text-primary/80">
                      Yaniyaa • Edit Masterpiece Studio
                  </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight">Refine <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent/80 to-primary/60">Your Story</span></h1>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 md:mt-0 w-full md:w-auto">
            <button 
              onClick={handleUpdate}
              disabled={isPending}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-zinc-500 dark:text-zinc-400 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full border border-zinc-200 dark:border-white/10 transition-all duration-300 ease-out cursor-pointer active:scale-[0.98] disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
            >
              {isPending ? "Saving..." : "บันทึกฉบับร่าง"}
            </button>

            <button 
              onClick={handlePublish}
              disabled={isPending}
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full shadow-lg transition-all duration-300 ease-out cursor-pointer active:scale-[0.98] disabled:opacity-40 hover:shadow-xl hover:scale-[1.02]"
            >
              <Send size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span>{isPending ? "Processing..." : "ส่งตรวจสอบ"}</span>
            </button>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT PANEL */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 🖼️ Cover Image Box (รองรับการอัปโหลดไฟล์) */}
            <div 
              className="group relative aspect-[3/4] rounded-3xl bg-zinc-100 dark:bg-white/[0.01] border border-zinc-200/60 dark:border-white/[0.04] overflow-hidden hover:border-zinc-400 dark:hover:border-white/20 transition-all duration-500 shadow-sm cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {/* Input Type File ที่ซ่อนไว้ */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg, image/png, image/webp"
                className="hidden" 
              />

              {formData.coverUrl ? (
                <img src={formData.coverUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 space-y-3">
                  <ImageIcon size={32} strokeWidth={1.2} />
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase">เพิ่มปกนิยาย</span>
                </div>
              )}
              
              {/* Hover Overlay สำหรับกดเปลี่ยนรูป */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                <Upload size={24} className="text-white" />
                <span className="text-[10px] font-medium tracking-[0.15em] text-white uppercase">คลิกเพื่ออัปโหลด</span>

                {/* กล่องวางลิงก์ (เผื่ออยากใช้ URL) */}
                <div 
                  className="absolute inset-x-0 bottom-0 p-4"
                  onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้ทะลุไปโดนคลิกอัปโหลด
                >
                  <input 
                    type="text" placeholder="หรือวางลิงก์รูปภาพ..." 
                    value={formData.coverUrl} onChange={(e) => setFormData({...formData, coverUrl: e.target.value})}
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-white/60 cursor-text"
                  />
                </div>
              </div>
            </div>

            {/* Config Panel */}
            <div className="bg-white dark:bg-white/[0.01] border border-zinc-200/60 dark:border-white/[0.04] p-6 rounded-3xl space-y-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5"><FolderHeart size={12}/> หมวดหมู่นิยาย</label>
                  <div onClick={() => toggleDropdown("category")} className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/[0.04] hover:border-zinc-400 dark:hover:border-white/20 p-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer">
                    <span className="truncate">
                      {NOVEL_CATEGORIES.find(c => c.id === formData.category)?.label || formData.category}
                    </span>
                    <ChevronDown size={14} className={`text-zinc-400 transition-transform ${activeDropdown === "category" ? "rotate-180" : ""}`} />
                  </div>
                  {activeDropdown === "category" && (
                    <div className="absolute z-20 top-full left-0 w-full mt-2 bg-white dark:bg-[#0E131F] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                      {NOVEL_CATEGORIES.map((opt) => (
                        <div key={opt.id} onClick={() => selectOption("category", opt.id)} className="px-4 py-2.5 text-xs hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer">{opt.label}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5"><ShieldCheck size={12}/> Rating</label>
                  <div onClick={() => toggleDropdown("rating")} className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/[0.04] hover:border-zinc-400 dark:hover:border-white/20 p-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer">
                    <span className="truncate">{formData.rating}</span>
                    <ChevronDown size={14} className={`text-zinc-400 transition-transform ${activeDropdown === "rating" ? "rotate-180" : ""}`} />
                  </div>
                  {activeDropdown === "rating" && (
                    <div className="absolute z-20 top-full left-0 w-full mt-2 bg-white dark:bg-[#0E131F] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                      {["General (G)", "PG-13", "18+ Mature"].map((opt) => (
                        <div key={opt} onClick={() => selectOption("rating", opt)} className="px-4 py-2.5 text-xs hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer">{opt}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5"><Landmark size={12}/> การเข้าถึง</label>
                  <div onClick={() => toggleDropdown("accessType")} className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/[0.04] hover:border-zinc-400 dark:hover:border-white/20 p-3 rounded-xl text-xs flex justify-between items-center transition-all text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer">
                    <span className="truncate">{formData.accessType}</span>
                    <ChevronDown size={14} className={`text-emerald-500 transition-transform ${activeDropdown === "accessType" ? "rotate-180" : ""}`} />
                  </div>
                  {activeDropdown === "accessType" && (
                    <div className="absolute z-20 top-full left-0 w-full mt-2 bg-white dark:bg-[#0E131F] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                      {["FREE", "PREMIUM"].map((opt) => (
                        <div key={opt} onClick={() => selectOption("accessType", opt)} className="px-4 py-2.5 text-xs hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-zinc-900 dark:text-white font-normal">{opt}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5"><Globe2 size={12}/> ภาษา</label>
                  <div onClick={() => toggleDropdown("language")} className="w-full bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/[0.04] hover:border-zinc-400 dark:hover:border-white/20 p-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer">
                    <span className="truncate">
                      {NOVEL_LANGUAGES.find(l => l.id === formData.language)?.label || formData.language}
                    </span>
                    <ChevronDown size={14} className={`text-zinc-400 transition-transform ${activeDropdown === "language" ? "rotate-180" : ""}`} />
                  </div>
                  {activeDropdown === "language" && (
                    <div className="absolute z-20 top-full left-0 w-full mt-2 bg-white dark:bg-[#0E131F] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                      {NOVEL_LANGUAGES.map((opt) => (
                        <div key={opt.id} onClick={() => selectOption("language", opt.id)} className="px-4 py-2.5 text-xs hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer">{opt.label}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Search Tags */}
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-white/[0.04]">
                <label className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5"><Hash size={12} /> Search Tags</label>
                <div className="flex flex-wrap gap-2 p-2 bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/[0.04] rounded-xl focus-within:border-zinc-400 dark:focus-within:border-white/20 transition-all">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-zinc-200/60 dark:bg-white/5 text-[11px] rounded-md flex items-center gap-1.5">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="opacity-40 hover:opacity-100 text-xs">&times;</button>
                    </span>
                  ))}
                  <input 
                    type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                    placeholder="เพิ่มแท็กแล้วกด Enter..."
                    className="flex-1 bg-transparent border-none text-xs p-1 focus:outline-none placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-white dark:bg-white/[0.01] border border-zinc-200/60 dark:border-white/[0.04] p-8 sm:p-14 rounded-3xl space-y-8 shadow-sm hover:shadow-xl transition-shadow duration-500">
              <div className="space-y-2">
                <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-300 dark:text-zinc-600 block">Story Title</label>
                <input 
                  type="text" placeholder="ระบุชื่อเรื่องนิยายชิ้นเอกของคุณ..."
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-transparent border-none p-0 text-3xl sm:text-4xl font-extralight tracking-tight placeholder:text-zinc-200 dark:placeholder:text-zinc-800/80 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-6 border-t border-zinc-100 dark:border-white/[0.03]">
                <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-300 dark:text-zinc-600 flex items-center gap-2"><Sparkles size={12}/> Synopsis</label>
                <textarea 
                  placeholder="เขียนคำโปรยหรือเรื่องย่อสั้นๆ ที่จะดึงดูดใจผู้อ่าน..."
                  rows={4} value={formData.synopsis} onChange={(e) => setFormData({...formData, synopsis: e.target.value})}
                  className="w-full bg-transparent border-none p-0 text-base font-light leading-relaxed placeholder:text-zinc-200 dark:placeholder:text-zinc-800 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Chapters Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Manuscript Pages</h3>
                </div>
                <button 
                  type="button" onClick={addChapter}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200/60 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 cursor-pointer"
                >
                  <Plus size={12} /> เพิ่มหน้า
                </button>
              </div>

              <div className="space-y-6">
                {formData.chapters.map((chapter, index) => (
                  <div key={chapter.id} className="group bg-white dark:bg-white/[0.01] border border-zinc-200/60 dark:border-white/[0.04] rounded-3xl overflow-hidden hover:border-zinc-400 dark:hover:border-white/20 hover:shadow-md transition-all duration-500">
                    
                    <div className="px-6 py-4 bg-zinc-50/50 dark:bg-white/[0.01] border-b border-zinc-100 dark:border-white/[0.02] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-[10px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-widest min-w-[55px]">Page {index + 1}</span>
                        <input 
                          type="text" value={chapter.title}
                          onChange={(e) => {
                            const newChapters = [...formData.chapters];
                            newChapters[index].title = e.target.value;
                            setFormData({...formData, chapters: newChapters});
                          }}
                          placeholder="ตั้งชื่อตอนของคุณ..."
                          className="w-full bg-transparent border-none text-sm font-medium focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const newChapters = [...formData.chapters];
                            newChapters[index].status = newChapters[index].status === "published" ? "draft" : "published";
                            setFormData({...formData, chapters: newChapters});
                          }}
                          className={`px-3 py-1 text-[8px] font-bold tracking-widest uppercase rounded-md border backdrop-blur-md shadow-sm transition-all duration-300 cursor-pointer ${
                            chapter.status === "published"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                          }`}
                        >
                          {chapter.status === "published" ? "Published" : "Draft"}
                        </button>

                        <button 
                          type="button" 
                          onClick={() => {
                            if (formData.chapters.length > 1) {
                              setFormData({...formData, chapters: formData.chapters.filter(c => c.id !== chapter.id)});
                            }
                          }}
                          className="text-zinc-300 hover:text-red-400 p-2 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <textarea 
                      placeholder="จารึกเรื่องราวบทนี้ของคุณ..."
                      value={chapter.content}
                      onChange={(e) => {
                        const newChapters = [...formData.chapters];
                        newChapters[index].content = e.target.value;
                        setFormData({...formData, chapters: newChapters});
                      }}
                      className="w-full min-h-[280px] bg-transparent p-8 sm:p-10 text-sm leading-[2] font-light text-zinc-700 dark:text-zinc-300 focus:outline-none resize-y"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}