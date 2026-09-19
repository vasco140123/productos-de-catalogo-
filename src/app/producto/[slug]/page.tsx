"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import Link from "next/link";
import { ShoppingCart, MessageCircle, ChevronLeft, ChevronRight, Info } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string;
  base_price: number;
  discount_price?: number;
  stock: number;
  category_id: string;
  product_images?: { url: string }[];
};

export default function ProductoDetalle({ params }: { params: { slug: string } }) {
  const [producto, setProducto] = useState<Product | null>(null);
  const [relacionados, setRelacionados] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);
  const [imagenActual, setImagenActual] = useState(0);
  
  const { addToCart } = useCart();
  const WTS_NUMBER = "51926569490"; // Tu número

  useEffect(() => {
    async function cargarProducto() {
      // Validar si el parámetro es un UUID (ID) o un texto (slug)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.slug);
      
      let query = supabase.from('products').select(`*, product_images(url)`);
      
      if (isUUID) {
        query = query.eq('id', params.slug);
      } else {
        query = query.eq('slug', params.slug);
      }

      const { data, error } = await query.single();
      
      if (data) {
        setProducto(data);
        
        // Cargar relacionados
        if (data.category_id) {
          const { data: relData } = await supabase
            .from('products')
            .select(`*, product_images(url)`)
            .eq('category_id', data.category_id)
            .eq('is_active', true)
            .neq('id', data.id)
            .limit(4);
          
          if (relData) setRelacionados(relData);
        }
      }
      setCargando(false);
    }
    cargarProducto();
  }, [params.slug]);

  // Rotación automática de imágenes
  useEffect(() => {
    if (!producto || !producto.product_images || producto.product_images.length <= 1) return;
    const interval = setInterval(() => {
      setImagenActual(prev => (prev + 1) % producto.product_images!.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [producto]);

  const precioFinal = producto?.discount_price && producto.discount_price < producto.base_price 
    ? producto.discount_price 
    : producto?.base_price || 0;

  const handleAgregarCarrito = () => {
    if (!producto || producto.stock <= 0) return;
    addToCart({
      id: producto.id,
      name: producto.name,
      price: precioFinal,
      quantity: 1,
      image_url: producto.product_images?.[0]?.url
    });
    toast.success(`¡Agregado al carrito!`, { iconTheme: { primary: '#E11D48', secondary: '#fff' } });
  };

  const handleComprarAhora = () => {
    if (!producto || producto.stock <= 0) return;
    const msj = `Hola! Me interesa comprar el producto: *${producto.name}* a S/. ${precioFinal.toFixed(2)} que vi en el catálogo.`;
    window.open(`https://wa.me/${WTS_NUMBER}?text=${encodeURIComponent(msj)}`, '_blank');
  };

  if (cargando) return <div className="py-24 text-center">Cargando detalles del producto...</div>;
  if (!producto) return <div className="py-24 text-center text-gray-500">Producto no encontrado.</div>;

  const isAgotado = producto.stock <= 0;
  const imagenes = producto.product_images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Botón Volver */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 font-medium">
        <ChevronLeft size={20} /> Volver al inicio
      </Link>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 p-6 md:p-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* GALERÍA DE IMÁGENES */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group">
              {isAgotado && (
                <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center backdrop-blur-sm">
                  <span className="bg-red-600 text-white font-black text-2xl px-6 py-2 rounded shadow-lg transform -rotate-12 border-2 border-white">AGOTADO</span>
                </div>
              )}
              {imagenes.length > 0 ? (
                <>
                  <img 
                    src={imagenes[imagenActual].url} 
                    alt={producto.name} 
                    className="w-full h-full object-contain md:object-cover"
                  />
                  {/* Botones de navegación manual */}
                  {imagenes.length > 1 && (
                    <>
                      <button onClick={() => setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-sm text-gray-800 hover:bg-white z-10 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={24}/></button>
                      <button onClick={() => setImagenActual((prev) => (prev + 1) % imagenes.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-sm text-gray-800 hover:bg-white z-10 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={24}/></button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Sin foto</div>
              )}
            </div>
            
            {/* Miniaturas */}
            {imagenes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imagenes.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setImagenActual(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${imagenActual === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETALLES DEL PRODUCTO */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">{producto.name}</h1>
            
            <div className="flex items-end gap-4 mb-6">
              {producto.discount_price && producto.discount_price < producto.base_price ? (
                <>
                  <p className="text-primary font-black text-4xl">S/. {producto.discount_price.toFixed(2)}</p>
                  <p className="text-gray-400 line-through text-xl mb-1">S/. {producto.base_price.toFixed(2)}</p>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold mb-2 ml-2">OFERTA</span>
                </>
              ) : (
                <p className="text-primary font-black text-4xl">S/. {producto.base_price.toFixed(2)}</p>
              )}
            </div>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {producto.description || "Un producto increíble de nuestra colección."}
            </p>

            {/* BOTONES DE ACCIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <button 
                onClick={handleComprarAhora}
                disabled={isAgotado}
                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${isAgotado ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg active:scale-95'}`}
              >
                <MessageCircle size={24} /> Comprar Ahora (WhatsApp)
              </button>
              <button 
                onClick={handleAgregarCarrito}
                disabled={isAgotado}
                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg border-2 transition-all ${isAgotado ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-primary text-primary hover:bg-primary hover:text-white active:scale-95'}`}
              >
                <ShoppingCart size={24} /> {isAgotado ? 'Agotado' : 'Agregar al carrito'}
              </button>
            </div>

            {/* COSAS QUE DEBES SABER */}
            {producto.features && (
              <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl mt-auto">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info size={20} className="text-orange-500" /> Cosas que tienes que saber
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed space-y-2">
                  {/* Convierte saltos de línea y guiones en listas simples */}
                  {producto.features.split('\n').map((line, i) => (
                    <p key={i} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{line.replace(/^- /, '')}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTOS RELACIONADOS */}
      {relacionados.length > 0 && (
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">También te podría interesar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relacionados.map((rel) => {
              const relImg = rel.product_images?.[0]?.url;
              return (
                <Link href={`/producto/${rel.slug || rel.id}`} key={rel.id} className="glass-effect p-4 rounded-2xl group flex flex-col transition-all hover:shadow-xl hover:-translate-y-2">
                  <div className="bg-white/50 aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {relImg ? <img src={relImg} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <span className="text-gray-400">Sin foto</span>}
                  </div>
                  <h3 className="font-medium text-lg truncate mb-1">{rel.name}</h3>
                  <p className="text-primary font-bold text-xl mt-auto">S/. {rel.base_price.toFixed(2)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
