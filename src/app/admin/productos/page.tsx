"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  base_price: number;
  is_active: boolean;
};

export default function AdminProductos() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);

  async function fetchProductos() {
    setCargando(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProductos(data);
    setCargando(false);
  }

  useEffect(() => {
    fetchProductos();
  }, []);

  const eliminarProducto = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    
    await supabase.from('products').delete().eq('id', id);
    fetchProductos(); // Recargar la tabla
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Tus Productos</h1>
        <Link 
          href="/admin/productos/nuevo" 
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} /> Agregar Producto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Precio (S/.)</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cargando ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : productos.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Aún no hay productos creados.</td></tr>
            ) : (
              productos.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{prod.name}</td>
                  <td className="px-6 py-4">S/. {prod.base_price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${prod.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {prod.is_active ? 'Activo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    {/* Botón Editar */}
                    <Link href={`/admin/productos/editar/${prod.id}`} className="text-gray-400 hover:text-blue-600">
                      <Edit size={18} />
                    </Link>
                    {/* Botón Eliminar */}
                    <button onClick={() => eliminarProducto(prod.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={18} />
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
