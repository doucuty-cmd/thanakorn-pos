"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ProductForm } from "@/components/forms/ProductForm";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any, imageUrl: string | null) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("products").insert({
        name: data.name,
        selling_price: data.price,
        cost_price: data.cost,
        stock_qty: data.stock,
        sku: data.sku || null,
        image_url: imageUrl,
        is_active: true,
      });

      if (error) throw error;

      toast.success("เพิ่มสินค้าเรียบร้อย!");
      router.push("/products");
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 min-h-screen bg-white">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft />
        </button>
        <h1 className="text-xl font-bold">เพิ่มสินค้าใหม่</h1>
      </div>
      
      <ProductForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}