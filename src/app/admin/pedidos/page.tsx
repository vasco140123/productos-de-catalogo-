"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, TrendingUp, PackageSearch } from "lucide-react";

type Product = {
  id: string;
  name: string;
  stock: number;
  base_price: number;
  discount_price?: number;
};

export default function VentasYStock() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [ganancias, setGanancias] = useState(0);
  const [cargando, setCargando] = useState(true);

  async function cargarDatos() {
    setCargando(true);
    // Cargar productos
    const { data: prodData } = await supabase.from('products').select('id, name, stock, base_price, discount_price').order('name');
    if (prodData) setProductos(prodData);

    // Calcular ganancias desde la tabla orders (las que marcamos manualmente)
    const { data: ordenes } = await supabase.from('orders').select('total').eq('delivery_info', 'Venta manual de WhatsApp');
    if (ordenes) {
      const total = ordenes.reduce((sum, o) => sum + Number(o.total), 0);
      setGanancias(total);
    }
    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const registrarVenta = async (prod: Product) => {
    if (prod.stock <= 0) {
      alert("No hay stock para vender este producto.");
      return;
    }

    const confirmar = confirm(`¿Confirmar venta manual por WhatsApp de: ${prod.name}?`);
    if (!confirmar) return;

    const precioVenta = (prod.discount_price && prod.discount_price < prod.base_price) 
      ? prod.discount_price 
      : prod.base_price;

    try {
      // 1. Reducir stock
      await supabase.from('products').update({ stock: prod.stock - 1 }).eq('id', prod.id);

      // 2. Registrar la ganancia en pedidos
      await supabase.from('orders').insert([{
        total: precioVenta,
        status: 'completado',
        delivery_info: 'Venta manual de WhatsApp'
      }]);

      alert(`¡Venta registrada exitosamente! (+ S/. ${precioVenta.toFixed(2)})`);
      cargarDatos();
    } catch (e: any) {
      alert("Error al registrar: " + e.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Gestión de Ventas y Stock</h1>
      
      {/* Tarjeta de Ganancias */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 p-8 rounded-2xl mb-8 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-green-800 font-medium mb-1 flex items-center gap-2">
            <TrendingUp size={20} /> Ganancias Totales Confirmadas
          </p>
          <h2 className="text-4xl font-black text-green-700">S/. {ganancias.toFixed(2)}</h2>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/50 overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex items-center gap-2">
          <PackageSearch size={20} className="text-gray-500" />
          <h3 className="font-bold text-gray-700">Inventario Actual</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/30 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium text-center">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Acción Rapida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cargando ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Cargando inventario...</td></tr>
            ) : productos.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Aún no hay productos en el catálogo.</td></tr>
            ) : (
              productos.map((prod) => (
                <tr key={prod.id} className={`hover:bg-white/50 transition-colors ${prod.stock <= 0 ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{prod.name}</td>
                  <td className="px-6 py-4 text-center">
                    {prod.stock > 0 ? (
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                        {prod.stock}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                        Agotado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                    <button 
                      onClick={() => registrarVenta(prod)}
                      disabled={prod.stock <= 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        prod.stock > 0 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-95' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                      {prod.stock > 0 ? 'Registrar 1 Venta' : 'Sin Stock'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
