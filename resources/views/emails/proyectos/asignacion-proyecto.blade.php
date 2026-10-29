<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Asignación a Proyecto</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Top Accent Bar -->
        <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #2563eb, #3b82f6);"></td>
        </tr>

        <!-- Header -->
        <tr>
            <td style="padding: 28px 32px 16px 32px;">
                <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #2563eb;">
                    ERP Planificador Personal
                </div>
                <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 700; color: #09090b; line-height: 1.3;">
                    Asignación a Nuevo Proyecto
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
                    Te informamos que has sido asignado como colaborador en el siguiente proyecto:
                </p>

                <!-- Project Info Card -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <table width="100%" cellpadding="4" cellspacing="0">
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600; width: 130px;">Proyecto:</td>
                            <td style="font-size: 15px; color: #0f172a; font-weight: 700;">{{ $proyecto->Nombre }}</td>
                        </tr>
                        @if($proyecto->Descripcion)
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Descripción:</td>
                            <td style="font-size: 14px; color: #334155;">{{ $proyecto->Descripcion }}</td>
                        </tr>
                        @endif
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600;">Rol Asignado:</td>
                            <td style="font-size: 14px; color: #2563eb; font-weight: 600;">{{ $rol->Nombre }}</td>
                        </tr>
                        @if($proyecto->FechaInicio)
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600;">Fecha Inicio:</td>
                            <td style="font-size: 14px; color: #334155;">{{ \Carbon\Carbon::parse($proyecto->FechaInicio)->format('d/m/Y') }}</td>
                        </tr>
                        @endif
                        @if($proyecto->FechaFinal)
                        <tr>
                            <td style="font-size: 13px; color: #64748b; font-weight: 600;">Fecha Límite:</td>
                            <td style="font-size: 14px; color: #334155;">{{ \Carbon\Carbon::parse($proyecto->FechaFinal)->format('d/m/Y') }}</td>
                        </tr>
                        @endif
                    </table>
                </div>

                <p style="margin-bottom: 24px;">
                    Puedes ingresar a la plataforma para consultar los detalles de tus actividades y recursos asociados.
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 30px 0 10px 0;">
                    <a href="{{ config('app.url') }}/proyectos/proyectos" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                        Ver Proyecto en la Plataforma
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

