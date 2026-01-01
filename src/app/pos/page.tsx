"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ เพิ่ม useRouter
import { Search, ScanBarcode, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ui/ProductCard";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import Image from "next/image";

export default function POSPage() {
  const router = useRouter(); // ✅ เรียกใช้ router
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [showCartSummary, setShowCartSummary] = useState(false);

  // เรียกใช้ Store
  const { cart, addToCart, removeFromCart, decreaseQuantity, getTotalPrice, getTotalItems, clearCart } = useCartStore();

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.includes(search))
  );

  const handleAddToCart = (product: any) => {
    if (product.stock_qty <= 0) {
      toast.error("สินค้าหมดสต็อก!");
      return;
    }
    addToCart(product);
    toast.success(`เพิ่ม ${product.name} แล้ว`, { duration: 1000 });
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 1. Header & Search */}
      <div className="bg-white p-4 shadow-sm z-10 sticky top-0">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input 
              className="pl-10 h-12 bg-gray-100 border-none" 
              placeholder="ค้นหาสินค้า..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-white border border-gray-200 w-12 h-12 rounded-lg flex items-center justify-center text-gray-600 active:bg-gray-100">
            <ScanBarcode size={24} />
          </button>
        </div>
        
        {/* หมวดหมู่ (Placeholder) */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button className="px-4 py-1.5 bg-[#06C755] text-white rounded-full text-sm font-medium whitespace-nowrap">ทั้งหมด</button>
          <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium whitespace-nowrap">อาหาร</button>
          <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium whitespace-nowrap">เครื่องดื่ม</button>
        </div>
      </div>

      {/* 2. Product Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {isLoading ? (
          <div className="text-center pt-10 text-gray-500">กำลังโหลดสินค้า...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts?.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.selling_price}
                stock={product.stock_qty}
                imageUrl={product.image_url}
                onClick={() => handleAddToCart(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Floating Cart Bar (แสดงเมื่อมีของในตะกร้า) */}
      {totalItems > 0 && (
        <div className="fixed bottom-[70px] left-0 right-0 px-4 z-40 max-w-md mx-auto">
          <div 
            onClick={() => setShowCartSummary(true)}
            className="bg-[#06C755] text-white p-4 rounded-xl shadow-lg flex justify-between items-center cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs opacity-90">ยอดรวม</span>
                <span className="text-lg font-bold">฿{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm bg-white/10 px-3 py-1.5 rounded-lg">
              ดูตะกร้า <ShoppingCart size={16} />
            </div>
          </div>
        </div>
      )}

      {/* 4. Cart Summary Modal (Overlay) */}
      {showCartSummary && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl max-w-md mx-auto w-full max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Header Modal */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="text-[#06C755]" /> ตะกร้าสินค้า ({totalItems})
              </h3>
              <button 
                onClick={() => clearCart()} 
                className="text-red-500 text-sm font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded"
              >
                <Trash2 size={14} /> ล้างตะกร้า
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {/* รูปสินค้าเล็กๆ */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No img</div>
                    )}
                  </div>
                  
                  {/* รายละเอียด */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm line-clamp-2 text-gray-800">{item.name}</h4>
                      <span className="font-bold text-gray-900">฿{(item.selling_price * item.quantity).toLocaleString()}</span>
                    </div>
                    
                    {/* ปุ่มเพิ่ม/ลด จำนวน */}
                    <div className="flex items-center gap-3 self-end">
                      <button 
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 active:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-medium text-gray-700">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item)}
                        className="w-7 h-7 rounded-full bg-[#06C755] text-white flex items-center justify-center active:scale-95"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Footer */}
            <div className="p-4 border-t bg-gray-50 safe-area-pb">
              <div className="flex justify-between mb-4 text-gray-600">
                <span>ราคารวม</span>
                <span className="font-bold text-xl text-black">฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowCartSummary(false)}
                  className="py-3 rounded-xl font-bold text-gray-600 bg-gray-200 active:bg-gray-300"
                >
                  เลือกต่อ
                </button>
                <button 
                  onClick={() => {
                     // ✅ ปิดตะกร้า แล้วไปหน้าจ่ายเงิน
                     setShowCartSummary(false);
                     router.push("/pos/payment");
                  }}
                  className="py-3 rounded-xl font-bold text-white bg-[#06C755] active:scale-95 shadow-lg shadow-green-200"
                >
                  ชำระเงิน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}