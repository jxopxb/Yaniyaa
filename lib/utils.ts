import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ⏳ ฟังก์ชันแปลงเวลา DateTime เป็นภาษาไทยสไตล์ลักชูมินิมอลแบบปลอดภัย
 */
export function timeAgo(date: Date | string | undefined | null): string {
  if (!date) return "";
  
  const now = new Date().getTime();
  const past = new Date(date).getTime();
  const seconds = Math.floor((now - past) / 1000);

  // ดักกรณียังไม่ถึงเวลา หรือระบบเวลาเซิร์ฟเวอร์คลาดเคลื่อนเล็กน้อย
  if (seconds < 5) return "เมื่อกี้";

  const intervals = [
    { label: "ปีที่แล้ว", seconds: 31536000 },
    { label: "เดือนที่แล้ว", seconds: 2592000 },
    { label: "วันที่แล้ว", seconds: 86400 },
    { label: "ชม.ที่แล้ว", seconds: 3600 },
    { label: "นาทีที่แล้ว", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}`;
    }
  }

  return "เพิ่งลงเมื่อกี้";
}