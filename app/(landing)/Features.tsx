"use client"

import Link from "next/link" // 🟢 [เพิ่ม]: อิมพอร์ต Link เข้ามาใช้งาน
import { Siren, Leaf, Fan, Heart, Flame, Drama, Kayak } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

const features = [
    {
        icon: Heart,
        catId: "romance", // 🟢 [เพิ่ม]: ไอดีพิมพ์เล็กตรงตาม DB
        title: "ความรัก | Romance",
        description: "สัมผัสเรื่องราวความรักหลากหลายรูปแบบ ตั้งแต่ความโรแมนติกที่แสนหวาน ไปจนถึงความสัมพันธ์ที่ลึกซึ้งตรึงใจตราบนานเท่านาน",
    },
    {
        icon: Fan,
        catId: "fantasy", // 🟢 [เพิ่ม]: ไอดีพิมพ์เล็กตรงตาม DB
        title: "แนวแฟนตาซี | Fantasy",
        description: "ก้าวข้ามขีดจำกัดของความเป็นจริง สู่โลกแห่งจินตนาการอันไร้สิ้นสุด เวทมนตร์ ตำนาน และการผจญภัยที่คุณไม่เคยพบพาน",
    },
    {
        icon: Kayak,
        catId: "Adventure", // 🟢 [เพิ่ม]: ระวังตัว A ใหญ่ ให้ตรงกับหน้าคลังหนังสือมึง
        title: "ผจญภัย | Adventure",
        description: "เส้นทางสู่ความเป็นเซียนที่เต็มไปด้วยการทดสอบ ทะยานสู่ฟ้าดินด้วยวิถีแห่งยุทธ์ และการต่อสู้เพื่อเกียรติยศอันสูงสุด",
    },
    {
        icon: Drama,
        catId: "Drama", // 🟢 [เพิ่ม]: ระวังตัว D ใหญ่ ให้ตรงกับหน้าคลังหนังสือมึง
        title: "ดราม่า | Drama",
        description: "ไขปริศนาที่ซ่อนอยู่ภายใต้ความเงียบสงบ ลุ้นระทึกไปกับการชิงไหวชิงพริบ และปมเงื่อนงำที่คาดเดาไม่ได้จนวินาทีสุดท้าย",
    },
]

export default function Features() {
    const { data: session } = authClient.useSession()

    return (
        <section id="features" className="border-y bg-muted/20 py-24 transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-16 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 self-center lg:self-start rounded-full border border-primary/20 bg-primary/5 px-4 py-1 backdrop-blur-sm">
                        <Flame className="h-5 w-5 text-primary" />
                        <span className="text-[26px] font-sans font-bold tracking-wide uppercase text-primary/80">
                            แนวนิยายยอดนิยมในปี 2026
                        </span>
                    </div>
                    <p className="mx-auto max-w-1xl text-muted-foreground font-novel text-lg">
                        เลือกแนวนิยายที่คุณรักเพื่อสร้างสรรค์โลกแห่งจินตนาการที่สมบูรณ์แบบ
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        /* 🟢 [แก้ไข]: ครอบด้วย Link และย้ายคีย์ `group` ขึ้นมาไว้ที่นี่ เพื่อให้เวลาเมาส์ชี้ตรงไหนในกล่อง เอฟเฟกต์ Hover จะได้ทำงานพร้อมกันแบบเนียนๆ */
                        <Link 
                            href={session ? `/novel?category=${feature.catId}` : "/auth/signin"} // 🟢 [เพิ่ม]: ลิงก์ไปหน้าคลังหนังสือตามหมวดหมู่ หรือไปหน้าเข้าสู่ระบบถ้ายังไม่ล็อกอิน
                            key={feature.title}
                            className="block group"
                        >
                            <Card 
                                className={cn(
                                    "relative overflow-hidden border-border/50 bg-card/50 transition-all duration-500",
                                    "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]",
                                    "hover:border-accent/40 hover:-translate-y-1 rounded-2xl cursor-pointer"
                                )}
                            >
                                <CardHeader>
                                    <div className={cn(
                                        "mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-500",
                                        "bg-background border border-border group-hover:bg-primary group-hover:text-primary-foreground shadow-sm"
                                    )}>
                                        <feature.icon className="h-7 w-7" />
                                    </div>
                                    <CardTitle className="font-novel text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-sans">
                                        {feature.description}
                                    </p>
                                </CardContent>
                                
                                {/* Decorative line on hover */}
                                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 group-hover:w-full" />
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}