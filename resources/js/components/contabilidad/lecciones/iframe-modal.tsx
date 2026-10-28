import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BookOpen, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Props {
    url: string | null;
    titulo: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function IframeModal({
    url,
    titulo,
    open,
    onOpenChange,
}: Props) {
    const [cargando, setCargando] = useState(true);
    const [srcDoc, setSrcDoc] = useState<string | null>(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (!open || !url) {
            setSrcDoc(null);
            setPdfBlobUrl(null);
            return;
        }

        setCargando(true);
        setKey((prev) => prev + 1);

        const urlLower = url.toLowerCase();

        // Detectar si es un archivo HTML alojado en Supabase Storage
        const esSupabaseHtml =
            url.includes('supabase.co') &&
            (urlLower.endsWith('.html') || urlLower.includes('.html?'));

        // Detectar si es un archivo PDF alojado en Supabase Storage
        const esSupabasePdf =
            url.includes('supabase.co') &&
            (urlLower.endsWith('.pdf') || urlLower.includes('.pdf?'));

        if (esSupabaseHtml) {
            let cancelado = false;
            setPdfBlobUrl(null);

            fetch(url)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status} al cargar lección`);
                    }
                    return res.text();
                })
                .then((rawHtml) => {
                    if (cancelado) return;

                    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
                    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
                    const bridgeScript = `
<base href="${baseUrl}">
<script>
(function() {
  var BASE_URL = "${baseUrl}";
  var CLEAN_BASE = "${cleanBaseUrl}";

  window.globals = window.globals || {};
  window.globals.DATA_PATH_BASE = CLEAN_BASE;

  function fixUrl(u) {
    if (!u || typeof u !== 'string') return u;
    if (u.indexOf(BASE_URL) === 0) return u;

    var m = u.match(/(html5\\/.*|story_content\\/.*|mobile\\/.*|lms\\/.*)/i);
    if (m) {
      return BASE_URL + m[1];
    }
    if (u.indexOf('http://') !== 0 && u.indexOf('https://') !== 0 && u.indexOf('data:') !== 0 && u.indexOf('blob:') !== 0) {
      return BASE_URL + u.replace(/^\\/+/, '');
    }
    return u;
  }

  // Interceptar a nivel de prototipo nativo para que Chrome ejecute los scripts con sus eventos originales
  var scriptProto = HTMLScriptElement.prototype;
  var scriptSrcDesc = Object.getOwnPropertyDescriptor(scriptProto, 'src');
  if (scriptSrcDesc && scriptSrcDesc.set) {
    Object.defineProperty(scriptProto, 'src', {
      get: scriptSrcDesc.get,
      set: function(val) {
        scriptSrcDesc.set.call(this, fixUrl(val));
      },
      configurable: true
    });
  }

  var linkProto = HTMLLinkElement.prototype;
  var linkHrefDesc = Object.getOwnPropertyDescriptor(linkProto, 'href');
  if (linkHrefDesc && linkHrefDesc.set) {
    Object.defineProperty(linkProto, 'href', {
      get: linkHrefDesc.get,
      set: function(val) {
        linkHrefDesc.set.call(this, fixUrl(val));
      },
      configurable: true
    });
  }

  var imgProto = HTMLImageElement.prototype;
  var imgSrcDesc = Object.getOwnPropertyDescriptor(imgProto, 'src');
  if (imgSrcDesc && imgSrcDesc.set) {
    Object.defineProperty(imgProto, 'src', {
      get: imgSrcDesc.get,
      set: function(val) {
        imgSrcDesc.set.call(this, fixUrl(val));
      },
      configurable: true
    });
  }

  var origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, val) {
    if (name && (name.toLowerCase() === 'src' || name.toLowerCase() === 'href')) {
      val = fixUrl(val);
    }
    return origSetAttr.call(this, name, val);
  };

  if (window.XMLHttpRequest) {
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      var args = Array.prototype.slice.call(arguments);
      args[1] = fixUrl(url);
      return origOpen.apply(this, args);
    };
  }

  if (window.fetch) {
    var origFetch = window.fetch;
    window.fetch = function(input, init) {
      if (typeof input === 'string') {
        input = fixUrl(input);
      } else if (input && input.url) {
        input = new Request(fixUrl(input.url), input);
      }
      return origFetch(input, init);
    };
  }
})();
</script>
`;

                    let finalHtml = rawHtml;

                    // Configurar DATA_PATH_BASE dentro del HTML nativo de Storyline
                    finalHtml = finalHtml.replace(
                        /DATA_PATH_BASE:\s*['"][^'"]*['"]/i,
                        `DATA_PATH_BASE: '${cleanBaseUrl}'`
                    );

                    if (finalHtml.includes('<head>')) {
                        finalHtml = finalHtml.replace('<head>', `<head>\n${bridgeScript}`);
                    } else if (/<head\b[^>]*>/i.test(finalHtml)) {
                        finalHtml = finalHtml.replace(/(<head\b[^>]*>)/i, `$1\n${bridgeScript}`);
                    } else {
                        finalHtml = bridgeScript + '\n' + finalHtml;
                    }

                    setSrcDoc(finalHtml);
                    setCargando(false);
                })
                .catch((err) => {
                    console.error('[IframeModal] Error al obtener HTML de Supabase:', err);
                    if (!cancelado) {
                        setSrcDoc(null);
                        setCargando(false);
                    }
                });

            return () => {
                cancelado = true;
            };
        } else if (esSupabasePdf) {
            let cancelado = false;
            let objectUrlActivo: string | null = null;
            setSrcDoc(null);

            fetch(url)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status} al cargar PDF`);
                    }
                    return res.arrayBuffer();
                })
                .then((buffer) => {
                    if (cancelado) return;
                    const blob = new Blob([buffer], { type: 'application/pdf' });
                    objectUrlActivo = URL.createObjectURL(blob);
                    setPdfBlobUrl(objectUrlActivo);
                    setCargando(false);
                })
                .catch((err) => {
                    console.error('[IframeModal] Error al obtener PDF de Supabase:', err);
                    if (!cancelado) {
                        setPdfBlobUrl(null);
                        setCargando(false);
                    }
                });

            return () => {
                cancelado = true;
                if (objectUrlActivo) {
                    URL.revokeObjectURL(objectUrlActivo);
                }
            };
        } else {
            setSrcDoc(null);
            setPdfBlobUrl(null);
        }
    }, [open, url]);

    const recargar = () => {
        setCargando(true);
        setKey((prev) => prev + 1);
    };

    const abrirEnPestana = (e: React.MouseEvent) => {
        if (srcDoc) {
            e.preventDefault();
            const blob = new Blob([srcDoc], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
        } else if (pdfBlobUrl) {
            e.preventDefault();
            window.open(pdfBlobUrl, '_blank');
        }
    };

    if (!url) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl w-[96vw] max-h-[94vh] h-[92vh] flex flex-col p-4 sm:p-6 gap-3">
                <DialogHeader className="flex-row items-center justify-between space-y-0 pb-2 border-b">
                    <div className="flex items-center gap-2.5 truncate pr-6">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                            <BookOpen className="size-4" />
                        </div>
                        <div className="truncate">
                            <DialogTitle className="text-base sm:text-lg font-semibold truncate">
                                {titulo || 'Previsualización de Lección'}
                            </DialogTitle>
                            <DialogDescription className="text-xs truncate max-w-xl">
                                {url}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="size-8 p-0"
                            onClick={recargar}
                            title="Recargar lección"
                        >
                            <RefreshCw className="size-3.5" />
                        </Button>

                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs font-medium"
                        >
                            <a
                                href={url}
                                onClick={
                                    srcDoc || pdfBlobUrl
                                        ? abrirEnPestana
                                        : undefined
                                }
                                target="_blank"
                                rel="noreferrer noopener"
                                title="Abrir en pestaña nueva"
                            >
                                <ExternalLink className="size-3.5" />
                                <span className="hidden sm:inline">Abrir en pestaña nueva</span>
                            </a>
                        </Button>
                    </div>
                </DialogHeader>

                <div className="relative flex-1 w-full overflow-hidden rounded-lg border bg-muted/20">
                    {cargando && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 gap-2">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground font-medium">
                                Cargando presentación de la lección...
                            </p>
                        </div>
                    )}

                    <iframe
                        key={key}
                        srcDoc={srcDoc || undefined}
                        src={srcDoc ? undefined : pdfBlobUrl || url}
                        title={titulo}
                        onLoad={() => setCargando(false)}
                        allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        className="w-full h-full border-0 rounded-lg"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
