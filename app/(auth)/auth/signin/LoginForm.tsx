"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, Mail, Lock, Star, Loader2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// เชื่อม better-auth client เพื่อใช้ฟังก์ชันการเข้าสู่ระบบ
import { signIn } from "@/lib/auth-client"
import { authClient } from "@/lib/auth-client"

const slides = [
    {
        image: "https://images.unsplash.com/photo-1763732397864-5b860bb298b0?q=80&w=2070&auto=format&fit=crop",
        title: "สัมผัสสุนทรียศาสตร์แห่งการอ่าน",
        description: "คัดสรรนิยายระดับมาสเตอร์พีซ เพื่อมอบประสบการณ์ที่เหนือระดับสำหรับคุณโดยเฉพาะ"
    },
    {
        image: "https://images.unsplash.com/photo-1768142206940-dd29908ec630?q=80&w=987&auto=format&fit=crop",
        title: "คฤหาสน์แห่งจินตนาการ",
        description: "ที่ซึ่งทุกตัวอักษรได้รับการดูแลอย่างพิถีพิถัน เพื่อสร้างโลกที่คุณไม่อยากจากไป"
    },
    {
        image: "https://images.unsplash.com/photo-1768142206870-9a7fedcf646c?q=80&w=987&auto=format&fit=crop",
        title: "เอกสิทธิ์เฉพาะสมาชิกพรีเมียม",
        description: "เข้าถึงเนื้อหาพิเศษก่อนใคร พร้อมระบบปรับแต่งการอ่านที่สมบูรณ์แบบที่สุด"
    }
]

export default function SignInPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % slides.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        try {
            const result = await signIn.email({ email, password });
            if (result?.error) {
                setError(result.error.message === "Invalid email or password" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : result.error.message || "เข้าสู่ระบบไม่สำเร็จ")
            } else {
                router.push("/novel");
                router.refresh();
            }
        } catch {
            setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
        } finally {
            setIsLoading(false)
        }
    }

    // Sign in with Social Providers
    const loginWithSocial = async (provider: "google" | "github" | "line" | "facebook") => {
        setIsLoading(true)
        setError("")
        try {
            // เปลี่ยนจาก signIn.social เป็น authClient.signIn.social
            const result = await authClient.signIn.social({
                provider,
                callbackURL: "/novel", // ล็อกอินเสร็จให้เด้งไปหน้านี้
            })
            
        } catch {
            setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        // ใช้ bg-background เพื่อให้เปลี่ยนตาม Theme อัตโนมัติ
        <div className="flex min-h-screen w-full overflow-hidden bg-background"> 
            
            {/* ฝั่งซ้าย: Visual (ซ่อนบนมือถือ) */}
            <div className="relative hidden w-1/2 lg:flex overflow-hidden border-r border-border/50">
                {slides.map((slide, index) => (
                    <div key={index} className={cn("absolute inset-0 transition-opacity duration-1000", activeIndex === index ? "opacity-100" : "opacity-0")}>
                        {/* Overlay ปรับตามโหมด: โหมดมืดจะเข้มกว่าเล็กน้อย */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
                        <img src={slide.image} alt="Visual" className="h-full w-full object-cover scale-105" />
                        
                        <div className="absolute bottom-20 left-16 right-16 z-20 space-y-4">
                            <div className="flex gap-1 text-primary">
                                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                            </div>
                            <h2 className="text-5xl font-novel font-bold text-foreground leading-tight">{slide.title}</h2>
                            <p className="text-xl font-novel text-muted-foreground max-w-md">{slide.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ฝั่งขวา: Sign In Form */}
            <div className="relative flex w-full flex-col items-center justify-center px-8 lg:w-1/2">

                <form onSubmit={handleSubmit} className="w-full max-w-[400px] space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                            <span className="text-2xl font-novel font-bold tracking-tighter uppercase text-foreground">YANIYAA</span>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-novel font-semibold text-foreground">เข้าสู่คลังนิยายออนไลน์</h1>
                            <p className="text-sm text-muted-foreground font-sans">กรุณากรอกข้อมูลส่วนตัวเพื่อเข้าสู่ระบบสมาชิก</p>
                        </div>
                    </div>

                    {/* Error Message แบบรองรับทั้ง 2 โหมด */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl text-center animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">E-Mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="h-12 pl-11 bg-muted/30 border-border focus:shadow-[0_0_8px_rgba(var(--primary-rgb),0.15)] rounded-2xl" 
                                    placeholder="Yaniyaa@gmail.com" 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="h-12 pl-11 bg-muted/30 border-border focus:shadow-[0_0_8px_rgba(var(--primary-rgb),0.15)] rounded-2xl" 
                                    placeholder="••••••••" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                        <div className="flex justify-between items-end ml-1">
                            <Link 
                                href="/auth/forgot-password" 
                                className="text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors"
                            >
                                ลืมรหัสผ่าน?
                            </Link>
                        </div>
                        </div>
                        
                        <Button 
                            type="submit" 
                            disabled={isLoading} 
                            className="cursor-pointer w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "เข้าสู่ระบบ ➢"}
                        </Button>
                    </div>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                            <span className="bg-background px-4">Or Continue With</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-center gap-3 py-5 cursor-pointer"
                        onClick={() => loginWithSocial("google")}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground font-novel">
                        ยังไม่ได้เป็นสมาชิกใช่หรือไม่?{" "}
                        <Link href="/auth/signup" className="text-foreground font-bold hover:text-primary transition-colors border-b border-primary/40">สมัครสมาชิกตอนนี้</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}