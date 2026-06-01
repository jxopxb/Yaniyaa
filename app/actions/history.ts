"use server"

import { prisma } from "@/lib/prisma";

export async function updateReadingHistory(userId: string, novelId: string, chapterId: string) {
  try {
    await prisma.readingHistory.upsert({
      where: {
        userId_novelId: { userId, novelId }
      },
      // ถ้าเคยอ่านเรื่องนี้แล้ว ให้เปลี่ยนชี้ไปที่ Chapter ล่าสุดและอัปเดตเวลา
      update: {
        chapterId,
        updatedAt: new Date()
      },
      // ถ้ายังไม่เคยอ่านเรื่องนี้เลย ให้สร้าง Record ใหม่
      create: {
        userId,
        novelId,
        chapterId
      }
    });
  } catch (error) {
    console.error("Failed to update history:", error);
  }
}