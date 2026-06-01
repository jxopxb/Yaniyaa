import { BookOpen, Star, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function About() {
    const highlights = [
        {
            icon: Sparkles,
            title: "Exclusive Content",
            description: "คัดสรรนิยายคุณภาพระดับพรีเมียม ครอบคลุมทุกอรรถรสเพื่อผู้อ่านที่มองหาความเหนือระดับ",
        },
        {
            icon: BookOpen,
            title: "Immersive Reading",
            description: "ระบบการอ่านที่ออกแบบมาเพื่อความสบายตา ปรับแต่งได้ตามใจ พร้อมเทคโนโลยีจัดตัวอักษรที่สมบูรณ์แบบ",
        },
        {
            icon: Star,
            title: "Premium Community",
            description: "ร่วมเป็นส่วนหนึ่งของสังคมนักอ่านและนักเขียนคุณภาพ พร้อมระบบสนับสนุนที่เหนือกว่าใคร",
        },
    ]

    return (
        <section id="about" className="py-24 bg-background transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                    {/* Left - Text Content */}
                    <div className="space-y-6">
                        <h2 className="text-4xl font-novel font-bold tracking-tight">
                            ดื่มด่ำไปกับ{" "}
                            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                ประสบการณ์ใหม่
                            </span>
                            <br />
                            แห่งโลกนิยาย
                        </h2>
                        
                        <div className="space-y-4 text-muted-foreground font-novel text-lg leading-relaxed">
                            <p>
                                เราคือแพลตฟอร์มนิยายยุคใหม่ที่รวมเอาศิลปะการเล่าเรื่องมาบรรจบกับเทคโนโลยีอันล้ำสมัย 
                                เพื่อสร้างสุนทรียภาพในการอ่านที่หรูหราและเข้าถึงง่ายสำหรับทุกคน
                            </p>
                            <p>
                                จากต้นแบบระบบอัจฉริยะ เราพัฒนาต่อยอดจนกลายเป็นพื้นที่สร้างสรรค์
                                ที่ให้ความสำคัญกับ **UX/UI ระดับพรีเมียม** เพื่อให้นักอ่านได้จดจ่อกับเนื้อหา
                                ในบรรยากาศที่ผ่อนคลายที่สุด
                            </p>
                        </div>
                    </div>

                    {/* Right - Luxury Highlights */}
                    <div className="grid gap-8">
                        {highlights.map((item) => (
                            <div 
                                key={item.title} 
                                className="group flex gap-5 p-6 rounded-2xl border border-transparent hover:border-border hover:bg-card/50 transition-all duration-300"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-primary group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="mb-2 font-novel font-semibold text-xl text-foreground">
                                        {item.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed font-sans text-sm md:text-base">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}