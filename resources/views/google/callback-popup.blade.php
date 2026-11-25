<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Autorización de Google Drive</title>
        <style>
            body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f8fafc;
                color: #0f172a;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1.5rem;
            }
            .card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 0.75rem;
                max-width: 420px;
                width: 100%;
                padding: 1.5rem;
                text-align: center;
                box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
            }
            .badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                border-radius: 9999px;
                font-size: 1.5rem;
                margin-bottom: 0.75rem;
            }
            .badge.ok {
                background: #dcfce7;
                color: #15803d;
            }
            .badge.err {
                background: #fee2e2;
                color: #b91c1c;
            }
            h1 {
                font-size: 1.125rem;
                margin: 0 0 0.5rem;
            }
            p {
                font-size: 0.875rem;
                color: #475569;
                margin: 0 0 1.25rem;
                line-height: 1.5;
            }
            .actions {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 0.5rem;
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                font-weight: 500;
                text-decoration: none;
                cursor: pointer;
                border: 1px solid #cbd5e1;
                background: #ffffff;
                color: #0f172a;
            }
            .btn-primary {
                background: #0f172a;
                border-color: #0f172a;
                color: #ffffff;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge {{ $success ? 'ok' : 'err' }}">
                {{ $success ? '✓' : '!' }}
            </div>
            <h1>{{ $success ? 'Google Drive autorizado' : 'No se pudo completar la autorización' }}</h1>
            <p>{{ $message }}</p>
            <div class="actions">
                <button type="button" class="btn btn-primary" onclick="window.close()">
                    Cerrar ventana
                </button>
                <a class="btn" href="{{ $returnUrl }}">
                    Regresar al sistema
                </a>
            </div>
        </div>
        <script>
            (function () {
                const payload = {{ \Illuminate\Support\Js::from([
                    'type' => 'google-drive-auth',
                    'success' => $success,
                    'message' => $message,
                    'timestamp' => now()->timestamp,
                ]) }};

                try {
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage(payload, window.location.origin);
                        window.opener.focus();
                    }
                } catch (e) {}

                try {
                    if ('BroadcastChannel' in window) {
                        const channel = new BroadcastChannel('google-drive-auth');
                        channel.postMessage(payload);
                        channel.close();
                    }
                } catch (e) {}

                try {
                    localStorage.setItem('google_drive_auth_event', JSON.stringify(payload));
                } catch (e) {}

                if (window.opener || payload.success) {
                    window.setTimeout(function () {
                        window.close();
                    }, payload.success ? 250 : 1200);
                }
            })();
        </script>
    </body>
</html>
