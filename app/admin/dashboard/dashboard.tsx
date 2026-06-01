"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation"; 
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

import { 
  getPendingNovels, 
  getAllUsers, toggleBanUser, 
  getAllNovels, deleteNovel
} from "@/app/actions/admin";

import { approveNovel, rejectNovel } from "@/app/actions/notification";

import { 
  Check, X, BookOpen, Sparkles, Eye,
  Users, Library, Layers, Trash2, Ban, ShieldCheck, ArrowRight,
  AlertCircle, CheckCircle2
} from "lucide-react";

type TabType = "approvals" | "members" | "library";

type ConfirmDialog = {
  isOpen: boolean;
  title: string;
  message: string;
  actionText: string;
  actionType: "approve" | "reject" | "danger";
  onConfirm: () => void;
} | null;

export default function AdminDashboardPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession(); 
  const router = useRouter(); 

  const [activeTab, setActiveTab] = useState<TabType>("approvals");
  const [pendingNovels, setPendingNovels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allNovels, setAllNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [viewingNovel, setViewingNovel] = useState<any | null>(null);
  const [viewingChapter, setViewingChapter] = useState<any | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    const [pendingRes, usersRes, novelsRes] = await Promise.all([
      getPendingNovels(),
      getAllUsers(),
      getAllNovels()
    ]);
    if (pendingRes.success) setPendingNovels(pendingRes.data || []);
    if (usersRes.success) setUsers(usersRes.data || []);
    if (novelsRes.success) setAllNovels(novelsRes.data || []);
    setLoading(false);
  };
  
  useEffect(() => {
    if (!sessionLoading) {
      if (!session || session.user.role !== "ADMIN") {
        router.replace("/");
      } else {
        loadDashboardData();
      }
    }
  }, [session, sessionLoading, router]);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const openConfirm = (dialog: Omit<NonNullable<ConfirmDialog>, "isOpen">) => {
    setConfirmDialog({ isOpen: true, ...dialog });
  };

  // ─── Action Handlers ────────────────────────────────────────────────────────

  const handleApprove = (id: string) => {
    openConfirm({
      title: "ยืนยันการอนุมัติ",
      message: "นิยายเรื่องนี้จะถูกเผยแพร่ขึ้นหน้าเว็บหลักทันที และผู้เขียนจะได้รับการแจ้งเตือน",
      actionText: "อนุมัติผลงาน",
      actionType: "approve",
      onConfirm: () => {
        setConfirmDialog(null);
        startTransition(async () => {
          if ((await approveNovel(id)).success) {
            loadDashboardData();
            setViewingNovel(null);
          }
        });
      }
    });
  };

  const handleReject = (id: string) => {
    openConfirm({
      title: "ปฏิเสธผลงาน",
      message: "ระบบจะส่งแจ้งเตือนไปยังผู้เขียนว่าผลงานยังไม่ผ่านการตรวจสอบ",
      actionText: "ปฏิเสธผลงาน",
      actionType: "reject",
      onConfirm: () => {
        setConfirmDialog(null);
        startTransition(async () => {
          if ((await rejectNovel(id)).success) {
            loadDashboardData();
            setViewingNovel(null);
          }
        });
      }
    });
  };

  // ─── Bulk Actions ────────────────────────────────────────────────────────────

  const handleApproveAll = () => {
    openConfirm({
      title: "อนุมัติทั้งหมด",
      message: `นิยายที่รอตรวจทั้งหมด ${pendingNovels.length} เรื่องจะถูกอนุมัติพร้อมกัน ยืนยันดำเนินการ?`,
      actionText: `อนุมัติ ${pendingNovels.length} เรื่อง`,
      actionType: "approve",
      onConfirm: () => {
        setConfirmDialog(null);
        startTransition(async () => {
          await Promise.all(pendingNovels.map(n => approveNovel(n.id)));
          loadDashboardData();
        });
      }
    });
  };

  const handleRejectAll = () => {
    openConfirm({
      title: "ปฏิเสธทั้งหมด",
      message: `นิยายที่รอตรวจทั้งหมด ${pendingNovels.length} เรื่องจะถูกปฏิเสธพร้อมกัน ยืนยันดำเนินการ?`,
      actionText: `ปฏิเสธ ${pendingNovels.length} เรื่อง`,
      actionType: "reject",
      onConfirm: () => {
        setConfirmDialog(null);
        startTransition(async () => {
          await Promise.all(pendingNovels.map(n => rejectNovel(n.id)));
          loadDashboardData();
        });
      }
    });
  };

  const handleToggleBan = (userId: string, currentStatus: boolean) => {
    const actionText = currentStatus ? "ปลดแบน" : "ระงับการใช้งาน";
    openConfirm({
      title: `ยืนยันการ${actionText}`,
      message: `คุณแน่ใจใช่ไหมที่จะ "${actionText}" สมาชิกท่านนี้?`,
      actionText,
      actionType: currentStatus ? "approve" : "danger",
      onConfirm: () => {
        setConfirmDialog(null);
        startTransition(async () => {
          const res = await toggleBanUser(userId, currentStatus);
          if (res.success) loadDashboardData();
        });
      }
    });
  };

  const handleExileNovel = (novelId: string) => {
    openConfirm({
      title: "ลบนิยายถาวร",
      message: "การลบจะลบข้อมูลตอนย่อยทั้งหมดออกจากฐานข้อมูลอย่างถาวร ไม่สามารถกู้คืนได้",
      actionText: "ยืนยันลบทิ้งถาวร",
      actionType: "danger",
      onConfirm: () => {
        setConfirmDialog(null);
        startTransition(async () => {
          const res = await deleteNovel(novelId);
          if (res.success) {
            loadDashboardData();
            setViewingNovel(null);
          }
        });
      }
    });
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-zinc-400 font-sans tracking-[0.3em] uppercase text-[10px] animate-pulse">
        Establishing Nexus Connection...
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#07090E] text-zinc-950 dark:text-zinc-50 pt-28 pb-32 px-4 sm:px-8 font-sans transition-colors duration-700 relative">
      
      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="bg-card border border-border/50 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4">
            <span className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-bold tracking-widest uppercase text-foreground">Processing...</span>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto">
        
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-zinc-200/60 dark:border-white/[0.04]">
          <div>
            <Link 
              href="/novel" 
              className="mb-6 group flex flex-row-reverse lg:flex-row items-center gap-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground transition-all hover:text-primary w-fit"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/30 backdrop-blur-xl shadow-sm transition-all group-hover:border-primary/50 group-hover:bg-primary/10">
                <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="hidden md:block opacity-60 group-hover:opacity-100 transition-opacity duration-300">กลับหน้าหลัก</span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-500/20 bg-zinc-500/5 px-3 py-0.5 backdrop-blur-sm mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-primary/80">Yaniyaa Central Control</span>
            </div>

            <h1 className="text-3xl font-light tracking-tight text-zinc-500 dark:text-zinc-400">
              Admin{" "}
              <span className="relative inline-flex items-baseline gap-3">
                <span className="font-normal text-zinc-600 dark:text-zinc-300 tracking-wide">Studio</span>
                <span className="self-center w-px h-3.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                <span className="font-semibold bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
                  Workspace
                </span>
              </span>
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex bg-zinc-100 dark:bg-white/[0.02] p-1 rounded-xl border border-zinc-200/40 dark:border-white/[0.02] self-start">
            {(["approvals", "members", "library"] as TabType[]).map((tab) => {
              const labels = {
                approvals: `คิวตรวจ (${pendingNovels.length})`,
                members: `จัดการสมาชิก (${users.length})`,
                library: `คลังรวม (${allNovels.length})`
              };
              const icons = {
                approvals: <Layers size={13}/>,
                members: <Users size={13}/>,
                library: <Library size={13}/>
              };
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-white dark:bg-white/5 text-zinc-950 dark:text-white shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  }`}
                >
                  {icons[tab]} {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="space-y-6">

          {/* TAB 1: APPROVALS */}
          {activeTab === "approvals" && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Manuscript Submissions</h3>
                {pendingNovels.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button onClick={handleRejectAll} disabled={isPending}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer disabled:opacity-50">
                      ปฏิเสธทั้งหมด
                    </button>
                    <button onClick={handleApproveAll} disabled={isPending}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer disabled:opacity-50">
                      อนุมัติทั้งหมด
                    </button>
                  </div>
                )}
              </div>

              {pendingNovels.length === 0 ? (
                <EmptyState text="ไม่มีนิยายค้างตรวจสอบในขณะนี้" />
              ) : (
                <div className="grid gap-3">
                  {pendingNovels.map((novel) => (
                    <div key={novel.id} className="bg-white dark:bg-white/[0.01] border border-zinc-200/60 dark:border-white/[0.04] p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 group hover:border-zinc-400 dark:hover:border-white/20 transition-all duration-300">
                      <div onClick={() => setViewingNovel(novel)} className="flex items-center gap-4 min-w-0 cursor-pointer flex-1">
                        <img src={novel.coverImage} alt="" className="w-10 h-14 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-900 shadow-sm flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                            {novel.title} <Eye size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-1 font-light mt-0.5">{novel.description || "ไม่มีคำโปรย..."}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            <span className="bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md text-[9px]">{novel.category}</span>
                            <span className="flex items-center gap-1 font-normal text-zinc-400/80"><BookOpen size={10}/> {novel.chapters?.length || 0} ตอน</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleReject(novel.id)} disabled={isPending} className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-zinc-500 transition-all cursor-pointer"><X size={15}/></button>
                        <button onClick={() => handleApprove(novel.id)} disabled={isPending} className="p-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-80 transition-all cursor-pointer"><Check size={15}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEMBERS */}
          {activeTab === "members" && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 px-1">Registered Users</h3>
              <div className="border border-zinc-200/60 dark:border-white/[0.04] rounded-2xl overflow-hidden bg-white dark:bg-white/[0.01]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200/60 dark:border-white/[0.04] bg-zinc-50/50 dark:bg-white/[0.01] text-zinc-400 text-[10px] font-bold tracking-wider uppercase">
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/40 dark:divide-white/[0.02]">
                      {users.map((user) => (
                        <tr key={user.id} className={`group hover:bg-zinc-50/40 dark:hover:bg-white/[0.01] transition-colors ${user.banned ? "opacity-50" : ""}`}>
                          <td className="p-4 flex items-center gap-3 font-medium">
                            <img src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} alt="" className="w-7 h-7 rounded-full object-cover bg-zinc-200 dark:bg-zinc-800" />
                            <div>
                              <p className="font-normal">{user.name || "Anonymous"}</p>
                              {user.banned && <span className="text-[8px] bg-rose-500/10 text-rose-500 font-bold tracking-widest uppercase px-1 rounded">Banned</span>}
                            </div>
                          </td>
                          <td className="p-4 text-zinc-400 font-light">{user.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider ${user.role === "ADMIN" ? "bg-amber-500/10 text-amber-500" : "bg-zinc-100 dark:bg-white/5 text-zinc-400"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {user.role !== "ADMIN" && (
                              <button onClick={() => handleToggleBan(user.id, !!user.banned)} disabled={isPending}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                                  user.banned
                                    ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10 hover:bg-emerald-500 hover:text-white"
                                    : "bg-rose-500/5 text-rose-500 border-rose-500/10 hover:bg-rose-500 hover:text-white"
                                }`}>
                                {user.banned ? <ShieldCheck size={11}/> : <Ban size={11}/>}
                                {user.banned ? "Unban" : "Ban User"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIBRARY */}
          {activeTab === "library" && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 px-1">Global Library Control</h3>
              {allNovels.length === 0 ? (
                <EmptyState text="ไม่มีนิยายอยู่ในระบบใดๆ" />
              ) : (
                <div className="grid gap-3">
                  {allNovels.map((novel) => (
                    <div key={novel.id} className="bg-white dark:bg-white/[0.01] border border-zinc-200/60 dark:border-white/[0.04] p-4 rounded-2xl flex items-center justify-between gap-4 group hover:border-zinc-400 dark:hover:border-white/20 transition-all duration-300">
                      <div onClick={() => setViewingNovel(novel)} className="flex items-center gap-4 min-w-0 cursor-pointer flex-1">
                        <img src={novel.coverImage} alt="" className="w-9 h-12 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-900 shadow-sm flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors flex items-center gap-2">
                            {novel.title} <Eye size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold uppercase text-zinc-400">
                            <span className={`px-1 rounded ${novel.status === "approved" ? "bg-emerald-500/10 text-emerald-500" : novel.status === "pending" ? "bg-amber-500/10 text-amber-500" : "bg-zinc-100 dark:bg-white/5"}`}>
                              {novel.status}
                            </span>
                            <span>•</span>
                            <span className="font-normal font-sans">{novel.category}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleExileNovel(novel.id)} disabled={isPending}
                        className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-zinc-400 transition-all cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Novel Inspect Modal ── */}
      {viewingNovel && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0B0F17] border border-zinc-200 dark:border-white/[0.06] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
            <button onClick={() => setViewingNovel(null)} className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer">
              <X size={16}/>
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img src={viewingNovel.coverImage} alt="" className="w-28 h-40 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-900 shadow-md mx-auto sm:mx-0 flex-shrink-0"/>
              <div className="space-y-3 text-center sm:text-left min-w-0 w-full">
                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary">
                  {viewingNovel.category || "General"}
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight text-foreground break-words">
                  {viewingNovel.title}
                </h2>
                <p className="text-[10px] text-zinc-400 tracking-wider uppercase">
                  Status: <span className={viewingNovel.status === "pending" ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>{viewingNovel.status}</span>
                </p>
              </div>
            </div>

            <hr className="border-zinc-200/60 dark:border-white/[0.04]"/>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">คำโปรย / ข้อมูลนิยายทั้งหมด</h4>
              <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/40 dark:border-white/[0.02] rounded-2xl p-4 sm:p-5 text-sm font-light leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap max-h-[250px] overflow-y-auto">
                {viewingNovel.description || "ผู้เขียนไม่ได้ระบุคำโปรยเอาไว้..."}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
                <BookOpen size={11}/> รายชื่อตอนย่อย ({viewingNovel.chapters?.length || 0} ตอน)
                <span className="text-[9px] font-normal tracking-normal text-zinc-500/80 lowercase">(คลิกที่ตอนเพื่ออ่านเนื้อหา)</span>
              </h4>
              {viewingNovel.chapters?.length > 0 ? (
                <div className="grid gap-2 max-h-[180px] overflow-y-auto pr-1">
                  {viewingNovel.chapters.map((chapter: any, idx: number) => (
                    <div key={chapter.id || idx} onClick={() => chapter.content && setViewingChapter(chapter)}
                      className={`text-xs bg-zinc-50/50 dark:bg-white/[0.005] border border-zinc-200/30 dark:border-white/[0.01] px-4 py-2.5 rounded-xl flex justify-between text-zinc-500 dark:text-zinc-400 font-light ${chapter.content ? "cursor-pointer hover:border-zinc-400 dark:hover:border-white/20 transition-all group/chapter" : ""}`}>
                      <span className="truncate pr-4 font-normal text-foreground flex items-center gap-2 group-hover/chapter:text-primary transition-colors">
                        {chapter.title || `ตอนที่ ${idx + 1}`}
                        {chapter.content && <Eye size={11} className="text-zinc-400 opacity-60 group-hover/chapter:opacity-100 transition-opacity"/>}
                      </span>
                      <span className="text-[10px] text-zinc-400/60 flex-shrink-0">
                        {chapter.content ? `${chapter.content.length} อักษร` : "ไม่มีเนื้อหา"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-zinc-400 font-light px-1">ยังไม่มีการเพิ่มตอนย่อยในนิยายเรื่องนี้</p>
              )}
            </div>

            {viewingNovel.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleReject(viewingNovel.id)} disabled={isPending} className="flex-1 py-3 text-xs font-semibold rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer">ปฏิเสธผลงาน</button>
                <button onClick={() => handleApprove(viewingNovel.id)} disabled={isPending} className="flex-1 py-3 text-xs font-semibold rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black hover:opacity-80 transition-all cursor-pointer">อนุมัติขึ้นเว็บ</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Chapter Reader Modal ── */}
      {viewingChapter && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-[#090D14] border border-zinc-200 dark:border-white/[0.08] shadow-2xl rounded-3xl p-6 sm:p-10 space-y-6">
            <button onClick={() => setViewingChapter(null)} className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer">
              <X size={16}/>
            </button>
            <div className="space-y-1">
              <p className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">{viewingNovel?.title}</p>
              <h3 className="text-lg font-medium text-foreground tracking-tight">{viewingChapter.title || "ตอนที่ไม่มีชื่อ"}</h3>
            </div>
            <hr className="border-zinc-200/60 dark:border-white/[0.04]"/>
            <div className="text-sm font-light leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap tracking-wide antialiased max-h-[45vh] overflow-y-auto pr-2">
              {viewingChapter.content || <span className="italic text-zinc-400 font-light">ตอนนี้ไม่มีเนื้อหาอักษรอยู่ภายในระบบ...</span>}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingChapter(null)} className="px-5 py-2 rounded-xl text-xs bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-medium transition-all cursor-pointer">
                ปิดหน้าต่างอ่าน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Confirm Modal ── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0B0F17] border border-zinc-200 dark:border-white/[0.08] shadow-2xl rounded-3xl overflow-hidden">
            
            {/* Accent bar */}
            <div className={`h-0.5 w-full ${
              confirmDialog.actionType === "approve"
                ? "bg-emerald-500"
                : "bg-rose-500"
            }`} />

            <div className="p-7 text-center space-y-5">

              {/* Icon */}
              <div className={`mx-auto w-11 h-11 flex items-center justify-center rounded-2xl ${
                confirmDialog.actionType === "approve"
                  ? "bg-emerald-50 dark:bg-emerald-500/10"
                  : "bg-rose-50 dark:bg-rose-500/10"
              }`}>
                {confirmDialog.actionType === "approve" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : confirmDialog.actionType === "reject" ? (
                  <X className="w-5 h-5 text-rose-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>

              {/* Text */}
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {confirmDialog.title}
                </h3>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-light leading-relaxed px-3">
                  {confirmDialog.message}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setConfirmDialog(null)}
                  disabled={isPending}
                  className="flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase rounded-xl
                    border border-transparent
                    bg-zinc-100 dark:bg-white/5
                    text-zinc-500 dark:text-zinc-400
                    hover:bg-rose-50 dark:hover:bg-rose-500/10
                    hover:text-rose-500 dark:hover:text-rose-400
                    hover:border-rose-200 dark:hover:border-rose-500/20
                    transition-all duration-200 cursor-pointer disabled:opacity-40"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  disabled={isPending}
                  className={`flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 active:scale-[0.98] ${
                    confirmDialog.actionType === "approve"
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-rose-500 hover:bg-rose-600 text-white"
                  }`}
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3 w-3 rounded-full border border-white/60 border-t-transparent animate-spin" />
                      Processing
                    </span>
                  ) : (
                    confirmDialog.actionText
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-20 text-center border border-dashed border-zinc-200 dark:border-white/[0.04] rounded-2xl bg-white dark:bg-white/[0.01]">
      <Sparkles className="mx-auto h-6 w-6 text-zinc-300 dark:text-zinc-700 mb-2" strokeWidth={1}/>
      <p className="text-[10px] tracking-widests text-zinc-400 uppercase font-bold">{text}</p>
    </div>
  );
}