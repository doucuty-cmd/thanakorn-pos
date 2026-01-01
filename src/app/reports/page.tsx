"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { th } from "date-fns/locale";
import { DollarSign, ShoppingBag, TrendingUp, Download, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todayTotal: 0, todayOrders: 0, weekTotal: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();
      const sevenDaysAgo = subDays(today, 6).toISOString();

      const { data: todaySales } = await supabase
        .from("sales")
        .select("total_amount")
        .gte("created_at", startOfToday)
        .lte("created_at", endOfToday);

      const todayTotal = todaySales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const todayOrders = todaySales?.length || 0;

      const { data: weekSales } = await supabase
        .from("sales")
        .select("created_at, total_amount")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: true });

      const chartMap = new Map();
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(today, i), "dd/MM");
        chartMap.set(date, 0);
      }
      
      weekSales?.forEach((sale) => {
        const date = format(new Date(sale.created_at), "dd/MM");
        chartMap.set(date, (chartMap.get(date) || 0) + sale.total_amount);
      });

      const { data: recent } = await supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({ todayTotal, todayOrders, weekTotal: 0 });
      setChartData(Array.from(chartMap, ([name, total]) => ({ name, total })));
      setRecentSales(recent || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const { data: salesData } = await supabase
      .from("sales")
      .select(`id, created_at, total_amount, payment_method`)
      .order("created_at", { ascending: false });

    if (!salesData) return;

    const rows = salesData.map(sale => ({
      "วันที่": format(new Date(sale.created_at), "yyyy-MM-dd HH:mm"),
      "รหัสออเดอร์": sale.id.slice(0, 8),
      "ยอดรวม": sale.total_amount,
      "วิธีชำระเงิน": sale.payment_method,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, `Sales_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("ส่งออกไฟล์ Excel สำเร็จ");
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-4 space-y-6 pb-24 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">รายงานยอดขาย</h1>
        <button onClick={exportToExcel} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-700 active:bg-gray-100">
          <Download size={18} /> Excel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1"><DollarSign size={16} className="text-[#06C755]" /><span className="text-xs">ยอดวันนี้</span></div>
          <p className="text-xl font-bold">฿{stats.todayTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1"><ShoppingBag size={16} className="text-blue-500" /><span className="text-xs">ออเดอร์</span></div>
          <p className="text-xl font-bold">{stats.todayOrders}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} /> แนวโน้ม 7 วัน</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#06C755" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-sm text-gray-500">รายการล่าสุด</h3>
        {recentSales.map((sale) => (
          <div key={sale.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">#{sale.id.slice(0, 6)}</p>
              <p className="text-[10px] text-gray-400">{format(new Date(sale.created_at), "HH:mm", { locale: th })} • {sale.payment_method}</p>
            </div>
            <span className="text-[#06C755] font-bold">฿{sale.total_amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}