"use client";

import Link from "next/link";
import { Sparkles, Mail, Lock, User, Loader2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/auth-client"

const slides = [
    {
        image: "https://images.unsplash.com/photo-1736912950199-4eeb7052ba59?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "สมัครสมาชิกเพื่อเข้าสู่โลกแห่งจินตนาการ",
        description: "คัดสรรนิยายระดับมาสเตอร์พีซ เพื่อมอบประสบการณ์ที่เหนือระดับสำหรับคุณโดยเฉพาะ"
    },
]

export default function SignUpPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

        if (password.length < 8) {
            setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
            setIsLoading(false)
            return
        } else if (!pattern.test(password)) {
            setError("รหัสผ่านต้องประกอบด้วยตัวอักษรพิมพ์เล็ก | พิมพ์ใหญ่ และ ตัวเลข")
            setIsLoading(false)
            return
        }

        if (confirmPassword !== password) {
            setError("รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง")
            setIsLoading(false)
            return
        }

        try {
            const result = await signUp.email({
                name,
                email,
                password,
            })
        
            if(result.error?.code === 'USER_ALREADY_EXISTS' || result.error?.message?.includes('already exists')) {
                setError("อีเมลนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่าน หรือใช้ Google Login แทน")
            } 
            else {
                router.push("/novel")
            }
        } catch {
            setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-background"> {/* 🛠️ เพิ่ม w-full คุมฐานรากหน้าจอ */}
            {/* Left Column (Image) */}
            <div className="relative hidden w-1/2 lg:flex overflow-hidden bg-primary/10">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                <img
                    src={slides[0].image}
                    alt="Luxury Membership"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-20 space-y-7 overflow-hidden">
                    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-amber-200 to-transparent animate-shimmer" />
                    <h2 className="text-6xl md:text-7xl font-novel font-extrabold leading-tight tracking-tighter text-white [text-shadow:0_0_15px_rgba(255,255,255,0.7),0_0_30px_rgba(255,255,255,0.4)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] uppercase">
                        REGISTER FOR<br />
                        <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-100 animate-shimmer-fast [text-shadow:0_0_20px_rgba(255,191,0,0.6),0_0_40px_rgba(255,191,0,0.4)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                            IMAGINATION
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60 rounded-full animate-width-reverse shimmer-delayed" />
                        </span>
                    </h2>
                </div>
            </div>

            {/* Right Column: Sign Up Form */}
            {/* 🛠️ ปรับแก้ px-6 สำหรับจอเล็ก เพื่อไม่ให้ขอบบีบตัวฟอร์มจนเบี้ยว */}
            <div className="flex w-full flex-col items-center justify-center px-6 md:px-12 lg:w-1/2">
                
                <form onSubmit={handleSubmit} className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* 🛠️ [จุดสำคัญ]: สั่งยึดแนวแกนกลางด้วย flex-col items-center ตอนจอเล็ก และปรับกลับเป็น items-start ตอนจอใหญ่ */}
                    <div className="space-y-3 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                            <span className="text-2xl font-novel font-bold tracking-tighter uppercase text-foreground">YANIYAA REGISTER</span>
                        </div>
                        <h1 className="text-3xl font-novel font-bold text-foreground tracking-tight">สมัครสมาชิก</h1>
                        <p className="text-muted-foreground font-sans tracking-wide text-xs md:text-sm max-w-[300px] lg:max-w-none">
                            สร้างบัญชีเพื่อเข้าสู่โลกแห่งนิยายออนไลน์
                        </p>
                    </div>

                    {/* ส่วนแสดง Error */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl text-center w-full">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4 font-sans">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Yaniyaa"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="h-12 pl-11 bg-muted/10 border-border/40 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Email address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="Yaniyaa@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 pl-11 bg-muted/10 border-border/40 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="Create Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 pl-11 bg-muted/10 border-border/40 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-12 pl-11 bg-muted/10 border-border/40 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-novel text-sm tracking-wide uppercase shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังสร้างบัญชี...</>
                                ) : (
                                    "เริ่มต้นสมาชิก ☛"
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center pt-1">
                        <p className="text-center text-xs md:text-sm text-muted-foreground font-sans">
                            มีบัญชีสมาชิกอยู่แล้ว?{" "}
                            <Link href="/auth/signin" className="text-foreground font-bold hover:text-primary transition-colors border-b border-primary/30 pb-0.5 ml-1">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}