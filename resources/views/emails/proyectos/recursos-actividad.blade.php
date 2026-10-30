<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recursos de Actividad</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Top Accent Bar (Azul Celeste / Azul Corporativo) -->
        <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd);"></td>
        </tr>

        <!-- Header -->
        <tr>
            <td style="padding: 28px 32px 16px 32px;">
                <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #2563eb;">
                    ERP Planificador Personal &bull; Proyectos
                </div>
                <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 700; color: #09090b; line-height: 1.3;">
                    Recursos de la Actividad
                </h1>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 0 32px 24px 32px; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                <p style="margin-top: 0;">
                    Hola <strong>{{ $nombreDestinatario }}</strong>,
                </p>
                <p>
                    Te compartimos la lista de recursos y enlaces de apoyo correspondientes a la actividad <strong>"{{ $actividad->Nombre }}"</strong> en formato <strong>.{{ strtoupper($formato) }}</strong>.
                </p>

                @if(!empty($mensajePersonalizado))
                <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 14px 16px; margin: 18px 0; border-radius: 0 6px 6px 0; font-style: italic; color: #334155;">
                    "{{ $mensajePersonalizado }}"
                </div>
                @endif

                <!-- Activity Info Card -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <table width="100%" cellpadding="5" cellspacing="0">
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600; width: 140px;">Actividad:</td>
                            <td style="font-size: 15px; color: #0f172a; font-weight: 700;">{{ $actividad->Nombre }}</td>
                        </tr>
                        @if($actividad->proyecto)
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600;">Proyecto:</td>
                            <td style="font-size: 14px; color: #334155; font-weight: 600;">{{ $actividad->proyecto->Nombre }}</td>
                        </tr>
                        @endif
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600;">Modalidad:</td>
                            <td style="font-size: 14px; color: #334155;">{{ $actividad->Tipo }}</td>
                        </tr>
                        @if($actividad->FechaEntrega)
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600;">Fecha de Entrega:</td>
                            <td style="font-size: 14px; color: #2563eb; font-weight: 600;">{{ \Carbon\Carbon::parse($actividad->FechaEntrega)->format('d/m/Y') }}</td>
                        </tr>
                        @endif
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600;">Archivo Adjunto:</td>
                            <td style="font-size: 14px; color: #059669; font-weight: 700;">📎 {{ $archivoNombre }}</td>
                        </tr>
                    </table>
                </div>

                <p style="margin-bottom: 0; font-size: 14px; color: #64748b;">
                    Encontrarás el archivo descargable adjunto en este mensaje con el formato de tabla y enlaces directos listos para su uso.
                </p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #fafafa; padding: 20px 32px; border-top: 1px solid #f4f4f5; text-align: center; font-size: 13px; color: #71717a;">
                <p style="margin: 0;">
                    Este es un correo automático generado por <strong>ERP Planificador Personal</strong>.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>

