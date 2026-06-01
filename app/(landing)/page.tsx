
import { prisma } from "@/lib/prisma" // [เพิ่ม] นำเข้า prisma เพื่อเชื่อมโยงฐานข้อมูลหลังบ้าน
import Footer from "./Footer"
import Navbar from "./Navbar"
import Hero from "./Hero"
import About from "./About"
import Features from "./Features"
import Popular from "./Popular"
import Latest from "./Latest"

// [ปรับปรุง] เพิ่มคำสั่ง async เพื่อเปลี่ยนหน้าแรกให้เป็น Server Component เต็มตัว
export default async function HomePage() {
  
  // 🟢 แก้ไขจุดนี้: ใส่ include ให้ดึงตาราง author มาด้วยมึง!
  const popularNovels = await prisma.novel.findMany({
    where: {
      NOT: {
        status: "pending", // 👈 นิยายเรื่องไหนที่เป็น pending จะโดนซ่อนทันทีโว้ยมึง!
      },
      // 💡 หรือถ้ามึงมีระบบสถานะที่อนุมัติแล้วชัวร์ๆ (เช่น APPROVED หรือ PUBLISHED) 
      // มึงสามารถเปิดใช้บรรทัดข้างล่างนี้แทนได้นะเก๋ๆ:
      // status: "APPROVED"
    },
    
    include: {
      author: true, // ✨ บรรทัดนี้แหละมึง! ตัวชี้ชะตา ไม่งั้นหน้าบ้านแกะชื่อไม่เจอ
      _count: {
        select: {
          readingHistories: true, // 👁️ นับจำนวนคนอ่านจริงทั้งหมดของเรื่องนี้
          likes: true,            // ❤️ นับจำนวนไลก์จริงทั้งหมดของเรื่องนี้
        }
      }
    },
    orderBy: {
      readingHistories: {
        _count: "desc", // 🚨 ตรงนี้สำคัญมาก! ต้องเรียงจากยอดอ่านเยอะที่สุด (desc)
      }
    },
    take: 5, // หรือตามจำนวนที่มึงตั้งไว้
  });

  const latestNovels = await prisma.novel.findMany({
    where: { status: "approved" },
    include: {
      author: true,
      _count: {
        select: { readingHistories: true, likes: true }
      }
    },
    orderBy: {
      createdAt: "desc", // 🚨 ตรงนี้สำคัญมาก! ต้องเรียงจากวันที่สร้างล่าสุด (desc)
    },
    take: 5,
  });
  
  return (
    <>
      <Navbar />
      <Hero />
      {/* 2. ส่งข้อมูล popularNovels ผ่าน Props เข้าไปที่ส่วนประกอบ Popular */}
      <Popular popularNovels={popularNovels} />
      {/* 3. ส่งข้อมูล latestNovels ผ่าน Props เข้าไปที่ส่วนประกอบ Latest */}
      <Latest latestNovels={latestNovels} />
      <Features />
      <About />
      <Footer />
    </>
  )
}