<?php

namespace App\Mail\Admin;

use App\Models\Admin\AdminProyectoActividad;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminRecursosActividadMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public AdminProyectoActividad $actividad,
        public string $nombreDestinatario,
        public ?string $mensajePersonalizado,
        public string $archivoBytes,
        public string $archivoNombre,
        public string $mimeType,
        public string $formato = 'xlsx',
        public ?string $asunto = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->asunto ?: ('Recursos de la actividad: '.$this->actividad->Nombre),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-proyectos.recursos-actividad',
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->archivoBytes, $this->archivoNombre)
                ->withMime($this->mimeType),
        ];
    }
}
