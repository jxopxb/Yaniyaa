"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ======================================================
// 📦 INTERNAL HELPERS (ฟังก์ชันช่วยสร้างข้อมูลภายใน)
// ======================================================

// 🔔 สร้างแจ้งเตือนเฉพาะเจาะจงรายบุคคล
async function createUserNotification({
  userId,
  title,
  content,
  type,
  coverUrl,
  novelId,
  chapterId,
}: {
  userId: string;
  title: string;
  content: string;
  type: string;
  coverUrl?: string;
  novelId?: string;
  chapterId?: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      content,
      type,
      coverUrl,
      novelId,
      chapterId,
      isGlobal: false,
    },
  });
}

// 🌍 กระจายแจ้งเตือนหาทุกคนในระบบแยกแถวกัน (แก้บั๊กอ่านแล้วพัง + กระดิ่งไม่นับเลข)
async function broadcastNotificationToAll({
  title,
  content,
  type,
  coverUrl,
  novelId,
  chapterId,
}: {
  title: string;
  content: string;
  type: string;
  coverUrl?: string;
  novelId?: string;
  chapterId?: string;
}) {
  // ดึง ID ของผู้ใช้ทุกคนในแพลตฟอร์มออกมารับข่าวสาร
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  if (allUsers.length === 0) return;

  // บันทึกลงตาราง Notification ตูมเดียวแยกไอดีใครไอดีมัน กดอ่านแยกกันอิสระ
  return prisma.notification.createMany({
    data: allUsers.map((user) => ({
      userId: user.id,
      title,
      content,
      type,
      coverUrl,
      novelId,
      chapterId,
      isGlobal: false,
    })),
  });
}

// ======================================================
// ➕ NEW NOVEL CREATED (เด้งทันทีตอนยูสเซอร์กด "เพิ่มนิยายใหม่")
// ======================================================
export async function notifyNewNovelCreated(novelId: string) {
  try {
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
      select: { id: true, title: true, coverImage: true },
    });

    if (!novel) return { success: false, error: "ไม่พบนิยาย" };

    // สั่งกระจายกระดิ่งเตือนผู้ใช้ทุกคนบนแพลตฟอร์มทันที
    await broadcastNotificationToAll({
      title: "มีนิยายเรื่องใหม่แกะกล่อง! 📚",
      content: `เรื่องใหม่ล่าสุด: "${novel.title}" ถูกเพิ่มเข้ามาในคลังแล้ว ไปรอดูกันเลย!`,
      type: "NEW_NOVEL",
      coverUrl: novel.coverImage,
      novelId: novel.id,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ [Yaniyaa Error] notifyNewNovelCreated พัง:", error);
    return { success: false, error: "ระบบกระจายแจ้งเตือนขัดข้อง" };
  }
}

// ======================================================
// ✅ APPROVE NOVEL (เด้งตอนแอดมินกดอนุมัตินิยาย)
// ======================================================
export async function approveNovel(id: string) {
  try {
    const novel = await prisma.novel.findUnique({
      where: { id },
      select: { id: true, title: true, authorId: true, coverImage: true },
    });

    if (!novel) return { success: false, error: "ไม่พบนิยาย" };

    await prisma.novel.update({
      where: { id },
      data: { status: "approved" },
    });

    // 1. ส่งแจ้งเตือนส่วนตัวดีใจด้วยกับนักเขียนคนนั้น
    await createUserNotification({
      userId: novel.authorId,
      title: "นิยายผ่านการอนุมัติแล้ว 🎉",
      content: `นิยายเรื่อง "${novel.title}" ได้รับการตรวจสอบและเผยแพร่แล้ว`,
      type: "APPROVED",
      coverUrl: novel.coverImage,
      novelId: novel.id,
    });

    // 2. ส่งกระจายข่าวยกเว็บให้คนอื่นรู้ว่านิยายเรื่องนี้พร้อมอ่านแล้ว
    await broadcastNotificationToAll({
      title: "นิยายใหม่เปิดให้อ่านแล้ว 📖",
      content: `เรื่อง "${novel.title}" อนุมัติเรียบร้อย พร้อมเสิร์ฟความสนุกแล้วตอนนี้`,
      type: "NEW_NOVEL",
      coverUrl: novel.coverImage,
      novelId: novel.id,
    });

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("❌ [Yaniyaa Error] approveNovel พัง:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการอนุมัติ" };
  }
}

// ======================================================
// ❌ REJECT NOVEL (เด้งตอนแอดมินปัดตกนิยาย)
// ======================================================
export async function rejectNovel(id: string) {
  try {
    const novel = await prisma.novel.findUnique({
      where: { id },
      select: { id: true, title: true, authorId: true },
    });

    if (!novel) return { success: false, error: "ไม่พบนิยาย" };

    await prisma.novel.update({
      where: { id },
      data: { status: "rejected" },
    });

    // ส่งเข้ากระดิ่งนักเขียนคนเดียวเงียบๆ ไม่ป่าวประกาศ
    await createUserNotification({
      userId: novel.authorId,
      title: "นิยายไม่ผ่านการอนุมัติ ❌",
      content: `นิยายเรื่อง "${novel.title}" ไม่ผ่านการตรวจสอบกรุณาเช็ครายละเอียด`,
      type: "REJECTED",
      novelId: novel.id,
    });

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("❌ [Yaniyaa Error] rejectNovel พัง:", error);
    return { success: false, error: "เกิดข้อผิดพลาด" };
  }
}

// ======================================================
// ✨ NEW CHAPTER (เด้งตอนอัปเดตตอนใหม่)
// ======================================================
export async function notifyNewChapter({
  novelId,
  chapterId,
  chapterTitle,
}: {
  novelId: string;
  chapterId: string;
  chapterTitle: string;
}) {
  try {
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
      select: { id: true, title: true, coverImage: true },
    });

    if (!novel) return { success: false };

    await broadcastNotificationToAll({
      title: "นิยายอัปเดตตอนใหม่ ✨",
      content: `${novel.title} อัปเดต "${chapterTitle}"`,
      type: "NEW_CHAPTER",
      coverUrl: novel.coverImage,
      novelId: novel.id,
      chapterId,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ [Yaniyaa Error] notifyNewChapter พัง:", error);
    return { success: false };
  }
}

// ======================================================
// 🚫 BAN USER (เด้งประกาศแบนผู้ใช้)
// ======================================================
export async function banUser(targetUserId: string) {
  try {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return { success: false };

    await prisma.user.update({
      where: { id: targetUserId },
      data: { banned: true },
    });

    await broadcastNotificationToAll({
      title: "ประกาศจากทีมงาน ⚠️",
      content: `บัญชี "${targetUser.name}" ถูกระงับการใช้งานเนื่องจากละเมิดกฎของแพลตฟอร์ม`,
      type: "USER_BANNED",
    });

    return { success: true };
  } catch (error) {
    console.error("❌ [Yaniyaa Error] banUser พัง:", error);
    return { success: false };
  }
}

// ======================================================
// 📥 GET USER NOTIFICATIONS (ดึงข้อมูลแจ้งเตือนของผู้ใช้รายนั้นๆ)
// ======================================================
export async function getUserNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error("❌ [Yaniyaa Error] getUserNotifications พัง:", error);
    return { success: false, data: [] };
  }
}

// ======================================================
// 👁️ MARK ONE AS READ (อ่านทีละอัน)
// ======================================================
export async function markAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error("❌ [Yaniyaa Error] markAsRead พัง:", error);
    return { success: false };
  }
}

// ======================================================
// 🧹 MARK ALL AS READ (อ่านทั้งหมด)
// ======================================================
export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error("❌ [Yaniyaa Error] markAllAsRead พัง:", error);
    return { success: false };
  }
}

/**
 * 🗑️ ฟังก์ชันล้างแจ้งเตือนทั้งหมด "เฉพาะของ User คนนั้น"
 */
export async function clearAllNotifications(userId: string) {
    if (!userId) {
      return { success: false, error: "ไม่พบข้อมูลผู้ใช้งานมึง" };
    }
  
    try {
      // 🔥 สั่งลบเฉพาะแจ้งเตือนที่เป็นของ userId นี้เท่านั้น!
      await prisma.notification.deleteMany({
        where: {
          userId: userId,
        },
      });
  
      // ทุบแคชหน้าเว็บเพื่อให้กระดิ่งแจ้งเตือนอัปเดตเป็นเลข 0 ทันที
      revalidatePath("/");
      
      return { success: true };
    } catch (error) {
      console.error("Clear notifications error:", error);
      return { success: false, error: "ล้างแจ้งเตือนไม่สำเร็จโว้ยมึง" };
    }
  }