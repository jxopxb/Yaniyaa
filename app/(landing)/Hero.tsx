"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    ArrowRight,
    BookOpen,
    Crown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

export default function Hero() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [featuredNovels, setFeaturedNovels] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { data: session } = authClient.useSession()

    // Fetch featured novels จาก DB
    useEffect(() => {
        async function fetchFeatured() {
            try {
                const res = await fetch("/api/featured")
                if (!res.ok) {
                    throw new Error("Failed to fetch featured novels")
                }
                const data = await res.json()
                setFeaturedNovels(data)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchFeatured()
    }, [])

    // ระบบ Slide อัตโนมัติ
    useEffect(() => {
        if (featuredNovels.length === 0) return
        const interval = setInterval(() => {
            setActiveIndex((prev) =>
                (prev + 1) % featuredNovels.length
            )
        }, 4000)
        return () => clearInterval(interval)
    }, [featuredNovels])

    return (
        <section
            id="home"
            className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-28 overflow-hidden transition-colors duration-500"
        >
            {/* Ambient Background Layer */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute left-1/4 top-0 h-[400px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
            </div>

            <div className="mx-auto max-w-[1300px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left Content */}
                <div className="flex flex-col space-y-10 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 self-center lg:self-start rounded-full border border-primary/20 bg-primary/5 px-4 py-1 backdrop-blur-sm">
                        <Crown className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-sans font-bold tracking-[0.25em] uppercase text-primary/80">
                            Yaniyaa • The Art of Narrative
                        </span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-5xl xl:text-5xl font-novel font-bold leading-[1.1] tracking-tighter text-foreground">
                            อ่านนิยายออนไลน์กับเรา <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent/80 to-primary/60">
                                YANIYAA
                            </span>
                        </h1>

                        <p className="max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-muted-foreground font-novel leading-relaxed tracking-wide opacity-70">
                            สัมผัสสุนทรียภาพแห่งการอ่านที่หลอมรวมพลังของเทคโนโลยี
                            <br className="hidden md:block" />
                            และศิลปะการเล่าเรื่องชั้นสูง เพื่อสร้างโลกที่คุณ "รู้สึก" ได้จริง
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
                        {/* 🟢 [แก้ไข]: ปรับหน้าดีดกลับหน้าล็อกอินให้พุ่งไปที่ /login มินิมอลคลีนๆ */}
                        <Link href={session ? "/novel" : "/auth/signin"}>
                            <Button className="cursor-pointer group h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-novel text-sm tracking-widest uppercase shadow-xl shadow-primary/20 transition-all duration-300 hover:-translate-y-1 active:scale-95">
                                สัมผัสคลังนิยาย
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                        </Link>

                        <Link href="/#popular">
                            <Button
                                variant="outline"
                                className="cursor-pointer h-14 px-8 rounded-xl border-border/40 bg-background/20 backdrop-blur-md font-novel text-sm tracking-widest uppercase transition-all duration-300 hover:bg-muted/50 hover:border-primary/30 hover:-translate-y-1"
                            >
                                นิยายยอดนิยม ✫
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-10 pt-12 border-t border-border/40 max-w-sm mx-auto lg:mx-0">
                        <div>
                            <p className="text-xl font-bold text-foreground">5.8K</p>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">Readers</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-foreground">300+</p>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">Books</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-foreground">Premium</p>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">Experience</p>
                        </div>
                    </div>
                </div>

                {/* Right Showcase */}
                <div
                    className="relative flex justify-center lg:justify-end animate-in fade-in zoom-in duration-1000"
                    style={{ perspective: "2000px" }}
                >
                    <div
                        className="relative w-full max-w-[499px] aspect-[4/5] rounded-4xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group border border-white/10 transition-transform duration-700 ease-out"
                        style={{ transform: "rotateY(-12deg) rotateX(4deg) rotateZ(1deg)" }}
                    >
                        {isLoading ? (
                            <div className="absolute inset-0 bg-card animate-pulse" />
                        ) : (
                            featuredNovels.map((novel, index) => {
                                // 🎯 [ลอจิกแกะชื่อผู้เขียนไดนามิก]: ดึงจากออบเจกต์สัมพันธ์ .author.name ที่อินคลูดพ่วงมาจาดีบีตัวจริง
                                const authorName = novel.author?.name || (typeof novel.author === "string" ? novel.author : null) || "นักเขียนยานิย่า";

                                return (
                                    <div
                                        key={novel.id}
                                        className={cn(
                                            "absolute inset-0 transition-all duration-[1500ms] ease-in-out",
                                            activeIndex === index
                                                ? "opacity-100 scale-100"
                                                : "opacity-0 scale-110"
                                        )}
                                    >
                                        {/* 🟢 [แก้ไข]: เปลี่ยนจาก novel.image เป็น novel.coverImage ให้ตรงตาม Prisma Schema หน้าปกโชว์สวยๆ เลยมึง */}
                                        <img
                                            src={novel.coverImage || novel.image}
                                            alt={novel.title}
                                            className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent opacity-90" />

                                        <Link href={session ? `/novel/${novel.id}` : "/auth/signin"} className="absolute inset-x-6 bottom-6 p-6 rounded-2xl bg-background/20 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all duration-500 group-hover:bg-background/40 group-hover:-translate-y-2 cursor-pointer block">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-2 text-left">
                                                    <div className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-bold rounded uppercase tracking-tighter">
                                                        Featured Masterpiece
                                                    </div>

                                                    <h3 className="text-2xl font-novel font-bold text-white tracking-tight leading-none group-hover:text-primary transition-colors">
                                                        {novel.title}
                                                    </h3>

                                                    <p className="text-white/50 text-xs font-sans italic">
                                                        {/* 🟢 [แก้ไข]: เปลี่ยนมาพ่นตัวแปรชื่อผู้เขียนบัญชีจริงที่ผ่านการแกะมาแล้ว */}
                                                        By {authorName}
                                                    </p>
                                                </div>

                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                )
                            })
                        )}

                        {/* Indicators */}
                        <div className="absolute top-8 left-8 flex gap-2 z-30">
                            {featuredNovels.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-500",
                                        i === activeIndex
                                            ? "w-8 bg-primary"
                                            : "w-2 bg-white/20"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Decorative Blur */}
                    <div className="absolute -top-10 -right-10 h-64 w-64 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
                    <div className="absolute -bottom-10 -left-20 h-64 w-64 bg-accent/10 rounded-full blur-[100px] -z-10" />
                </div>
            </div>
        </section>
    )
}