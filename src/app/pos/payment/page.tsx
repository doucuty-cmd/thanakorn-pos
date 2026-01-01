"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/lib/supabase/client";
import { ChevronLeft, CheckCircle2, Loader2, QrCode } from "lucide-react";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import { toast } from "sonner";
import { SHOP_CONFIG } from "@/lib/config"; // ✅ นำเข้าไฟล์ตั้งค่าที่เราเพิ่งสร้าง

export default function PaymentPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ✅ ดึงเบอร์ PromptPay มาจากไฟล์ config แทน (ไม่ต้องแก้เลขในหน้านี้แล้ว)
  const PROMPTPAY_ID = SHOP_CONFIG.PROMPTPAY_ID;

  const totalAmount = getTotalPrice();

  // สร้าง QR Code เมื่อเข้าหน้าเว็บ
  useEffect(() => {
    if (totalAmount <= 0) {
      router.replace("/pos"); 
      return;
    }

    const generateQR = async () => {
      try {
        const payload = generatePayload(PROMPTPAY_ID, { amount: totalAmount });
        const url = await QRCode.toDataURL(payload);
        setQrCodeUrl(url);
      } catch (err) {
        console.error(err);
        toast.error("สร้าง QR Code ไม่สำเร็จ");
      }
    };

    generateQR();
  }, [totalAmount, router, PROMPTPAY_ID]);

  const handleConfirmPayment = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      // 1. สร้างบิลขาย (Sale)
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          total_amount: totalAmount,
          status: "completed",
          payment_method: "promptpay",
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. บันทึกรายการสินค้า (Sale Items)
      const saleItems = cart.map((item) => ({
        sale_id: saleData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_sale: item.selling_price, 
        total: item.selling_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // 3. ตัดสต็อกสินค้า (Update Stock)
      for (const item of cart) {
        const newStock = item.stock_qty - item.quantity;
        await supabase
          .from("products")
          .update({ stock_qty: newStock })
          .eq("id", item.id);
      }

      // 4. สำเร็จ!
      toast.success("บันทึกยอดขายเรียบร้อย!");
      clearCart();
      router.replace("/pos");

    } catch (error: any) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft />
        </button>
        <h1 className="text-xl font-bold">ชำระเงิน</h1>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
        {/* ยอดเงินใหญ่ๆ */}
        <div className="text-center">
          <p className="text-gray-500 mb-1">ยอดชำระทั้งหมด</p>
          <h2 className="text-4xl font-bold text-[#06C755]">฿{totalAmount.toLocaleString()}</h2>
        </div>

        {/* QR Code Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center w-full max-w-sm">
          <div className="bg-[#003D68] w-full p-3 rounded-t-lg mb-4 flex items-center justify-center gap-2">
             <QrCode className="text-white" size={20}/>
             <span className="text-white font-bold">Thai QR Payment</span>
          </div>
          
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="PromptPay QR" className="w-64 h-64 object-contain mix-blend-multiply" />
          ) : (
            <div className="w-64 h-64 bg-gray-100 flex items-center justify-center text-gray-400">
              กำลังสร้าง QR...
            </div>
          )}
          
          <p className="mt-4 text-sm text-gray-500">สแกนเพื่อจ่ายเงินเข้าบัญชี</p>
          <p className="font-medium text-gray-700">{PROMPTPAY_ID}</p>
        </div>

        {/* ปุ่มยืนยัน */}
        <button
          onClick={handleConfirmPayment}
          disabled={loading}
          className="w-full max-w-sm py-4 bg-[#06C755] text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <CheckCircle2 /> ยืนยันการชำระเงิน
            </>
          )}
        </button>
      </div>
    </div>
  );
}