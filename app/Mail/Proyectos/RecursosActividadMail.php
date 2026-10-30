<?php

namespace App\Mail\Proyectos;

use App\Models\Proyectos\ProyectoActividad;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RecursosActividadMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ProyectoActividad $actividad,
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
            view: 'emails.proyectos.recursos-actividad',
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
