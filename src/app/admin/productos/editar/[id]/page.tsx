"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function EditarProducto({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [categorias, setCategorias] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    discount_price: "",
    stock: "10",
    is_active: true,
    category_id: ""
  });

  useEffect(() => {
    async function loadData() {
      // Cargar categorías
      const { data: catData } = await supabase.from('categories').select('id, name');
      if (catData) setCategorias(catData);

      // Cargar producto
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (data) {
        setFormData({
          name: data.name,
          description: data.description || "",
          base_price: data.base_price.toString(),
          discount_price: data.discount_price ? data.discount_price.toString() : "",
          stock: data.stock ? data.stock.toString() : "0",
          is_active: data.is_active,
          category_id: data.category_id || ""
        });
      }
      setCargando(false);
    }
    loadData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock),
        is_active: formData.is_active,
        category_id: formData.category_id || null
      };

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', params.id);

      if (error) throw error;

      alert("¡Producto actualizado!");
      router.push("/admin/productos");
    } catch (error: any) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8">Cargando datos del producto...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md p-8 rounded-xl border border-white/50 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Editar Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input 
            type="text" required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Normal (S/.)</label>
            <input 
              type="number" step="0.10" required
              value={formData.base_price}
              onChange={(e) => setFormData({...formData, base_price: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-600 mb-1">Precio Oferta (S/.) (Opcional)</label>
            <input 
              type="number" step="0.10"
              value={formData.discount_price}
              onChange={(e) => setFormData({...formData, discount_price: e.target.value})}
              className="w-full border border-red-200 rounded-lg p-2.5 bg-red-50 focus:ring-red-500"
              placeholder="Ej. 39.90"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Disponible</label>
            <input 
              type="number" required
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
            />
          </div>
          <div className="flex items-center mt-6">
            <label className="flex items-center cursor-pointer gap-2">
              <input 
                type="checkbox" 
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Producto Activo (Visible)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
          >
            <option value="">-- Seleccionar categoría (opcional) --</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={guardando}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2"
          >
            {guardando ? 'Guardando...' : <><Save size={20} /> Actualizar Producto</>}
          </button>
        </div>
      </form>
    </div>
  );
}
