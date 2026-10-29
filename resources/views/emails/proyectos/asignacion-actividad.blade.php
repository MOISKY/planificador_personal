<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nueva Actividad Asignada</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Top Accent Bar -->
        <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #d97706, #f59e0b);"></td>
        </tr>

        <!-- Header -->
        <tr>
            <td style="padding: 28px 32px 16px 32px;">
                <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #d97706;">
                    ERP Planificador Personal &bull; Actividades
                </div>
                <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 700; color: #09090b; line-height: 1.3;">
                    Nueva Actividad Asignada
                </h1>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 0 32px 24px 32px; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                <p style="margin-top: 0;">
                    Hola <strong>{{ $persona->Nombre }} {{ $persona->ApellidoPaterno }}</strong>,
                </p>
                <p>
                    Se te ha incorporado al equipo responsable de la siguiente actividad:
                </p>

                <!-- Activity Info Card -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <table width="100%" cellpadding="4" cellspacing="0">
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600; width: 140px;">Actividad:</td>
                            <td style="font-size: 15px; color: #0f172a; font-weight: 700;">{{ $actividad->Nombre }}</td>
                        </tr>
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600;">Proyecto:</td>
                            <td style="font-size: 14px; color: #334155; font-weight: 600;">{{ $proyecto->Nombre }}</td>
                        </tr>
                        @if($actividad->Descripcion)
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Descripción:</td>
                            <td style="font-size: 14px; color: #334155;">{{ $actividad->Descripcion }}</td>
                        </tr>
                        @endif
                        @if($actividad->FechaEntrega)
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600;">Fecha de Entrega:</td>
                            <td style="font-size: 14px; color: #b45309; font-weight: 700;">{{ \Carbon\Carbon::parse($actividad->FechaEntrega)->format('d/m/Y') }}</td>
                        </tr>
                        @endif
                    </table>
                </div>

                <p style="margin-bottom: 24px;">
                    Te recomendamos revisar los recursos adicionales y dar seguimiento al cumplimiento de las metas.
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 30px 0 10px 0;">
                    <a href="{{ config('app.url') }}/proyectos/proyectos/{{ $proyecto->IdProyecto }}/actividades" target="_blank" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                        Ver Actividades del Proyecto
                    </a>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e4e4e7; font-size: 12px; color: #71717a; text-align: center;">
                Este es un mensaje automático generado por el ERP Planificador Personal. Por favor no respondas a este correo.
            </td>
        </tr>
    </table>
</body>
</html>

