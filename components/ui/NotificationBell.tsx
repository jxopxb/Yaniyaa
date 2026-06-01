"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { Bell, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
// ✨ อิมพอร์ต clearAllNotifications เข้ามาใช้งานมึง
import { getUserNotifications, markAsRead, markAllAsRead, clearAllNotifications } from "@/app/actions/notification";
import { useRouter } from "next/navigation";

const notificationStyles: Record<string, string> = {
  APPROVED: "border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/[0.01]",
  REJECTED: "border-red-500/20 dark:border-red-500/10 bg-red-500/[0.01]",
  NEW_NOVEL: "border-violet-500/20 dark:border-violet-500/10 bg-violet-500/[0.01]",
  NEW_CHAPTER: "border-sky-500/20 dark:border-sky-500/10 bg-sky-500/[0.01]",
  USER_BANNED: "border-amber-500/20 dark:border-amber-500/10 bg-amber-500/[0.01]",
};

export default function NotificationBell() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);
  
  // ✨ ใช้ useTransition ควบคุมความลักชูตอนสั่งล้างข้อมูล
  const [isClearing, startTransition] = useTransition();

  // ======================================================
  // 📥 LOAD NOTIFICATIONS FROM SERVER
  // ======================================================
  const loadNotifications = async () => {
    if (!session?.user?.id) return;
    const res = await getUserNotifications(session.user.id);
    
    console.log("🔔 [Yaniyaa Debug] ข้อมูลแจ้งเตือนล่าสุดในกระดิ่ง:", res);

    if (res.success) {
      setNotifications(res.data);
    }
  };

  useEffect(() => {
    if (!session?.user?.id || hasLoaded.current) return;
    hasLoaded.current = true;

    loadNotifications();
    
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
  }, [session]);

  // ======================================================
  // 🖱️ CLOSE DROPDOWN WHEN CLICK OUTSIDE
  // ======================================================
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ======================================================
  // 🔔 CALCULATE UNREAD COUNT
  // ======================================================
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  // ======================================================
  // 👁️ MARK AS READ ACTION
  // ======================================================
  const handleMarkOne = async (id: string) => {
    const res = await markAsRead(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleMarkAll = async () => {
    if (!session?.user?.id) return;
    const res = await markAllAsRead(session.user.id);
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  // ======================================================
  // 🗑️ CLEAR ALL NOTIFICATIONS ACTION (เฉพาะของยูสเซอร์ตัวเอง)
  // ======================================================
  const handleClearAll = () => {
    if (!session?.user?.id) return;
    
    if (confirm("คุณต้องการล้างข้อความแจ้งเตือนทั้งหมดใช่หรือไม่?")) {
      startTransition(async () => {
        const res = await clearAllNotifications(session.user.id);
        if (res.success) {
          // เคลียร์ข้อมูลในสเตตหน้าบ้านทันทีแบบสมูทๆ
          setNotifications([]);
        }
      });
    }
  };

  if (!session) return null;

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* BUTTON INDICATOR */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-zinc-200/40 dark:border-white/[0.02] bg-zinc-50 dark:bg-white/[0.01] hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer"
      >
        <Bell size={16} strokeWidth={1.5} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN CONTAINER */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 z-50 bg-white/80 dark:bg-[#07090E]/90 backdrop-blur-xl border border-zinc-200/60 dark:border-white/[0.04] shadow-2xl rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* CONTROL HEADER */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-white/[0.04]">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold tracking-wide uppercase text-zinc-950 dark:text-white">
                Notifications
              </h4>
              <p className="text-[10px] text-zinc-400 font-light">
                กล่องแจ้งเตือนของคุณ
              </p>
            </div>
            
            {/* 🛠️ ปุ่มโซนจัดการแจ้งเตือนด้านขวา */}
            <div className="flex items-center gap-3">
              {hasUnread && (
                <button
                  onClick={handleMarkAll}
                  className="text-[10px] underline underline-offset-4 text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors"
                >
                  อ่านทั้งหมด
                </button>
              )}
              
              {/* ✨ ปุ่มล้างข้อความทั้งหมดเฉพาะตัวเอง เพิ่มใหม่ลักชูสุดๆ */}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="text-[10px] underline underline-offset-4 text-red-400/80 hover:text-red-500 disabled:text-zinc-600 cursor-pointer transition-colors"
                >
                  {isClearing ? "กำลังล้าง..." : "ล้างทั้งหมด"}
                </button>
              )}
            </div>
          </div>

          {/* MAIN VIRTUAL LIST */}
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="py-12 text-center space-y-1">
                <Sparkles className="mx-auto h-4 w-4 text-zinc-300 dark:text-zinc-700" />
                <p className="text-[10px] tracking-widest text-zinc-400 uppercase font-light">
                  ไม่มีการแจ้งเตือน
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.isRead) {
                      handleMarkOne(item.id);
                    }

                    if (item.chapterId && item.novelId) {
                      router.push(`/novel/${item.novelId}/chapter/${item.chapterId}`);
                      setIsOpen(false);
                      return;
                    }

                    if (item.novelId) {
                      router.push(`/novel/${item.novelId}`);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all relative group cursor-pointer ${
                    notificationStyles[item.type] || "border-zinc-100 dark:border-white/[0.01]"
                  } ${
                    item.isRead
                      ? "opacity-40 bg-transparent border-zinc-100 dark:border-white/[0.01]"
                      : "bg-zinc-50/50 dark:bg-white/[0.02] hover:border-zinc-400 dark:hover:border-white/20"
                  }`}
                >
                  {/* UNREAD STATUS DOT */}
                  {!item.isRead && (
                    <span className="absolute top-[18px] left-3 h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}

                  <div className={`flex gap-3 items-start ${!item.isRead ? "pl-3.5" : ""}`}>
                    {/* CUSTOM COVER THUMBNAIL */}
                    {item.coverUrl && (
                      <img
                        src={item.coverUrl}
                        alt="cover"
                        className="w-9 h-12 rounded-md object-cover flex-shrink-0 border border-zinc-200/40 dark:border-white/[0.05]"
                      />
                    )}

                    {/* CONTENT COMPONENT */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <h5 className="text-xs font-medium leading-tight truncate text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 font-light">
                        {item.content}
                      </p>
                      <span className="block text-[8px] text-zinc-500 uppercase tracking-wider pt-1">
                        {new Date(item.createdAt).toLocaleString("th-TH", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}