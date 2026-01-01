"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // เพิ่มตัวนี้เข้ามาเพื่อใช้เปลี่ยนหน้า
import { Plus } from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ui/ProductCard";
import { Input } from "@/components/ui/Input";

export default function ProductsPage() {
  const router = useRouter(); // เรียกใช้ router
  const { data: products, isLoading, error } = useProducts();
  const [search, setSearch] = useState("");

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.includes(search))
  );

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">สินค้า</h1>
        <Link 
          href="/products/new" 
          className="bg-[#06C755] text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </Link>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search name or SKU..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
      />

      {/* Product List */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">Error: {error.message}</div>
      ) : filteredProducts?.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p>No products found</p>
          <p className="text-sm mt-1">เพิ่มสินค้าตรงนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts?.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.selling_price}
              stock={product.stock_qty}
              imageUrl={product.image_url}
              onClick={() => router.push(`/products/${product.id}`)} // กดแล้วไปหน้าแก้ไข
            />
          ))}
        </div>
      )}
    </div>
  );
}