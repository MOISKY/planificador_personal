import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FileText, CalendarCheck, FileOutput, Phone, Mail } from 'lucide-react';

export default function FacturarHome() {
    return (
        <div className="min-h-screen bg-[#f4f8fb] font-sans flex flex-col items-center justify-center pt-12">
            <Head title="Facturación Electrónica" />
            
            <main className="w-full max-w-[1200px] space-y-6 px-4 mb-24 flex-1">
                
                {/* Hero Card */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-8 md:p-10 flex flex-col md:flex-row items-stretch gap-8 md:gap-10">
                    {/* Text Side */}
                    <div className="w-full md:w-[40%] flex flex-col items-start text-left justify-center">
                        <h1 className="text-3xl md:text-[2.5rem] font-bold uppercase text-[#1d4ed8] leading-[1.1] tracking-tight">
                            Bienvenido al Servicio<br/>
                            De Facturación<br/>
                            Electrónica
                        </h1>
                        <p className="text-slate-500 text-[1.1rem] mt-6 font-medium leading-relaxed max-w-md">
                            En el cual podrás consultar las facturas de las cotizaciones que hayas realizado de cualquiera de nuestros servicios.
                        </p>
                        
                        <div className="mt-10">
                            <p className="text-slate-800 font-bold text-sm mb-3 uppercase tracking-wide">
                                Tengo una cotización
                            </p>
                            <Button 
                                onClick={() => window.location.href = '/facturar/proceso'}
                                className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold uppercase rounded-full px-8 py-6 transition-colors shadow-md text-sm tracking-wide"
                            >
                                Obtener Factura
                            </Button>
                        </div>
                    </div>
                    
                    {/* Image Side */}
                    <div className="w-full md:w-[60%]">
                        <img 
                            src="/images/facturacion.webp" 
                            alt="Servicio de Facturación" 
                            className="w-full h-full min-h-[350px] md:min-h-[420px] object-cover object-left rounded-[16px] shadow-sm"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop';
                            }}
                        />
                    </div>
                </div>


            </main>

            {/* Footer Section */}
            <footer className="w-full bg-white border-t border-slate-200 py-6 mt-auto">
                <div className="max-w-[1000px] mx-auto px-4 text-center text-slate-700 text-sm font-medium">
                    Copyright &copy; 2026 <span className="text-[#2563eb] font-bold">DSAIX</span>. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}
