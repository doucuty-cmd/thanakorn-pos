"use client";

import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/lib/supabase/client";

// ✅ 1. Schema ใช้ z.coerce เพื่อบังคับแปลง String จาก Input เป็น Number
const productSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  price: z.coerce.number().min(0, "ราคาต้องไม่ติดลบ"),
  cost: z.coerce.number().min(0, "ต้นทุนต้องไม่ติดลบ"),
  stock: z.coerce.number().min(0, "สต็อกต้องไม่ติดลบ"),
  sku: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
});

// ✅ 2. กำหนด Type ให้ชัดเจนตรงตาม Schema
type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: ProductFormValues, imageUrl: string | null) => void;
  isLoading: boolean;
  onDelete?: () => void;
}

export const ProductForm = ({ initialData, onSubmit, isLoading, onDelete }: ProductFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null);
  const [categories, setCategories] = useState<any[]>([]);
  const { uploadImage, uploading } = useImageUpload();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // ✅ 3. ระบุ <ProductFormValues> เพื่อให้ register รู้จัก field
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.selling_price || 0,
      cost: initialData?.cost_price || 0,
      stock: initialData?.stock_qty || 0,
      sku: initialData?.sku || "",
      category_id: initialData?.category_id || "",
    },
  });

  // ✅ 4. แก้ไข handleFormSubmit ให้รับค่าที่ยืดหยุ่นขึ้นเพื่อแก้ปัญหา Type Incompatible
  const handleFormSubmit = async (values: FieldValues) => {
    let finalImageUrl = previewUrl;
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }
    // ส่งข้อมูลออกไปในรูปแบบ ProductFormValues ตามที่ Props ต้องการ
    onSubmit(values as ProductFormValues, finalImageUrl);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pb-32">
      {/* ส่วน Image Upload */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-40 h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
          {previewUrl ? (
            <Image src={previewUrl} alt="Preview" fill className="object-cover" sizes="160px" />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <Upload size={24} />
              <span className="text-xs mt-1">อัปโหลดรูป</span>
            </div>
          )}
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
        </div>
        {uploading && <p className="text-sm text-[#06C755] animate-pulse">กำลังอัปโหลดรูป...</p>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold text-gray-700 ml-1">ชื่อสินค้า *</label>
          <Input {...register("name")} placeholder="เช่น กะเพราไก่ไข่ดาว" className="h-12" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 ml-1">หมวดหมู่</label>
          <select 
            {...register("category_id")}
            className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#06C755] transition-all"
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1">ราคาขาย *</label>
            <Input type="number" step="0.01" {...register("price")} className="h-12" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1">ต้นทุน</label>
            <Input type="number" step="0.01" {...register("cost")} className="h-12" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1">จำนวนสต็อก</label>
            <Input type="number" {...register("stock")} className="h-12" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1">รหัสสินค้า (SKU)</label>
            <Input {...register("sku")} placeholder="สแกนบาร์โค้ด" className="h-12" />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3 max-w-md mx-auto z-[60]">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 bg-red-50 text-red-500 h-12 rounded-xl font-bold flex items-center justify-center active:scale-95 transition-transform border border-red-100"
          >
            <Trash2 size={20} />
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || uploading}
          className="flex-[3] bg-[#06C755] text-white h-12 rounded-xl font-bold flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform shadow-lg shadow-green-100"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "บันทึกข้อมูล"}
        </button>
      </div>
    </form>
  );
};