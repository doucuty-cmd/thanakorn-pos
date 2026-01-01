"use client";

import Link from "next/link";
import { Package, ScanBarcode, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const menus = [
    { 
      label: "ขายสินค้า (POS)", 
      icon: ScanBarcode, 
      href: "/pos", 
      color: "bg-blue-500" 
    },
    { 
      label: "สต็อกสินค้า", 
      icon: Package, 
      href: "/products", 
      color: "bg-[#06C755]" // LINE Green
    },
    { 
      label: "รายงานยอดขาย", 
      icon: BarChart3, 
      href: "/reports", 
      color: "bg-orange-500" 
    },
    { 
      label: "ตั้งค่าร้านค้า", 
      icon: Settings, 
      href: "/settings", 
      color: "bg-gray-500" 
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">สวัสดี, คุณธนากร 👋</h1>
        <p className="text-gray-500 text-sm">จัดการร้านค้าของคุณได้ง่ายๆ ที่นี่</p>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform space-y-3"
          >
            <div className={cn("p-3 rounded-full text-white shadow-md", menu.color)}>
              <menu.icon size={28} />
            </div>
            <span className="font-bold text-gray-700">{menu.label}</span>
          </Link>
        ))}
      </div>

      {/* Summary Card (ตัวอย่าง) */}
      <div className="bg-[#06C755] rounded-xl p-6 text-white shadow-lg shadow-green-200">
        <h3 className="font-medium opacity-90">ยอดขายวันนี้</h3>
        <p className="text-3xl font-bold mt-1">฿0.00</p>
        <p className="text-xs mt-2 opacity-80">0 บิลที่ขายสำเร็จ</p>
      </div>
    </div>
  );
}