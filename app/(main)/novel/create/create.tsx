"use client";

import Link from "next/link";
import React, { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNovel, saveChapter } from "@/app/actions/novel";
import { 
  FolderHeart, Landmark, Image as ImageIcon, 
  Sparkles, Plus, Trash2, ShieldCheck, Globe2, ChevronDown, Crown, ArrowRight,
  Bold, Italic, Underline, List, Smile, Save, UploadCloud, Edit3, Eraser, Link2
} from "lucide-react";

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

const EMOJI_LIST = ["✨", "🔥", "❤️", "🥺", "😂", "💀", "👍", "🙏", "👀", "🗡️"];

export default function CreateNovelPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    coverUrl: "",
    coverFile: null as File | null, 
    category: "fantasy", 
    rating: "General (G)",
    accessType: "FREE",
    language: "thai", 
    chapters: [{ id: 1, title: "บทนำ: ปฐมบทแห่งโชคชะตา", content: "" }]
  });

  const [coverMethod, setCoverMethod] = useState<"upload" | "url">("upload");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [editorState, setEditorState] = useState({
    isOpen: false,
    chapterIndex: 0,
    tempContent: ""
  });

  useEffect(() => {
    if (editorState.isOpen && editorRef.current) {
      editorRef.current.innerHTML = editorState.tempContent;
    }
  }, [editorState.isOpen, editorState.tempContent]);

  const toggleDropdown = (name: string) => setActiveDropdown(activeDropdown === name ? null : name);
  const selectOption = (field: string, value: string) => { setFormData(prev => ({ ...prev, [field]: value })); setActiveDropdown(null); };

  const addChapter = () => {
    const newId = Date.now(); 
    setFormData(prev => ({ ...prev, chapters: [...prev.chapters, { id: newId, title: `ตอนใหม่`, content: "" }] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("ขนาดรูปภาพใหญ่เกินไป กรุณาใช้รูปไม่เกิน 2MB ครับ");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverFile: file, coverUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, coverUrl: e.target.value, coverFile: null }));
  };

  const openEditor = (index: number) => {
    setEditorState({ isOpen: true, chapterIndex: index, tempContent: formData.chapters[index].content });
  };
  
  const saveEditorAndClose = () => {
    const newChapters = [...formData.chapters];
    // ล้างช่องว่างหลอกที่เกิดจากเบราว์เซอร์ก่อนเซฟ
    let content = editorRef.current?.innerHTML || "";
    if (content === "<p><br></p>" || content === "<br>") content = "";
    
    newChapters[editorState.chapterIndex].content = content;
    setFormData(prev => ({ ...prev, chapters: newChapters }));
    setEditorState({ isOpen: false, chapterIndex: 0, tempContent: "" });
    setShowEmoji(false);
  };

  const handleFormat = (e: React.MouseEvent, command: string, value: string | null = null) => {
    e.preventDefault(); 
    document.execCommand(command, false, value || undefined);
    editorRef.current?.focus();
  };

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    document.execCommand("formatBlock", false, value);
    editorRef.current?.focus();
  };

  // 🛡️ [ฟังก์ชันสกัด CSS แฝง]: ป้องกันปัญหากดวางแล้วติดจัดแต่งข้อความจากภายนอกล้นทะลักเข้าเซิร์ฟเวอร์
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    // ดึงเฉพาะข้อมูล Text ธรรมดาออกมา โดยข้าม HTML โครงสร้างเดิมที่ติด Style มา
    const text = e.clipboardData.getData("text/plain");
    // แทรกลงใน Cursor ตนเองในกล่อง Editor
    document.execCommand("insertText", false, text);
  };

  const handleSave = async (statusType: "draft" | "pending") => {
    if (!formData.title.trim()) { alert("กรุณาระบุชื่อเรื่องนิยายครับ"); return; }
    startTransition(async () => {
      let finalCoverUrl = formData.coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e";
      
      const novelResult = await createNovel({
        title: formData.title, description: formData.synopsis, coverImage: finalCoverUrl, 
        type: formData.accessType as "FREE" | "PREMIUM", category: formData.category, 
        language: formData.language, status: statusType 
      });

      if (!novelResult.success || !novelResult.data) { alert(novelResult.error || "เกิดข้อผิดพลาด"); return; }

      for (let i = 0; i < formData.chapters.length; i++) {
        await saveChapter({
          novelId: novelResult.data.id, title: formData.chapters[i].title, 
          content: formData.chapters[i].content, chapterNumber: i + 1, 
          status: statusType === "pending" ? "draft" : statusType, 
        });
      }
      
      if (statusType === "draft") {
        router.push("/my-novels"); 
      } else {
        router.push("/novel/sendNovel"); 
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-zinc-900 dark:text-zinc-100 pt-32 pb-32 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1300px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-6 border-b border-zinc-200/60 dark:border-white/[0.04]">
          <div className="space-y-1">
            <Link href="/novel" className="mb-6 group flex items-center gap-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground transition-all hover:text-primary">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/30 backdrop-blur-xl group-hover:border-primary/50 group-hover:bg-primary/10">
                <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="opacity-60 group-hover:opacity-100">กลับหน้าหลัก</span>
            </Link>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1">
              <Crown className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary/80">Yaniyaa • Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight">Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent/80 to-primary/60">New Novel</span></h1>
          </div>

          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <button 
              onClick={() => handleSave("draft")} disabled={isPending}
              className="px-6 py-3.5 flex items-center gap-2 bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[10px] font-bold tracking-widest uppercase rounded-full border border-zinc-200 dark:border-white/10 transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5 disabled:opacity-40"
            >
              <Save size={14} /> บันทึกร่าง
            </button>
            <button 
              onClick={() => handleSave("pending")} disabled={isPending}
              className="px-8 py-3.5 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg shadow-primary/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-40"
            >
              {isPending ? "กำลังดำเนินการ..." : "ส่งตรวจนิยาย ☛"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Cover & Settings */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Cover Upload/Link Section */}
            <div className="space-y-4">
              <div className="cursor-pointer flex items-center gap-2 bg-zinc-100 dark:bg-white/[0.02] p-1 rounded-xl w-full border border-zinc-200/60 dark:border-white/[0.05]">
                <button 
                  onClick={() => setCoverMethod("upload")} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${coverMethod === "upload" ? "bg-white dark:bg-[#1a1f2e] shadow-sm text-primary" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}
                >
                  <UploadCloud size={14} /> อัปโหลด
                </button>
                <button 
                  onClick={() => setCoverMethod("url")} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${coverMethod === "url" ? "bg-white dark:bg-[#1a1f2e] shadow-sm text-primary" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}
                >
                  <Link2 size={14} /> วางลิงก์
                </button>
              </div>

              {coverMethod === "url" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="url" 
                    placeholder="วางลิงก์รูปภาพที่นี่ (https://...)"
                    value={!formData.coverFile ? formData.coverUrl : ""}
                    onChange={handleUrlInput}
                    className="w-full bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/60 dark:border-white/[0.06] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40"
                  />
                </div>
              )}

              <div 
                onClick={() => coverMethod === "upload" && fileInputRef.current?.click()}
                className={`group relative aspect-[3/4] rounded-3xl bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.06] overflow-hidden transition-all duration-500 shadow-sm flex flex-col items-center justify-center ${coverMethod === "upload" ? "cursor-pointer hover:border-primary/50" : ""}`}
              >
                {formData.coverUrl ? (
                  <>
                    <img src={formData.coverUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    {coverMethod === "upload" && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2"><UploadCloud size={16}/> เปลี่ยนหน้าปก</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 space-y-3 group-hover:text-primary transition-colors">
                    {coverMethod === "upload" ? (
                      <>
                        <UploadCloud size={32} strokeWidth={1.2} />
                        <span className="text-[10px] font-medium tracking-[0.15em] uppercase">อัปโหลดปกนิยาย</span>
                        <span className="text-[9px] opacity-50">PNG, JPG (Max 2MB)</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={32} strokeWidth={1.2} />
                        <span className="text-[10px] font-medium tracking-[0.15em] uppercase">ตัวอย่างภาพปก</span>
                        <span className="text-[9px] opacity-50">วางลิงก์ด้านบนเพื่อแสดงผล</span>
                      </>
                    )}
                  </div>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              </div>
            </div>

            {/* Settings Section */}
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
                      {["FREE"].map((opt) => (
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
            </div>
          </div>

          {/* Right Column: Title, Synopsis, Chapters */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-white/[0.01] border border-zinc-200/60 dark:border-white/[0.04] p-8 sm:p-14 rounded-3xl space-y-8 shadow-sm">
              <div className="space-y-2">
                <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400 block">Story Title</label>
                <input 
                  type="text" placeholder="ระบุชื่อเรื่องนิยายชิ้นเอกของคุณ..." value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-transparent border-none p-0 text-3xl sm:text-4xl font-extralight tracking-tight focus:outline-none placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="space-y-2 pt-6 border-t border-zinc-100 dark:border-white/[0.03]">
                <label className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400 flex items-center gap-2"><Sparkles size={12}/> Synopsis</label>
                <textarea 
                  placeholder="เขียนคำโปรยหรือเรื่องย่อสั้นๆ ที่จะดึงดูดใจผู้อ่าน..." rows={4} value={formData.synopsis} 
                  onChange={(e) => setFormData({...formData, synopsis: e.target.value})}
                  className="w-full bg-transparent border-none p-0 text-base font-light leading-relaxed focus:outline-none resize-none placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Chapters / เนื้อหา</h3>
                <button type="button" onClick={addChapter} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200/60 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer">
                  <Plus size={12} /> เพิ่มตอนใหม่
                </button>
              </div>

              <div className="space-y-4">
                {formData.chapters.map((chapter, index) => (
                  <div key={chapter.id} className="group bg-white dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.06] rounded-2xl p-4 flex items-center justify-between hover:border-primary/40 transition-all shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <input 
                        type="text" value={chapter.title} placeholder="ตั้งชื่อตอนของคุณ..."
                        onChange={(e) => {
                          const newChapters = [...formData.chapters];
                          newChapters[index].title = e.target.value;
                          setFormData({...formData, chapters: newChapters});
                        }}
                        className="flex-1 bg-transparent border-none text-base font-medium focus:outline-none placeholder:text-muted-foreground/40"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditor(index)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/10 text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 size={14} /> เขียนเนื้อหา
                      </button>
                      <button onClick={() => { if (formData.chapters.length > 1) setFormData({...formData, chapters: formData.chapters.filter(c => c.id !== chapter.id)})}} className="text-zinc-400 hover:text-red-500 p-2 transition-colors cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔮 RICH TEXT EDITOR POPUP (MODAL) */}
      {editorState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f121a] w-full max-w-5xl h-[85vh] rounded-[2rem] border border-border/40 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-zinc-50 dark:bg-white/[0.02]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Chapter {editorState.chapterIndex + 1}</span>
                <span className="text-sm font-medium">{formData.chapters[editorState.chapterIndex].title || "ไม่มีชื่อตอน"}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={() => setEditorState({ ...editorState, isOpen: false })} className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors">
                  ยกเลิก
                </button>
                <button onClick={saveEditorAndClose} className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:scale-105 transition-all">
                  ยืนยันเนื้อหา
                </button>
              </div>
            </div>

            {/* Toolbar สำหรับจัด Format */}
            <div className="flex flex-wrap items-center gap-1 p-3 border-b border-border/40 bg-zinc-100/50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-1 pr-3 border-r border-border/40">
                <select onChange={handleHeadingChange} className="bg-transparent text-xs border border-border/40 rounded-lg px-2 py-1 outline-none cursor-pointer">
                  <option value="P">Normal Text</option>
                  <option value="H1">Heading 1</option>
                  <option value="H2">Heading 2</option>
                </select>
              </div>
              
              <button onMouseDown={(e) => handleFormat(e, "bold")} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 text-muted-foreground transition-colors cursor-pointer"><Bold size={16} /></button>
              <button onMouseDown={(e) => handleFormat(e, "italic")} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 text-muted-foreground transition-colors cursor-pointer"><Italic size={16} /></button>
              <button onMouseDown={(e) => handleFormat(e, "underline")} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 text-muted-foreground transition-colors cursor-pointer"><Underline size={16} /></button>
              
              <div className="w-[1px] h-4 bg-border/40 mx-2" />
              
              <button onMouseDown={(e) => handleFormat(e, "insertUnorderedList")} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 text-muted-foreground transition-colors cursor-pointer"><List size={16} /></button>
              <button onMouseDown={(e) => handleFormat(e, "removeFormat")} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 text-muted-foreground transition-colors cursor-pointer" title="ล้าง Format"><Eraser size={16} /></button>
              
              {/* Emoji Picker */}
              <div className="relative">
                <button onMouseDown={(e) => { e.preventDefault(); setShowEmoji(!showEmoji); }} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 text-muted-foreground transition-colors cursor-pointer"><Smile size={16} /></button>
                {showEmoji && (
                  <div className="absolute top-full mt-2 left-0 w-[200px] bg-white dark:bg-[#1a1f2e] border border-border/50 shadow-xl rounded-xl p-3 flex flex-wrap gap-2 z-50 animate-in fade-in zoom-in-95">
                    {EMOJI_LIST.map(emoji => (
                      <button 
                        key={emoji} 
                        onMouseDown={(e) => {
                          handleFormat(e, "insertText", emoji);
                          setShowEmoji(false);
                        }}
                        className="text-xl hover:scale-125 transition-transform cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="w-full text-[9px] text-center text-muted-foreground mt-2 border-t border-border/40 pt-2">หรือใช้ OS Keyboard (Win + .)</div>
                  </div>
                )}
              </div>
            </div>

            {/* 📝 Editable Canvas */}
            <div className="flex-1 p-8 sm:p-12 bg-zinc-50 dark:bg-[#0a0d14] overflow-y-auto">
              <div 
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onPaste={handlePaste} // 🟢 แทรกล้างพฤติกรรม Paste จัดการขยะ Inline CSS
                className="w-full min-h-full bg-transparent outline-none text-base leading-[2.2] font-light text-zinc-800 dark:text-zinc-200 
                [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-6 
                [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:mt-5
                [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4
                [&>p]:mb-4 empty:before:content-['เริ่มเขียนเรื่องราวของคุณตรงนี้...'] empty:before:text-muted-foreground/40 text-left caret-primary"
              />
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}