import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, FileText, XCircle, Hash, CreditCard, Clock, CalendarDays, Phone, Mail, User2, ArrowLeft } from 'lucide-react';

export default function ProcesoFacturacion() {
    const [cotizacion, setCotizacion] = useState('');
    const [referencia, setReferencia] = useState('');
    const [noCliente, setNoCliente] = useState('');
    const [busqueda, setBusqueda] = useState('');

    return (
        <div className="min-h-screen bg-[#f4f8fb] font-sans flex flex-col pt-12">
            <Head title="Proceso de Facturación" />
            
            <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 mb-24">
                
                {/* Back button */}
                <div className="mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => window.location.href = '/'}
                        className="text-[#2563eb] hover:bg-blue-50 hover:text-blue-700 font-bold uppercase tracking-wide px-4 -ml-4"
                    >
                        <ArrowLeft className="size-4 mr-2" />
                        Regresar a Inicio
                    </Button>
                </div>

                <div className="space-y-6">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-[2.5rem] font-bold uppercase text-[#1d4ed8] leading-[1.1] tracking-tight">
                            Servicio de Facturación Electrónica
                        </h1>
                    </div>
                    
                    {/* Panel Importante from Original Logic */}
                    <div className="bg-white rounded-[16px] shadow-sm border border-slate-100 p-8">
                        <h2 className="text-xl font-bold uppercase text-slate-800 tracking-wide mb-4 flex items-center gap-2">
                            <div className="bg-blue-50 text-[#2563eb] p-2 rounded-lg">
                                <FileText className="size-5" />
                            </div>
                            Importante
                        </h2>
                        <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                            <p className="text-[#2563eb] font-bold text-lg">Las facturas se realizan en el mes correspondiente a su emisión.</p>
                            <p>
                                La factura podrá obtenerse al <strong className="text-slate-800">día siguiente</strong> de la operación. Se cuenta con todo el mes para facturar, sin embargo, si el pago se efectúa los días viernes después de las 4:00 p.m., la factura deberá generarse el día <strong className="text-slate-800">lunes a partir de las 10:00 a.m.</strong>
                            </p>
                            
                            <div className="bg-blue-50/50 border border-blue-100 rounded-[12px] p-5 mt-4">
                                <p className="font-bold mb-3 flex items-center gap-2 text-slate-800">
                                    <CalendarDays className="text-[#2563eb] size-5" /> 
                                    Horario de atención (lunes a viernes):
                                </p>
                                <ul className="flex flex-col md:flex-row gap-6 text-sm md:text-base">
                                    <li className="flex items-center gap-2">
                                        <Clock className="text-[#2563eb] size-4" /> <strong className="text-slate-800">Lunes a jueves:</strong> 10:00 a.m. a 6:00 p.m.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Clock className="text-[#2563eb] size-4" /> <strong className="text-slate-800">Viernes:</strong> 10:00 a.m. a 4:00 p.m.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <p className="text-lg font-bold text-slate-800 text-center mt-12 mb-4">
                        Seleccione una opción y capture los datos solicitados
                    </p>

                    <Tabs defaultValue="facturar" className="w-full">
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto gap-4 bg-transparent p-0">
                            <TabsTrigger 
                                value="facturar" 
                                className="uppercase font-bold tracking-wide py-4 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-md bg-white text-slate-500 border border-slate-200 rounded-[12px] transition-all hover:bg-slate-50"
                            >
                                <FileText className="size-4 me-2 hidden md:inline-block" />
                                Facturar
                            </TabsTrigger>
                            <TabsTrigger 
                                value="consultar" 
                                className="uppercase font-bold tracking-wide py-4 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-md bg-white text-slate-500 border border-slate-200 rounded-[12px] transition-all hover:bg-slate-50"
                            >
                                <Search className="size-4 me-2 hidden md:inline-block" />
                                Consulta / Reenvía
                            </TabsTrigger>
                            <TabsTrigger 
                                value="cancelacion" 
                                className="uppercase font-bold tracking-wide py-4 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-md bg-white text-slate-500 border border-slate-200 rounded-[12px] transition-all hover:bg-slate-50"
                            >
                                <XCircle className="size-4 me-2 hidden md:inline-block" />
                                Cancelación
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-6 border border-slate-100 bg-white p-6 md:p-10 shadow-sm rounded-[16px]">
                            {/* Tab Facturar */}
                            <TabsContent value="facturar" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold uppercase text-slate-800">Facturar</h2>
                                    
                                    <div className="max-w-2xl mx-auto mt-6 mb-6 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-500 font-bold text-xl leading-none">*</span>
                                            <div className="relative w-full">
                                                <User2 className="absolute right-3 top-3 size-5 text-slate-400 cursor-help" />
                                                <Input 
                                                    id="no-cliente" 
                                                    placeholder="No. Cliente" 
                                                    className="pr-10 border-slate-200 rounded-lg focus-visible:ring-[#2563eb] font-medium py-6"
                                                    value={noCliente}
                                                    onChange={(e) => setNoCliente(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-500 font-medium mt-2">Ingrese los siguientes datos</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-red-500 font-bold text-xl leading-none">*</span>
                                                <div className="relative w-full">
                                                    <Hash className="absolute right-3 top-3 size-5 text-slate-400 cursor-help" />
                                                    <Input 
                                                        id="cotizacion" 
                                                        placeholder="No. Cotización" 
                                                        className="pr-10 border-slate-200 rounded-lg focus-visible:ring-[#2563eb] font-medium py-6"
                                                        value={cotizacion}
                                                        onChange={(e) => setCotizacion(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-red-500 font-bold text-xl leading-none">*</span>
                                                <div className="relative w-full">
                                                    <CreditCard className="absolute right-3 top-3 size-5 text-slate-400 cursor-pointer hover:text-[#2563eb]" title="Ver ejemplo" />
                                                    <Input 
                                                        id="referencia" 
                                                        placeholder="Referencia de pago" 
                                                        className="pr-10 border-slate-200 rounded-lg focus-visible:ring-[#2563eb] font-medium py-6"
                                                        value={referencia}
                                                        onChange={(e) => setReferencia(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="max-w-2xl mx-auto text-left mt-6">
                                        <p className="text-sm font-semibold text-slate-500">
                                            Los campos marcados con: <span className="text-red-500">*</span> son obligatorios.
                                        </p>
                                    </div>

                                    <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
                                        <Button 
                                            variant="outline" 
                                            className="w-full md:w-auto font-bold uppercase rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors px-10 py-6 text-sm tracking-wide"
                                            onClick={() => { setCotizacion(''); setReferencia(''); }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button 
                                            className="w-full md:w-auto font-bold uppercase rounded-full border-none bg-[#2563eb] text-white hover:bg-blue-700 transition-colors px-10 py-6 text-sm tracking-wide shadow-md"
                                            onClick={() => alert('Validando pago... (Endpoint no conectado)')}
                                        >
                                            Continuar
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Tab Consultar */}
                            <TabsContent value="consultar" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold uppercase text-slate-800">Consultar Factura</h2>
                                    <p className="text-slate-500 font-medium mt-2 max-w-lg mx-auto">Para Consultar tu factura es necesario ingresar el Folio de Factura, Folio Fiscal (UUID) y Número de Cotización.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="max-w-2xl mx-auto space-y-4">
                                        <div className="relative">
                                            <Input 
                                                placeholder="Folio de Factura, Folio Fiscal (UUID) o Número de Cotización" 
                                                className="pr-20 border-slate-200 rounded-lg focus-visible:ring-[#2563eb] font-medium py-6"
                                                value={busqueda}
                                                onChange={(e) => setBusqueda(e.target.value)}
                                            />
                                            <div className="absolute right-4 top-3 flex gap-3">
                                                <Search className="size-5 text-slate-400 cursor-pointer hover:text-[#2563eb]" />
                                                <CreditCard className="size-5 text-slate-400 cursor-pointer hover:text-[#2563eb]" title="Ver ejemplo" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
                                        <Button 
                                            variant="outline" 
                                            className="w-full md:w-auto font-bold uppercase rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors px-10 py-6 text-sm tracking-wide"
                                            onClick={() => setBusqueda('')}
                                        >
                                            Limpiar
                                        </Button>
                                        <Button 
                                            className="w-full md:w-auto font-bold uppercase rounded-full border-none bg-[#2563eb] text-white hover:bg-blue-700 transition-colors px-10 py-6 text-sm tracking-wide shadow-md"
                                            onClick={() => alert('Buscando factura... (Endpoint no conectado)')}
                                        >
                                            Continuar
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Tab Cancelacion */}
                            <TabsContent value="cancelacion" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold uppercase text-slate-800">Contacto para cancelación</h2>
                                </div>
                                <div className="max-w-3xl mx-auto">
                                    <div className="p-6 md:p-8 border border-blue-100 bg-blue-50/30 shadow-sm rounded-[16px]">
                                        <div className="flex items-start mb-6 gap-4">
                                            <div className="bg-white p-3 rounded-xl shadow-sm text-[#2563eb]">
                                                <FileText className="size-6" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-800 leading-snug pt-2">
                                                Las facturas se realizan en el mes correspondiente a su emisión.
                                            </p>
                                        </div>
                                        
                                        <hr className="my-6 border-slate-200" />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white p-3 rounded-xl shadow-sm text-[#2563eb]">
                                                        <User2 className="size-6" />
                                                    </div>
                                                    <div>
                                                        <small className="text-slate-500 block uppercase font-bold text-xs tracking-wider">Nombre de contacto</small>
                                                        <span className="font-bold text-lg text-slate-800">Vianey Anastacio Ortega</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white p-3 rounded-xl shadow-sm text-[#2563eb]">
                                                        <Phone className="size-6" />
                                                    </div>
                                                    <div>
                                                        <small className="text-slate-500 block uppercase font-bold text-xs tracking-wider">Celular / WhatsApp</small>
                                                        <a href="tel:+5217227990719" className="font-bold text-lg text-slate-800 hover:text-[#2563eb] transition-colors">+52 1 722 799 0719</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white p-3 rounded-xl shadow-sm text-[#2563eb]">
                                                        <Mail className="size-6" />
                                                    </div>
                                                    <div>
                                                        <small className="text-slate-500 block uppercase font-bold text-xs tracking-wider">Correo electrónico</small>
                                                        <a href="mailto:facturacion@kg-safety.com" className="font-bold text-lg text-slate-800 hover:text-[#2563eb] transition-colors break-all">facturacion@kg-safety.com</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
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
