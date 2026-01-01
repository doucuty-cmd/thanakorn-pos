"use client";

import { useEffect, useState, use } from "react"; // ✅ เพิ่ม use เข้ามา
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ProductForm } from "@/components/forms/ProductForm";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

// ✅ แก้ Type ของ params ให้เป็น Promise
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ ใช้ use() เพื่อดึงค่า id ออกมาจาก Promise
  const { id } = use(params);
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);

  // ดึงข้อมูลสินค้าเก่ามาแสดง
  useEffect(() => {
    const fetchProduct = async () => {
      // ✅ ใช้ตัวแปร id ที่แกะออกมาแล้ว แทน params.id
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id) 
        .single();
      
      if (error) {
        console.error("Error fetching product:", error);
        toast.error("ไม่พบสินค้านี้");
        router.push("/products");
      } else {
        setProduct(data);
      }
    };
    if (id) fetchProduct(); // เช็คว่ามี id ก่อนค่อยดึง
  }, [id, router]);

  const handleUpdate = async (data: any, imageUrl: string | null) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: data.name,
          selling_price: data.price,
          cost_price: data.cost,
          stock_qty: data.stock,
          sku: data.sku || null,
          image_url: imageUrl,
        })
        .eq("id", id); // ✅ ใช้ id ตรงนี้ด้วย

      if (error) throw error;

      toast.success("บันทึกการแก้ไขแล้ว!");
      router.push("/products");
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าจะลบสินค้านี้?")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id); // ✅ ใช้ id ตรงนี้ด้วย
      if (error) throw error;

      toast.success("ลบสินค้าแล้ว");
      router.push("/products");
    } catch (error: any) {
      toast.error("ลบไม่สำเร็จ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-4 min-h-screen bg-white pb-24">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft />
        </button>
        <h1 className="text-xl font-bold">แก้ไขสินค้า</h1>
      </div>
      
      <ProductForm 
        initialData={product} 
        onSubmit={handleUpdate} 
        isLoading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}