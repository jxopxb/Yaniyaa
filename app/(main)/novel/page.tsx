import { Metadata } from "next"
import { prisma } from "@/lib/prisma" 
import LibraryPage from "./home_library"
import Navbar from "@/app/(landing)/Navbar"

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "คลังนิยาย — YANIYAA",
    description: "คลัง YANIYAA — เว็ปอ่านนิยายออนไลน์ฟรี",
    keywords: ["คลังนิยาย", "novel", "YANIYAA", "หานิยายดีดี"],
}

export default async function NovelPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  
  // แกะค่า sort ออกมา
  const { sort } = await searchParams;

  // 🐛 ใส่ Log เช็คหลังบ้าน
  console.log("👉 ค่า sort ที่ได้รับจาก URL คือ:", sort);

  let orderByCondition: any = { id: "desc" }; 

  if (sort === "popular") {
    console.log("🔥 เข้าเงื่อนไข! กำลังดึงนิยายยอดคนอ่านสูงสุด!");
    orderByCondition = {
      readingHistories: {
        _count: "desc", 
      },
    };
  } else {
    console.log("✨ ไม่ได้ส่ง sort มา ดึงนิยายล่าสุดปกติ");
  }

  const allNovels = await prisma.novel.findMany({
    where: {
        status: "approved",
    },
    include: {
      author: true, 
      _count: {
        select: {
          readingHistories: true, 
          likes: true,            
        }
      }
    },
    orderBy: orderByCondition,
  });

  return (
    <>
      <Navbar />
      {/* 🚨 จุดไม้ตาย: ใส่ initialSort={sort} ส่งไปให้ฝั่งหน้าบ้านด้วย! */}
      <LibraryPage 
        key={sort || "default"} 
        initialNovels={allNovels} 
        initialSort={sort} 
      />
    </>
  );
}