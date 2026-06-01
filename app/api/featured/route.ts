import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const novels = await prisma.novel.findMany();

    // สุ่มนิยาย
    const shuffled = novels.sort(() => 0.5 - Math.random());

    const featured = await prisma.novel.findMany({
      where: {
        NOT: {
          status: "pending", // 👈 นิยายเรื่องไหนที่เป็น pending จะโดนซ่อนทันทีโว้ยมึง!
        },
        // 💡 หรือถ้ามึงมีระบบสถานะที่อนุมัติแล้วชัวร์ๆ (เช่น APPROVED หรือ PUBLISHED) 
        // มึงสามารถเปิดใช้บรรทัดข้างล่างนี้แทนได้นะเก๋ๆ:
        // status: "APPROVED"
      },
      // เงื่อนไขดึงเรื่องแนะนำของมึง...
      include: {
        author: true, // ✨ บังคับลากข้อมูลบัญชีคนเขียนจากตาราง User ส่งออกมาใน API ก้อนนี้ด้วย!
      },
    });

    return NextResponse.json(featured);

    

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch featured novels" },
      { status: 500 }
    );
  }
}