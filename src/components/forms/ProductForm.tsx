"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useImageUpload } from "@/hooks/useImageUpload";

// Validation Schema
const productSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  price: z.coerce.number().min(0, "ราคาต้องไม่ติดลบ"),
  cost: z.coerce.number().min(0, "ต้นทุนต้องไม่ติดลบ"),
  stock: z.coerce.number().min(0, "สต็อกต้องไม่ติดลบ"),
  sku: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any; // ถ้ามีข้อมูลแปลว่าแก้ไข
  onSubmit: (data: ProductFormValues, imageUrl: string | null) => void;
  isLoading: boolean;
  onDelete?: () => void;
}

export const ProductForm = ({ initialData, onSubmit, isLoading, onDelete }: ProductFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null);
  const { uploadImage, uploading } = useImageUpload();

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.selling_price || 0,
      cost: initialData?.cost_price || 0,
      stock: initialData?.stock_qty || 0,
      sku: initialData?.sku || "",
    },
  });

  const handleFormSubmit = async (data: ProductFormValues) => {
    let finalImageUrl = previewUrl;

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }

    onSubmit(data, finalImageUrl);
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
      {/* Image Upload */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-40 h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
          {previewUrl ? (
            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <Upload size={24} />
              <span className="text-xs mt-1">อัปโหลดรูป</span>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleImageChange}
          />
        </div>
        {uploading && <p className="text-sm text-blue-500">กำลังอัปโหลดรูป...</p>}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">ชื่อสินค้า *</label>
          <Input {...register("name")} placeholder="เช่น กะเพราไก่ไข่ดาว" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">ราคาขาย *</label>
            <Input type="number" {...register("price")} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">ต้นทุน</label>
            <Input type="number" {...register("cost")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">จำนวนสต็อก</label>
            <Input type="number" {...register("stock")} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">รหัสสินค้า (SKU)</label>
            <Input {...register("sku")} placeholder="สแกนบาร์โค้ด" />
          </div>
        </div>
      </div>

      {/* Buttons: เพิ่ม z-[60] เพื่อให้ลอยทับเมนูบาร์แน่นอน */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3 max-w-md mx-auto z-[60]">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 bg-red-100 text-red-600 h-12 rounded-lg font-bold flex items-center justify-center active:scale-95 transition-transform"
          >
            <Trash2 size={20} />
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || uploading}
          className="flex-[3] bg-[#06C755] text-white h-12 rounded-lg font-bold flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "บันทึกข้อมูล"}
        </button>
      </div>
    </form>
  );
};