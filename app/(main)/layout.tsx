import React from "react";
import Navbar from "@/app/(landing)/Navbar" // [แก้ไข] นำเข้า Navbar จากที่ถูกต้องตามโครงสร้างแอปของคุณ

// ใช้ Interface แบบมาตรฐานที่สุดสำหรับ Next.js Layout ไม่ต้องไปแกะ params ในนี้
interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    // คลุมด้วย bg-background และข้อความสีหลัก เพื่อล็อกระบบสลับโหมดของกรุ๊ป (main) ทั้งหมดให้เสถียร
    <div className="min-h-screen bg-background text-foreground relative transition-colors duration-300">

        {/* Navbar คงที่ด้านบนตลอดเวลา */}
        <Navbar />
      
      {/* ส่วนแสดงผลของหน้าลูกๆ ทั้งหมด (รวมถึงหน้าอ่านนิยายและสารบัญ) */}
      <div className="relative w-full">
        {children}
      </div>

    </div>
  );
}