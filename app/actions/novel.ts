"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers"; 
import { auth } from "@/lib/auth"; 

// 🔔 อิมพอร์ตฟังก์ชันแจ้งเตือน (เหลือแค่ใช้ตอนอัปเดตตอนใหม่ที่เผยแพร่ทันที)
import { notifyNewChapter } from "@/app/actions/notification";

/**
 * 🔗 ฟังก์ชันช่วยสร้าง Slug ภาษาไทย + อังกฤษ แบบปลอดภัย
 */
function generateSlug(title: string): string {
  const cleanedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9ก-๙\s-]/g, "")
    .replace(/\s+/g, "-");
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${cleanedTitle}-${randomSuffix}`;
}

// ======================================================
// 🔍 GET NOVEL BY ID
// ======================================================
export async function getNovelById(id: string) {
  try {
    const novel = await prisma.novel.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: {
            chapterNumber: "asc" 
          }
        }
      }
    });
    return { success: true, data: novel };
  } catch (error) {
    console.error("Error fetching novel:", error);
    return { success: false, error: "ไม่พบข้อมูลนิยาย" };
  }
}

/**
 * 📝 1. ฟังก์ชันสร้างนิยายเรื่องใหม่ (Create Novel)
 * 🛠️ [แก้ไข]: ถอดระบบแจ้งเตือนออก เพื่อให้สถานะค้างที่ "pending" รอแอดมินเช็คและกดอนุมัติก่อนค่อยเด้ง
 */
export async function createNovel(data: {
  title: string;
  description?: string;
  coverImage: string;
  type: "FREE" | "PREMIUM";
  category: string; 
  language: string; 
  status?: string; 
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers() 
    });
    
    if (!session || !session.user?.id) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนสร้างนิยายครับมึง" };
    }

    const userId = session.user.id; 
    const slug = generateSlug(data.title);

    const newNovel = await prisma.novel.create({
      data: {
        title: data.title,
        slug: slug,
        description: data.description,
        coverImage: data.coverImage,
        authorId: userId, 
        type: data.type,
        status: data.status || "draft", // หน้าบ้านจะส่งเป็น "pending" เข้ามาเพื่อรอตรวจ
        category: data.category, 
        language: data.language, 
      },
    });

    revalidatePath("/studio");
    return { success: true, data: newNovel };
  } catch (error) {
    console.error("Error creating novel:", error);
    return { success: false, error: "ไม่สามารถสร้างนิยายได้ กรุณาลองใหม่อีกครั้ง" };
  }
}

/**
 * ✍️ 2. ฟังก์ชันเพิ่มตอนใหม่ หรืออัปเดตตอนนิยาย (Save/Create Chapter)
 */
export async function saveChapter(data: {
  novelId: string;
  title: string;
  content: string;
  chapterNumber: number;
  status: "draft" | "published";
}) {
  try {
    const existingChapter = await prisma.chapter.findUnique({
      where: {
        novelId_chapterNumber: {
          novelId: data.novelId,
          chapterNumber: data.chapterNumber,
        },
      },
    });

    if (existingChapter) {
      const updatedChapter = await prisma.chapter.update({
        where: {
          id: existingChapter.id, 
        },
        data: {
          title: data.title,
          content: data.content,
          status: data.status, 
          updatedAt: new Date(),
        },
      });

      // @ts-ignore
      updatedChapter.status = data.status;

      revalidatePath(`/novel/${data.novelId}`);
      return { success: true, data: updatedChapter };
    } else {
      const newChapter = await prisma.chapter.create({
        data: {
          novelId: data.novelId,
          title: data.title,
          content: data.content,
          chapterNumber: data.chapterNumber,
          status: data.status,
        },
      });

      // 🔥 ถ้านักเขียนกดเผยแพร่ตอนใหม่ (published) ทันที ให้กระดิ่งเด้งบอกนักอ่านได้เลย
      if (newChapter && data.status === "published") {
        await notifyNewChapter({
          novelId: data.novelId,
          chapterId: newChapter.id,
          chapterTitle: data.title,
        });
      }

      revalidatePath(`/novel/${data.novelId}`);
      return { success: true, data: newChapter };
    }
  } catch (error) {
    console.error("Error saving chapter:", error);
    return { success: false, error: "ไม่สามารถบันทึกเนื้อหาตอนนิยายได้" };
  }
}

/**
 * 🛡️ 3. ฟังก์ชันส่งนิยายให้แอดมินตรวจสอบ (Submit to Admin Queue)
 */
export async function submitNovelForReview(novelId: string) {
  try {
    const updatedNovel = await prisma.novel.update({
      where: { id: novelId },
      data: {
        status: "pending", 
        rejectionReason: null, 
      },
    });

    revalidatePath("/studio");
    revalidatePath("/admin/dashboard"); 
    
    return { success: true, data: updatedNovel };
  } catch (error) {
    console.error("Error submitting novel for review:", error);
    return { success: false, error: "ไม่สามารถส่งตรวจสอบผลงานได้" };
  }
}

/**
 * 📚 4. ฟังก์ชันดึงนิยายทั้งหมดเฉพาะของ Account ที่ล็อกอินอยู่ (อัปเดตดึงยอดวิว)
 */
export async function getMyNovels() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user?.id) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนครับ" };
    }

    const novels = await prisma.novel.findMany({
      where: { authorId: session.user.id }, 
      include: {
        _count: {
          select: { readingHistories: true } // ดึงยอดคนอ่านจากตารางประวัติ
        }
      },
      orderBy: { createdAt: "desc" },
    });
    
    // แปลงข้อมูล _count ให้กลายเป็น views เพื่อให้ UI รับไปโชว์ได้ทันที
    const formattedNovels = novels.map(novel => ({
      ...novel,
      views: novel._count.readingHistories
    }));

    return { success: true, data: formattedNovels };
  } catch (error) {
    console.error("Error fetching user novels:", error);
    return { success: false, error: "ไม่สามารถโหลดรายการนิยายได้" };
  }
}

/**
 * 🔄 5. ฟังก์ชันอัปเดตข้อมูลนิยายเดิม
 */
export async function updateNovel(novelId: string, data: {
  title: string;
  description?: string;
  coverImage: string;
  category: string;
  language: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await prisma.novel.updateMany({
      where: {
        id: novelId,
        authorId: session.user.id, 
      },
      data: {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        category: data.category,
        language: data.language,
      },
    });

    if (updated.count === 0) {
      return { success: false, error: "ไม่พบข้อมูลนิยายหรือคุณไม่มีสิทธิ์แก้ไขผลงานชิ้นนี้" };
    }

    revalidatePath("/my-novels");
    revalidatePath(`/novel/${novelId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating novel:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" };
  }
}

/**
 * 🗑️ 6. ฟังก์ชันลบนิยายออกจาก Neon DB
 */
export async function deleteNovel(novelId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const deleted = await prisma.novel.deleteMany({
      where: {
        id: novelId,
        authorId: session.user.id, 
      },
    });

    if (deleted.count === 0) {
      return { success: false, error: "ลบไม่สำเร็จเนื่องจากคุณไม่ได้รับอนุญาตให้จัดการชิ้นงานนี้" };
    }

    revalidatePath("/my-novels");
    return { success: true };
  } catch (error) {
    console.error("Error deleting novel:", error);
    return { success: false, error: "ไม่สามารถลบนิยายได้ในขณะนี้" };
  }
}

/**
 * 🗑️ 6.5 ฟังก์ชันเคลียร์ตอนที่ถูกลบออกจากหน้าบ้าน (Clean up orphaned chapters)
 */
export async function deleteOrphanedChapters(novelId: string, currentTotalChapters: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // ลบทุกตอนที่ลำดับมากกว่าจำนวนตอนปัจจุบันที่เหลืออยู่หน้าบ้าน
    await prisma.chapter.deleteMany({
      where: {
        novelId: novelId,
        chapterNumber: {
          gt: currentTotalChapters
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting orphaned chapters:", error);
    return { success: false, error: "ไม่สามารถเคลียร์ตอนเก่าได้" };
  }
}

// ======================================================
// ✨ [เพิ่มใหม่]: Phase 2 - ฟังก์ชันสถิติและพฤติกรรมผู้ใช้
// ======================================================

/**
 * 👁️ 7. ฟังก์ชันบันทึกประวัติการอ่าน (Track Reading)
 * ล็อกยอดคนอ่านจริงแบบออโต้ ป้องกันการสแปมปั๊มยอดวิวซ้ำ
 */
export async function trackReadNovel(userId: string, novelId: string, chapterId: string, category: string) {
  if (!userId || !novelId || !chapterId) return { success: false, error: "ข้อมูลไม่ครบถ้วน" };

  try {
    await prisma.readingHistory.upsert({
      where: {
        userId_novelId: { userId, novelId }
      },
      update: {
        chapterId,
        lastReadAt: new Date(),
      },
      create: {
        userId,
        novelId,
        chapterId,
        category,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("❌ [Track Read Error]:", error);
    return { success: false, error: "บันทึกประวัติการอ่านล้มเหลว" };
  }
}

/**
 * ❤️ 8. ฟังก์ชันกดถูกใจ / ยกเลิกถูกใจ (Toggle Like)
 */
export async function toggleLikeNovel(userId: string, novelId: string, category: string) {
  if (!userId || !novelId) return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการครับ" };

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_novelId: { userId, novelId }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_novelId: { userId, novelId }
        }
      });
      revalidatePath(`/novel/${novelId}`);
      return { success: true, isLiked: false };
    } else {
      await prisma.like.create({
        data: { userId, novelId, category }
      });
      revalidatePath(`/novel/${novelId}`);
      return { success: true, isLiked: true };
    }
  } catch (error) {
    console.error("❌ [Toggle Like Error]:", error);
    return { success: false, error: "ไม่สามารถประมวลผลระบบถูกใจได้" };
  }
}

/**
 * 🔥 9. ฟังก์ชันดึง "5 อันดับยอดนิยม" (Top 5 Popular)
 * เรียงลำดับตามความฮิตของจำนวนผู้อ่านจริง (Unique Readers) ในตารางสัมพันธ์
 */
export async function getTopPopularNovels() {
  try {
    const topNovels = await prisma.novel.findMany({
      where: { status: "approved" },
      include: {
        author: {
          select: { name: true, image: true }
        },
        _count: {
          select: { 
            readingHistories: true, 
            likes: true             
          }
        }
      },
      orderBy: {
        readingHistories: {
          _count: "desc"
        }
      },
      take: 10, 
    });

    return { success: true, data: topNovels };
  } catch (error) {
    console.error("❌ [Get Top Popular Error]:", error);
    return { success: false, data: [] };
  }
}

/**
 * 🆕 10. ฟังก์ชันดึง "รายการนิยายล่าสุด" (Recent Novels)
 */
export async function getRecentNovels() {
  try {
    const recentNovels = await prisma.novel.findMany({
      where: { status: "approved" },
      include: {
        author: {
          select: { name: true, image: true }
        },
        _count: {
          select: { 
            readingHistories: true,
            likes: true 
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10, 
    });

    return { success: true, data: recentNovels };
  } catch (error) {
    console.error("❌ [Get Recent Error]:", error);
    return { success: false, data: [] };
  }
}