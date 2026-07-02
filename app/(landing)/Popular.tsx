"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import NovelCard from "@/components/ui/NovelCard"

interface PopularProps {
    popularNovels: any[]
}

export default function Popular({ popularNovels }: PopularProps) {
    const { data: session } = authClient.useSession()

    return (
        <section
            id="popular"
            className="bg-background py-24 px-6 font-novel transition-colors duration-500"
        >
            <div className="mx-auto max-w-[1536px]">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary/80">
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase">
                                // TRENDING • 2026
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold text-foreground tracking-tighter">
                            นิยายยอดช่วงนี้
                        </h2>
                    </div>

                    <Link href={"/novel?sort=popular"}>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all cursor-pointer">
                            ดูทั้งหมด
                            <ArrowRight className="h-3 w-3" />
                        </button>
                    </Link>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {popularNovels && popularNovels.length > 0 ? (
                        popularNovels.map((novel: any) => (
                            <Link 
                                key={novel.id} 
                                href={session ? `/novel/${novel.id}` : "/auth/signin"} 
                                className="block group"
                            >
                                {/* 🎯 [ปรับปรุง]: ยิงก้อน novel ตรงๆ เข้าไปได้เลยมึง การ์ดเวอร์ชันใหม่จัดการแกะชื่อและยอดสถิติจริงให้เองครบหมด */}
                                <NovelCard novel={novel} />
                            </Link>
                        ))
                    ) : (
                        /* Empty State ประยุกต์เป็น Skeleton จางๆ สไตล์ลักชูมินิมอล */
                        Array(5)
                            .fill(0)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-[3/4] rounded-2xl bg-card/20 border border-border/10 flex items-center justify-center text-[10px] text-muted-foreground/30 font-sans tracking-widest uppercase animate-pulse"
                                >
                                    Loading
                                </div>
                            ))
                    )}
                </div>
            </div>
        </section>
    )
}