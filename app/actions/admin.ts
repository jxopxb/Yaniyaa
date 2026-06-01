"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================================
   SECTION 1: NOVEL APPROVALS (อนุมัตินิยาย)
   ========================================================================== */

export async function getPendingNovels() {
  try {
    const pendingList = await prisma.novel.findMany({
      where: { status: "pending" },
      include: { chapters: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: pendingList };
  } catch (error) {
    return { success: false, error: "ดึงข้อมูลนิยายรอตรวจไม่สำเร็จ" };
  }
}

export async function approveNovel(id: string) {
  try {
    await prisma.novel.update({ where: { id }, data: { status: "approved" } });
    revalidatePath("/");
    revalidatePath("/novel");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) { return { success: false }; }
}

export async function rejectNovel(id: string) {
  try {
    await prisma.novel.update({
      where: { id },
      data: { status: "rejected" }, // ✨ สั่งเป็น rejected ชัดเจน
    });

    // 🔨 ทุบแคชล้างระบบให้หน้าเว็บและแดชบอร์ดอัปเดตทันที
    revalidatePath("/");
    revalidatePath("/novel");
    revalidatePath("/admin/dashboard");

    return { success: true }; 
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

/* ==========================================================================
   SECTION 2: MEMBERS MANAGEMENT (ดูสมาชิก + แบน)
   ========================================================================== */

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true, 
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: "ดึงข้อมูลสมาชิกไม่สำเร็จ" };
  }
}

export async function toggleBanUser(userId: string, currentBannedStatus: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { banned: !currentBannedStatus },
    });
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "ไม่สามารถดำเนินการแบน/ปลดแบนได้" };
  }
}

/* ==========================================================================
   SECTION 3: LIBRARY CONTROL (จัดการคลังนิยายรวมของแอดมิน)
   ========================================================================== */

// 📚 คลังรวมควรเห็นเฉพาะนิยายที่ได้รับอนุมัติ (approved) แล้วเท่านั้น
export async function getAllNovels() {
  try {
    const novels = await prisma.novel.findMany({
      where: { status: "approved" }, // 🔥 ดักไว้เลยมึง พวกโดน reject หรือ pending จะไม่โผล่มาตรงนี้
      include: { chapters: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: novels };
  } catch (error) {
    return { success: false, error: "ดึงข้อมูลคลังนิยายไม่สำเร็จ" };
  }
}

export async function deleteNovel(novelId: string) {
  try {
    await prisma.novel.delete({ where: { id: novelId } });
    revalidatePath("/");
    revalidatePath("/novel");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "ไม่สามารถลบนิยายเรื่องนี้ได้" };
  }
}