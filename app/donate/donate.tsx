"use client"

import Image from "next/image"
import myqr from "./qrcode.png"
import { QrCode, Heart, Sparkles, Coffee } from "lucide-react"

export default function DonateSection() {
    // 1. Data Logic: เก็บข้อมูลไว้ใน Array ให้อ่านง่าย แก้ไขจุดเดียวจบ
    const perks = [
        { icon: <Sparkles className="w-4 h-4" />, text: "ช่วยค่าappดูหนังของผม" },
        { icon: <Coffee className="w-4 h-4" />, text: "ช่วยค่าเติมเกมส์ของผม" },
        { icon: <Heart className="w-4 h-4" />, text: "สนับสนุนความเรื้อนกันต่อไป" }
    ]

    return (
        // 2. Section: ใส่ pt-28 เพื่อเว้นระยะจาก Navbar และ scroll-mt เพื่อให้เลื่อนมาแล้วไม่โดนบัง
        <section id="donate" className="pt-28 pb-20 bg-background scroll-mt-20">
            <div className="container mx-auto px-6">
                
                {/* Header: เน้น Font Novel ให้ดูหรูหรา */}
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                        Support Yaniyaa
                    </div>
                    <h2 className="text-4xl md:text-5xl font-novel font-bold text-foreground">
                        ร่วมสนับสนุน <span className="text-primary">วันรุ่นไม่นอน</span>
                    </h2>
                    <p className="max-w-md text-muted-foreground font-sans text-sm">
                        ทุกยอดการสนับสนุนช่วยให้เรายิ้มแป้นeiei ขอให้สนุกกับการอ่านและการเปย์!
                    </p>
                </div>

                {/* Main Card: ออกแบบให้ดูแพงและคลีน */}
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-secondary/5 border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    
                    {/* Background Glow: เพิ่มมิติให้การเปย์ */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />

                    {/* Left: QR Code Display */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative group">
                            {/* กรอบเรืองแสงรอบ QR */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            
                            <div className="relative bg-[#0a0a0a] p-4 rounded-2xl border border-white/10 shadow-inner">
                                <div className="w-48 h-48 md:w-56 md:h-56 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                                    {/* ใส่รูป QR Code ของคุณที่นี่ */}
                                    <Image 
                                        src={myqr} 
                                        alt="PromptPay" 
                                        width={224} 
                                        height={224}
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold font-sans tracking-widest text-primary uppercase">Scan to Donate</p>
                            <p className="text-[10px] text-muted-foreground mt-1">PromptPay / All Thai Banks</p>
                        </div>
                    </div>

                    {/* Right: Benefits Content */}
                    <div className="flex flex-col space-y-8">
                        <h3 className="text-xl font-novel font-bold text-white border-l-2 border-primary pl-4">
                            ขอบคุณสำหรับการเปย์นะอิอิ!
                        </h3>
                        
                        <div className="space-y-6">
                            {perks.map((item, index) => (
                                <div key={index} className="flex items-start gap-4 group">
                                    <div className="mt-0 p-2 rounded-xl bg-white/5 border border-white/10 text-primary transition-colors group-hover:bg-primary group-hover:text-black">
                                        {item.icon}
                                    </div>
                                    <p className="text-sm font-sans text-gray-400 group-hover:text-white transition-colors">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <p className="text-[11px] font-sans italic text-muted-foreground leading-relaxed">
                                *การสนับสนุนนี้เป็นไปตามความสมัครใจ เพื่อรักษาสังคมการอ่านที่ดีร่วมกัน
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}