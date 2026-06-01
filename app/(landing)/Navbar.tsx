"use client"

import { usePathname } from "next/navigation" 
import Link from "next/link"
import { useState, useEffect, useSyncExternalStore, useRef } from "react"
import { Sparkles, Moon, SunSnow, Menu, X, LogOut, ChevronDown, LibraryBig, SquarePen, NotebookPen, UserStar, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "@/lib/auth-client" 
import Image from "next/image"
import NotificationBell from "@/components/ui/NotificationBell"

// --- 1. SignOutButton Component ---
function SignOutButton() {
    return (
        <button 
            onClick={async () => {
                await signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            window.location.href = "/" 
                        },
                    },
                })
            }}
            className="group w-full flex items-center gap-3 px-3 py-2.5 text-[#ff3b3b] hover:bg-[#ff3b3b]/5 rounded-xl transition-all text-left cursor-pointer"
        >
            <div className="p-2 rounded-full bg-[#ff3b3b]/10 group-hover:bg-[#ff3b3b]/20 transition-colors shrink-0">
                <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium font-sans">ออกจากระบบ</span>
        </button>
    )
}

// --- 2. Theme Store ---
const themeStore = {
    getSnapshot: (): boolean => typeof window !== 'undefined' && document.documentElement.classList.contains('dark'),
    getServerSnapshot: (): boolean => false,
    subscribe: (callback: () => void): (() => void) => {
        const observer = new MutationObserver(callback)
        if (typeof window !== 'undefined') {
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        }
        return () => observer.disconnect()
    },
    setTheme: (isDark: boolean): void => {
        const root = document.documentElement
        if (isDark) { root.classList.add('dark'); localStorage.setItem('theme', 'dark') }
        else { root.classList.remove('dark'); localStorage.setItem('theme', 'light') }
    },
    initTheme: (): void => {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem('theme')
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (saved === 'dark' || (!saved && system)) document.documentElement.classList.add('dark')
    }
}

// --- 3. User Dropdown (Desktop Only View Style) ---
function UserDropdown({ session }: { session: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const initials = (session?.user?.name || "U")[0].toUpperCase()

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 rounded-full p-1 pr-3 transition-all cursor-pointer",
                    isOpen ? "bg-[#1a1f2e] ring-1 ring-white/10 shadow-lg" : "hover:bg-muted/40"
                )}
            >
                <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#3d3a2e] border-2 border-[#5c5436] flex items-center justify-center overflow-hidden">
                        {session.user?.image ? (
                            <Image src={session.user.image} alt="Avatar" width={32} height={32} className="object-cover" />
                        ) : (
                            <span className="text-[#facc15] font-bold text-sm font-sans">{initials}</span>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00ff41] border-[2px] border-[#0f121a] rounded-full" />
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] w-64 bg-[#0f121a] rounded-[1.5rem] shadow-2xl border border-white/5 py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-3">
                        <div className="flex items-center gap-2 mb-1.5 text-[#facc15]">
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            <span className="text-[10px] font-black font-sans uppercase tracking-[0.2em]">MEMBERSHIP</span>
                        </div>
                        <p className="text-lg font-bold text-white truncate font-novel">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate font-sans">{session.user?.email}</p>
                    </div>
                    <div className="h-[1px] bg-white/5 w-full my-2" />
                    <div className="px-2 space-y-1">
                        {session?.user?.role === "ADMIN" && (
                            <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="group flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors shrink-0">
                                    <UserStar className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium font-sans">แอดมิน</span>
                            </Link>
                        )}
                        <SignOutButton />
                    </div>
                </div>
            )}
        </div>
    )
}

// --- 4. Main Navbar ---
export default function Navbar() {
    const { data: session, isPending } = useSession()
    const pathname = usePathname() 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const isDarkMode = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot, themeStore.getServerSnapshot)
    const [activeSection, setActiveSection] = useState("home")

    useEffect(() => { themeStore.initTheme() }, [])

    useEffect(() => {
        if (pathname !== "/") return 

        const observerOptions = {
            root: null,
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
        }

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id)
                }
            })
        }

        const observer = new IntersectionObserver(observerCallback, observerOptions)
        const sectionIds = ["home", "popular", "footer_"] 
        sectionIds.forEach((id) => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [pathname])

    const navLinks = [
        { href: "/", label: "หน้าแรก", id: "home" },
        { href: session ? "/novel" : "/auth/signin", label: "คลังนิยาย", id: "novel" },
        { href: "/#popular", label: "ยอดนิยม", id: "popular" },
        { href: "/#footer_", label: "ติดต่อเรา", id: "footer_" },
        { href: "/donate", label: "จะเปย์เรา", id: "donate" },
    ]

    const mobileInitials = (session?.user?.name || "U")[0].toUpperCase()

    return (
        <header className="fixed left-0 top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/40 transition-all duration-500">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
                
                <div className="flex items-center gap-4 lg:get-8">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="relative">
                            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary transition-transform duration-500 group-hover:rotate-12" />
                            <div className="absolute inset-0 blur-lg bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-lg sm:text-xl font-novel font-bold tracking-tighter text-foreground uppercase">
                            Yaniyaa
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => {
                            const isHomePage = pathname === "/"
                            const isActive = isHomePage 
                                ? activeSection === link.id 
                                : pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative py-1 text-sm font-sans font-medium transition-all",
                                        isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                                    )}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                    {isPending ? (
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                    ) : session ? ( 
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden lg:flex items-center gap-4 mr-2 border-r border-border/40 pr-4">
                                <Link href="/novel/create" className="text-[10px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1.5 uppercase tracking-widest font-sans">
                                    <SquarePen className="w-3.5 h-3.5" /> สร้างนิยายของคุณ
                                </Link>
                                <Link href="/history" className="text-[10px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1.5 uppercase tracking-widest font-sans">
                                    <LibraryBig className="w-3.5 h-3.5" /> ประวัติการอ่าน
                                </Link>
                                <Link href="/my-novels" className="text-[10px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1.5 uppercase tracking-widest font-sans">
                                    <NotebookPen className="w-3.5 h-3.5" /> นิยายของฉัน
                                </Link>
                                <Link href="/novel/liked" className="text-[10px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1.5 uppercase tracking-widest font-sans">
                                    <Heart className="w-3.5 h-3.5" /> รายการโปรด
                                </Link>
                            </div>
                            
                            {/* Desktop Profile Trigger */}
                            <div className="hidden sm:block shrink-0">
                                <UserDropdown session={session} />
                            </div>

                            {/* Mobile Static Avatar Indicator */}
                            <div className="sm:hidden relative shrink-0 w-8 h-8 rounded-full bg-[#3d3a2e] border-2 border-[#5c5436] flex items-center justify-center overflow-hidden">
                                {session.user?.image ? (
                                    <Image src={session.user.image} alt="Avatar" width={32} height={32} className="object-cover" />
                                ) : (
                                    <span className="text-[#facc15] font-bold text-xs font-sans">{mobileInitials}</span>
                                )}
                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#00ff41] border border-[#0f121a] rounded-full" />
                            </div>

                            <NotificationBell />
                        </div>
                    ) : ( 
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link href="/auth/signin">
                                <Button variant="ghost" className="text-xs sm:text-sm font-sans font-medium hover:text-primary cursor-pointer px-2 sm:px-3">เข้าสู่ระบบ</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-sans font-bold px-3 sm:px-5 rounded-xl transition-all cursor-pointer">สมัครสมาชิก</Button>
                            </Link>
                        </div>
                    )}
                    
                    <button onClick={() => themeStore.setTheme(!isDarkMode)} className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary transition-all shrink-0">
                        {isDarkMode ? <SunSnow className="h-5 w-5 cursor-pointer" /> : <Moon className="h-5 w-5 cursor-pointer" />}
                    </button>

                    <button className="lg:hidden p-1.5 sm:p-2 text-muted-foreground shrink-0" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </button>
                </div>
            </div>

            {/* 📱 [แผงเมนูมือถือฉบับปรับปรุง]: เพิ่มการรับรอง Responsive ลักชูมินิมอลตึงๆ */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-x-0 top-16 bg-background/95 backdrop-blur-2xl border-b border-border/40 shadow-2xl overflow-y-auto max-h-[calc(100vh-64px)] z-50 animate-in slide-in-from-top-5 duration-300 ease-out">
                    <div className="max-w-md mx-auto py-6 px-5 space-y-6">
                        
                        {/* 🌟 [ใหม่] ส่วน Profile Account บนมือถือ: สวย เรียบ คลีน ไม่รกสายตา */}
                        {session && (
                            <div className="p-4 rounded-2xl border border-border/40 bg-muted/20 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-[#3d3a2e] border-2 border-[#5c5436] flex items-center justify-center overflow-hidden">
                                            {session.user?.image ? (
                                                <Image src={session.user.image} alt="Avatar" width={40} height={40} className="object-cover" />
                                            ) : (
                                                <span className="text-[#facc15] font-bold text-xs font-sans">{mobileInitials}</span>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00ff41] border-[2px] border-background rounded-full" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1 text-[#facc15] mb-0.5">
                                            <Sparkles className="w-3 h-3 fill-current" />
                                            <span className="text-[8px] font-black tracking-[0.15em] font-sans uppercase">MEMBERSHIP</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-foreground truncate font-novel leading-none mb-1">{session.user?.name}</h4>
                                        <p className="text-[11px] text-muted-foreground truncate font-sans font-light leading-none">{session.user?.email}</p>
                                    </div>
                                </div>

                                {/* ลิงก์แดชบอร์ดแอดมินสำหรับกรณีสิทธิ์ ADMIN */}
                                {session?.user?.role === "ADMIN" && (
                                    <Link 
                                        href="/admin/dashboard" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full flex items-center justify-between px-3 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all"
                                    >
                                        <div className="flex items-center gap-2 text-primary">
                                            <UserStar className="w-3.5 h-3.5" />
                                            <span className="text-[11px] font-medium font-sans">แผงควบคุมแอดมิน</span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-primary -rotate-90" />
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* 1. ส่วนลิงก์เมนูหลัก */}
                        <div className="flex flex-col space-y-1">
                            <p className="text-[9px] font-bold tracking-[0.15em] text-muted-foreground/50 uppercase mb-2 px-1">
                                ⚽︎ เมนูหลัก
                            </p>
                            {navLinks.map((link) => {
                                const isHomePage = pathname === "/"
                                const isActive = isHomePage 
                                    ? activeSection === link.id 
                                    : pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))

                                return (
                                    <Link 
                                        key={link.href} 
                                        href={link.href} 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className={cn(
                                            "flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm font-sans font-medium transition-all",
                                            isActive 
                                                ? "bg-primary/10 text-primary font-semibold" 
                                                : "text-foreground/70 hover:text-foreground hover:bg-muted/30"
                                        )}
                                    >
                                        <span>{link.label}</span>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" />}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* 2. ส่วนสตูดิโอนักเขียนและข้อมูลบุคคล */}
                        {session && (
                            <div className="space-y-3">
                                <p className="text-[9px] font-bold tracking-[0.15em] text-primary/70 uppercase px-1">
                                    ☀︎ สำหรับผู้ใช้
                                </p>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                        { href: "/novel/create", label: "สร้างนิยาย", icon: SquarePen },
                                        { href: "/history", label: "ประวัติการอ่าน", icon: LibraryBig },
                                        { href: "/my-novels", label: "นิยายของฉัน", icon: NotebookPen },
                                        { href: "/novel/liked", label: "รายการโปรด", icon: Heart },
                                    ].map((item) => (
                                        <Link 
                                            key={item.href}
                                            href={item.href} 
                                            onClick={() => setIsMobileMenuOpen(false)} 
                                            className="flex items-center gap-2.5 p-3 rounded-xl border border-border/40 bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all group min-w-0"
                                        >
                                            <div className="p-1.5 rounded-lg bg-muted/40 group-hover:bg-primary/10 transition-colors shrink-0">
                                                <item.icon className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                            <span className="text-[11px] font-bold text-foreground/80 group-hover:text-primary font-sans transition-colors tracking-wide truncate">
                                                {item.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. ปุ่มออกจากระบบ (สำหรับ Mobile Drawer ด้านล่างสุด) */}
                        {session && (
                            <div className="pt-2 border-t border-border/20">
                                <button 
                                    onClick={async () => {
                                        setIsMobileMenuOpen(false);
                                        await signOut({
                                            fetchOptions: {
                                                onSuccess: () => {
                                                    window.location.href = "/" 
                                                },
                                            },
                                        })
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl text-xs font-medium font-sans transition-all active:scale-[0.98]"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>ออกจากระบบบัญชี</span>
                                </button>
                            </div>
                        )}
                        
                    </div>
                </div>
            )}
        </header>
    )
}