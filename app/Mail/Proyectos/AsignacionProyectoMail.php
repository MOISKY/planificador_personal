<?php

namespace App\Mail\Proyectos;

use App\Models\Proyectos\Persona;
use App\Models\Proyectos\Proyecto;
use App\Models\Proyectos\Rol;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AsignacionProyectoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Persona $persona,
        public Proyecto $proyecto,
        public Rol $rol,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Has sido asignado al proyecto: '.$this->proyecto->Nombre,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.proyectos.asignacion-proyecto',
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
