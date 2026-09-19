"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NuevoProducto() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [categorias, setCategorias] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    features: "",
    base_price: "",
    discount_price: "",
    stock: "10",
    category_id: "",
    is_active: true
  });
  const [archivos, setArchivos] = useState<FileList | null>(null);

  // Cargar categorías disponibles
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('id, name');
      if (data) setCategorias(data);
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

      // Guardar el producto principal
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          slug: slug,
          description: formData.description,
          features: formData.features,
          base_price: parseFloat(formData.base_price),
          discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
          stock: parseInt(formData.stock),
          category_id: formData.category_id || null,
          is_active: formData.is_active
        }])
        .select()
        .single();

      if (prodError) throw prodError;

      // Subir TODAS las imágenes
      if (archivos && prodData) {
        const uploads = Array.from(archivos).map(async (archivo, index) => {
          const fileExt = archivo.name.split('.').pop();
          const fileName = `${prodData.id}-${index}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, archivo);

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);
              
            await supabase.from('product_images').insert([{
              product_id: prodData.id,
              url: urlData.publicUrl,
              position: index
            }]);
          } else {
             console.error("Error subiendo imagen:", uploadError);
          }
        });
        await Promise.all(uploads);
      }

      alert("¡Producto creado con éxito!");
      router.push("/admin/productos");
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md p-8 rounded-xl border border-white/50 shadow-sm my-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Crear Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
          <input 
            type="text" required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ej. Perfume Floral 50ml"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Normal (S/.)</label>
            <input 
              type="number" step="0.10" required
              value={formData.base_price}
              onChange={(e) => setFormData({...formData, base_price: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-600 mb-1">Precio Oferta (S/.) (Opcional)</label>
            <input 
              type="number" step="0.10"
              value={formData.discount_price}
              onChange={(e) => setFormData({...formData, discount_price: e.target.value})}
              className="w-full border border-red-200 rounded-lg p-2.5 bg-red-50"
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
              className="w-full border border-gray-300 rounded-lg p-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
            >
              <option value="">-- Seleccionar categoría --</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Lo que ve el cliente a primera vista)</label>
          <textarea 
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5"
            placeholder="Describe el producto brevemente..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cosas que tienes que saber (Tamaño, ingredientes, detalles extra)</label>
          <textarea 
            rows={4}
            value={formData.features}
            onChange={(e) => setFormData({...formData, features: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50"
            placeholder="Ej. - Contiene 50ml&#10;- Larga duración&#10;- Envase de vidrio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes del Producto (Puedes seleccionar varias a la vez)</label>
          <input 
            type="file" 
            accept="image/*"
            multiple
            onChange={(e) => setArchivos(e.target.files)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-primary hover:file:bg-red-100"
          />
          {archivos && <p className="text-sm mt-2 text-green-600">{archivos.length} archivo(s) seleccionado(s)</p>}
        </div>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer gap-2">
            <input 
              type="checkbox" 
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5 text-primary rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Producto Activo (Visible en la tienda)</span>
          </label>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={guardando}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2"
          >
            {guardando ? 'Guardando producto e imágenes...' : <><Save size={20} /> Guardar Producto</>}
          </button>
        </div>
      </form>
    </div>
  );
}
