"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ productos: 0, pedidos: 0 });

  useEffect(() => {
    async function loadStats() {
      // Contar productos
      const { count: prodCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
        
      // Contar pedidos
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      setStats({
        productos: prodCount || 0,
        pedidos: orderCount || 0
      });
    }
    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Resumen de tu Tienda</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Productos</p>
          <p className="text-3xl font-bold text-primary">{stats.productos}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Pedidos Registrados</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pedidos}</p>
        </div>
      </div>
    </div>
  );
}
