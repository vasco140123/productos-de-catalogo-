"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function CarritoPage() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    
    // Aquí pon tu número de WhatsApp real
    const numeroWhatsApp = "51926569490"; 
    
    let mensaje = `👋 Hola, quiero hacer el siguiente pedido de Belleza en Oferta:\n\n`;
    items.forEach(item => {
      mensaje += `- ${item.quantity}x ${item.name} (S/. ${item.price})\n`;
    });
    
    mensaje += `\n💰 *Total: S/. ${total.toFixed(2)}*\n\n`;
    mensaje += `👤 Mis datos:\nNombre: ${nombre || "No especificado"}\nDirección: ${direccion || "No especificada"}`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    // Aquí en la Fase 4 agregaremos el guardado en base de datos.
    // Por ahora redirigimos a WhatsApp
    window.open(url, '_blank');
    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="font-serif text-4xl mb-6">Tu Carrito</h1>
        <p className="text-secondary-text mb-8">Tu carrito está vacío.</p>
        <Link href="/catalogo" className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-hover transition-colors">
          Ir de compras
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h1 className="font-serif text-3xl font-bold mb-8">Tu Carrito</h1>
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center text-xs text-secondary-text">
                  Foto
                </div>
                <div>
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  <p className="text-secondary-text">Cant: {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-primary">S/. {(item.price * item.quantity).toFixed(2)}</p>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h2 className="font-serif text-2xl font-bold mb-6">Resumen del Pedido</h2>
        <div className="flex justify-between mb-4 text-lg">
          <span>Subtotal</span>
          <span className="font-bold">S/. {total.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-100 pt-4 mb-6">
          <div className="flex justify-between text-xl font-bold text-primary">
            <span>Total</span>
            <span>S/. {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Tu Nombre</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-primary"
              placeholder="Ej. María Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dirección de Envío</label>
            <input 
              type="text" 
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-primary"
              placeholder="Av. Principal 123"
            />
          </div>
        </div>

        <button 
          onClick={handleWhatsAppCheckout}
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors"
        >
          Pedir por WhatsApp <ArrowRight size={20} />
        </button>
        <p className="text-xs text-center text-gray-400 mt-4">
          Serás redirigido a WhatsApp para confirmar tu pedido con nosotros.
        </p>
      </div>
    </div>
  );
}
