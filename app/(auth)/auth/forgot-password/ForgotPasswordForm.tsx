"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, Mail, Star, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // จำลองการเชื่อมต่อ API (อนาคตเชื่อมกับ Better Auth)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsSubmitted(true)
        setIsLoading(false)
    }

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-background">
            
            {/* ฝั่งซ้าย: Visual Story (แสดงคงที่เพื่อให้ Layout นิ่ง) */}
            <div className="relative hidden w-1/2 lg:flex overflow-hidden border-r border-border/50">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
                <img 
                    src="https://images.unsplash.com/photo-1587930734782-4fe289d9ea8f?q=80&w=2069&auto=format&fit=crop" 
                    alt="Luxury" 
                    className="h-full w-full object-cover scale-105" 
                />
                <div className="absolute bottom-20 left-16 right-16 z-20 space-y-4">
                    <div className="flex gap-1 text-primary">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                    <h2 className="text-5xl font-novel font-bold text-foreground leading-tight">We help you.</h2>
                    <p className="text-xl font-novel text-muted-foreground max-w-md italic font-light">
                        "ไม่ต้องกังวล แค่ป้อนอีเมล์ของคุณมา เราจะส่งลิงก์กู้คืนให้ทันที!"
                    </p>
                </div>
            </div>

            {/* ฝั่งขวา: Content area */}
            <div className="relative flex w-full flex-col items-center justify-center px-8 lg:w-1/2">
                <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* ส่วนหัว: เปลี่ยนตามสถานะ isSubmitted */}
                    <div className="flex flex-col items-center lg:items-start space-y-4">
                        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                            <span className="text-2xl font-novel font-bold uppercase tracking-tighter text-foreground">YANIYAA</span>
                        </Link>

                        {!isSubmitted ? (
                            <div className="space-y-2 text-center lg:text-left animate-in fade-in duration-500">
                                <h1 className="text-4xl font-novel font-semibold text-foreground">ลืมรหัสผ่าน?</h1>
                                <p className="text-muted-foreground text-sm font-sans tracking-wide">ระบุอีเมลของคุณเพื่อรับลิงก์กู้คืนระดับพรีเมียม</p>
                            </div>
                        ) : (
                            <div className="space-y-2 text-center lg:text-left animate-in zoom-in-95 duration-500">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4 mx-auto lg:mx-0 border border-primary/20">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                                <h1 className="text-3xl font-novel font-semibold text-foreground">ส่งเรียบร้อยแล้ว</h1>
                                <p className="text-muted-foreground text-sm font-sans tracking-wide">
                                    โปรดตรวจสอบกล่องข้อความที่ <span className="text-primary font-bold">{email}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ส่วนฟอร์มและการกระทำ */}
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Account Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        placeholder="yourname@luxury.com" 
                                        className="h-12 pl-11 bg-muted/20 border-border/40 rounded-2xl focus:shadow-[0_0_8px_rgba(var(--primary-rgb),0.15)] focus:border-primary/50 transition-all" 
                                    />
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full h-12 rounded-full bg-primary text-primary-foreground font-novel text-sm tracking-wide uppercase shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ส่งลิงก์กู้คืน ➢"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-1000">
                            <p className="text-xs text-center lg:text-left text-muted-foreground font-sans leading-relaxed">
                                หากไม่พบอีเมลในกล่องจดหมายหลัก กรุณาตรวจสอบในโฟลเดอร์จดหมายขยะ (Spam)
                            </p>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsSubmitted(false)} 
                                className="w-full h-12 rounded-full font-novel uppercase tracking-widest border-border/40 hover:bg-muted/30 transition-colors cursor-pointer"
                            >
                                ลองใช้อีเมลอื่น
                            </Button>
                        </div>
                    )}

                    {/* กลับสู่หน้า Login */}
                    <div className="flex flex-col items-center pt-2">
                        <Link href="/auth/signin" className="text-sm font-novel text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                            <span className="border-b border-transparent group-hover:border-primary transition-all">กลับไปหน้าเข้าสู่ระบบ</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}