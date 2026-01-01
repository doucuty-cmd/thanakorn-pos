import Image from "next/image";

interface ProductCardProps {
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  onClick?: () => void;
}

export const ProductCard = ({ name, price, stock, imageUrl, onClick }: ProductCardProps) => {
  const isOutOfStock = stock <= 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden active:bg-gray-50 transition-colors cursor-pointer flex flex-col h-full relative"
    >
      <div className="relative w-full aspect-square bg-gray-200">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 50vw, 33vw" // ✅ เพิ่มบรรทัดนี้ แก้ Warning
            priority={false} // โหลดแบบปกติ
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-bold text-sm bg-red-500 px-2 py-1 rounded">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-grow justify-between">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight mb-1">{name}</h3>
        <div>
          <p className="text-[#06C755] font-bold">฿{price.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Stock: {stock}</p>
        </div>
      </div>
    </div>
  );
};