import Link from "next/link"
import { Sparkles, Globe, MessageCircle, Share2 } from "lucide-react"

export default function Footer() {
    return (
        <footer id="footer_" className="border-t border-border/40 bg-muted/20 py-16 transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-12 md:grid-cols-4">
                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <div className="mb-4 flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <span className="text-xl font-novel font-bold tracking-tight">Yaniyaa Library</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-novel">
                            สัมผัสประสบการณ์การอ่านนิยายที่เหนือระดับ 
                            ผสานศิลปะการเล่าเรื่องเข้ากับเทคโนโลยีแห่งอนาคต 
                            เพื่อสุนทรียภาพที่สมบูรณ์แบบของนักอ่าน
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 font-novel font-semibold text-foreground">สำรวจหน้าเว็บ</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground font-sans">
                            <li>
                                <Link href="/#features" className="hover:text-primary transition-colors">
                                    ฟีเจอร์พรีเมียม
                                </Link>
                            </li>
                            <li>
                                <Link href="/#about" className="hover:text-primary transition-colors">
                                    เรื่องราวของเรา
                                </Link>
                            </li>
                            <li>
                                <Link href="/novels" className="hover:text-primary transition-colors">
                                    หอสมุดนิยาย
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/signin" className="hover:text-primary transition-colors">
                                    สมาชิกระดับเอ็กซ์คลูซีฟ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community/Support */}
                    <div>
                        <h3 className="mb-4 font-novel font-semibold text-foreground">การสนับสนุน</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground font-sans">
                            <li>
                                <Link href="/terms" className="hover:text-primary transition-colors">
                                    ข้อกำหนดการใช้งาน
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-primary transition-colors">
                                    นโยบายความเป็นส่วนตัว
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-primary transition-colors">
                                    ติดต่อทีมงาน
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Social - แก้ไขส่วนนี้ */}
                    <div>
                        <h3 className="mb-4 font-novel font-semibold text-foreground">ติดตามเรา</h3>
                        <div className="flex gap-4 mb-6">
                            {/* ใช้ Globe แทน Website/Social อื่นๆ */}
                            <Globe className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                            {/* ใช้ MessageCircle แทน Facebook Messenger/Line */}
                            <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                            {/* ใช้ Share2 แทนการแชร์ไปยังแพลตฟอร์มต่างๆ */}
                            <Share2 className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                        </div>
                        <p className="text-sm text-muted-foreground font-novel">
                            สร้างสรรค์เพื่อจินตนาการไร้ขีดจำกัด<br />
                            <span className="text-primary/80 italic">Welcome to the future of reading.</span>
                        </p>
                    </div>
                </div>

                <div className="mt-16 border-t border-border/40 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-[10px] text-muted-foreground/60 font-sans tracking-[0.2em] uppercase">
                        <p>© 2026 LUXURY YANIYAA PLATFORM. ALL RIGHTS RESERVED.</p>
                        <p>DESIGNED FOR THE NEXT GENERATION OF READERS</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}