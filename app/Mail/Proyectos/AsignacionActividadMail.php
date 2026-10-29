<?php

namespace App\Mail\Proyectos;

use App\Models\Proyectos\Persona;
use App\Models\Proyectos\Proyecto;
use App\Models\Proyectos\ProyectoActividad;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AsignacionActividadMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Persona $persona,
        public ProyectoActividad $actividad,
        public Proyecto $proyecto,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nueva asignación de actividad: '.$this->actividad->Nombre,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.proyectos.asignacion-actividad',
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
