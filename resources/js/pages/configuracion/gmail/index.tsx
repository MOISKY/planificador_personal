import { confirmDialog } from '@/components/confirm-dialog';
import { ContextPanel } from '@/components/context-panel';
import { DataTable, type Column } from '@/components/data-table';
import { PageContent, PageShell } from '@/components/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type ConfiguracionGmailItem,
    type UsuarioSimpleOption,
} from '@/types/configuracion';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    Plus,
    Save,
    Send,
    Server,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<ConfiguracionGmailItem>;
    usuarios: UsuarioSimpleOption[];
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configuración', href: '/configuracion/usuarios' },
    { title: 'Configuración Gmail', href: '/configuracion/gmail' },
];

export default function ConfiguracionGmailIndex({
    items,
    usuarios,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] =
        useState<ConfiguracionGmailItem | null>(null);
    const [mostrarPasswordForm, setMostrarPasswordForm] = useState(false);

    const form = useForm({
        IdUsuario: usuarios.length > 0 ? String(usuarios[0].IdUsuario) : '',
        MAIL_MAILER: 'smtp',
        MAIL_SCHEME: 'tls',
        MAIL_HOST: 'smtp.gmail.com',
        MAIL_PORT: '587',
        MAIL_USERNAME: '',
        MAIL_PASSWORD: '',
        MAIL_FROM_NAME: '',
        MAIL_FROM_ADDRESS: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                IdUsuario: String(seleccionado.IdUsuario),
                MAIL_MAILER: seleccionado.MAIL_MAILER ?? 'smtp',
                MAIL_SCHEME: seleccionado.MAIL_SCHEME ?? 'tls',
                MAIL_HOST: seleccionado.MAIL_HOST ?? 'smtp.gmail.com',
                MAIL_PORT: seleccionado.MAIL_PORT
                    ? String(seleccionado.MAIL_PORT)
                    : '587',
                MAIL_USERNAME: seleccionado.MAIL_USERNAME ?? '',
                MAIL_PASSWORD: seleccionado.MAIL_PASSWORD ?? '',
                MAIL_FROM_NAME: seleccionado.MAIL_FROM_NAME ?? '',
                MAIL_FROM_ADDRESS: seleccionado.MAIL_FROM_ADDRESS ?? '',
            });
        } else {
            form.reset();
            form.setData({
                IdUsuario: usuarios.length > 0 ? String(usuarios[0].IdUsuario) : '',
                MAIL_MAILER: 'smtp',
                MAIL_SCHEME: 'tls',
                MAIL_HOST: 'smtp.gmail.com',
                MAIL_PORT: '587',
                MAIL_USERNAME: '',
                MAIL_PASSWORD: '',
                MAIL_FROM_NAME: '',
                MAIL_FROM_ADDRESS: '',
            });
        }
        setMostrarPasswordForm(false);
        form.clearErrors();
    }, [seleccionado, drawerAbierto, usuarios]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ConfiguracionGmailItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const eliminar = async (item: ConfiguracionGmailItem) => {
        const usuarioNombre = item.usuario?.SNombre ?? 'Usuario';
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar la configuración de Gmail/SMTP para "${item.MAIL_USERNAME}" (${usuarioNombre})? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(
                `/configuracion/gmail/${item.IdUsuarioConfiguracionGmail}`,
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(
                `/configuracion/gmail/${seleccionado.IdUsuarioConfiguracionGmail}`,
                {
                    preserveScroll: true,
                    onSuccess: () => setDrawerAbierto(false),
                },
            );
        } else {
            form.post('/configuracion/gmail', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<ConfiguracionGmailItem>[] = [
        {
            key: 'usuario',
            label: 'Usuario Asignado',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <User className="size-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-foreground">
                            {item.usuario?.SNombre ?? 'Sin Asignar'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {item.usuario?.NombreUsuario || item.usuario?.SMail || ''}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'MAIL_HOST',
            label: 'Servidor SMTP',
            render: (item) => (
                <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                    <Server className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{item.MAIL_HOST || 'smtp.gmail.com'}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                        :{item.MAIL_PORT || 587}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'MAIL_USERNAME',
            label: 'Cuenta / Usuario',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="size-3.5 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{item.MAIL_USERNAME}</span>
                </div>
            ),
        },
        {
            key: 'MAIL_FROM_NAME',
            label: 'Remitente',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-xs">
                    <Send className="size-3 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground">{item.MAIL_FROM_NAME}</span>
                    <span className="text-muted-foreground truncate max-w-[150px]">
                        &lt;{item.MAIL_FROM_ADDRESS}&gt;
                    </span>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración Gmail - Configuración" />
            <PageShell>
                <ContextPanel
                    icon={<Mail />}
                    title="Configuración de Gmail / SMTP"
                    description="Parámetros de conexión SMTP, cuentas y contraseñas de aplicación para envío de correos electrónicos."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva Configuración
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/configuracion/gmail"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por servidor, cuenta o remitente..."
                        idKey="IdUsuarioConfiguracionGmail"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay configuraciones de correo"
                        emptyDescription="Agrega una nueva cuenta de Gmail o SMTP para habilitar notificaciones y envío de correos."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Mail className="size-5 text-primary" />
                            {seleccionado
                                ? 'Editar Configuración Gmail'
                                : 'Nueva Configuración Gmail'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los parámetros del servidor SMTP o actualiza la contraseña de aplicación.'
                                : 'Configura las credenciales de correo de un usuario para el envío del sistema.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        id="gmail-form"
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 px-6 py-4"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdUsuario" required>
                                    Usuario Asignado
                                </FieldLabel>
                                <Select
                                    value={String(form.data.IdUsuario)}
                                    onValueChange={(val) => form.setData('IdUsuario', val)}
                                >
                                    <SelectTrigger id="IdUsuario">
                                        <SelectValue placeholder="Selecciona un usuario" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {usuarios.map((u) => (
                                            <SelectItem
                                                key={u.IdUsuario}
                                                value={String(u.IdUsuario)}
                                            >
                                                {u.SNombre} ({u.NombreUsuario || u.SMail})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.IdUsuario}</FieldError>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field>
                                    <FieldLabel htmlFor="MAIL_HOST" required>
                                        Servidor Host
                                    </FieldLabel>
                                    <Input
                                        id="MAIL_HOST"
                                        value={form.data.MAIL_HOST}
                                        onChange={(e) =>
                                            form.setData('MAIL_HOST', e.target.value)
                                        }
                                        placeholder="smtp.gmail.com"
                                        required
                                    />
                                    <FieldError>{form.errors.MAIL_HOST}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="MAIL_PORT" required>
                                        Puerto
                                    </FieldLabel>
                                    <Input
                                        id="MAIL_PORT"
                                        type="number"
                                        value={form.data.MAIL_PORT}
                                        onChange={(e) =>
                                            form.setData('MAIL_PORT', e.target.value)
                                        }
                                        placeholder="587"
                                        required
                                    />
                                    <FieldError>{form.errors.MAIL_PORT}</FieldError>
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Field>
                                    <FieldLabel htmlFor="MAIL_SCHEME">
                                        Esquema / Cifrado
                                    </FieldLabel>
                                    <Input
                                        id="MAIL_SCHEME"
                                        value={form.data.MAIL_SCHEME}
                                        onChange={(e) =>
                                            form.setData('MAIL_SCHEME', e.target.value)
                                        }
                                        placeholder="tls o ssl"
                                    />
                                    <FieldError>{form.errors.MAIL_SCHEME}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="MAIL_MAILER">
                                        Mailer
                                    </FieldLabel>
                                    <Input
                                        id="MAIL_MAILER"
                                        value={form.data.MAIL_MAILER}
                                        onChange={(e) =>
                                            form.setData('MAIL_MAILER', e.target.value)
                                        }
                                        placeholder="smtp"
                                    />
                                    <FieldError>{form.errors.MAIL_MAILER}</FieldError>
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="MAIL_USERNAME" required>
                                    Cuenta / Correo de Conexión
                                </FieldLabel>
                                <Input
                                    id="MAIL_USERNAME"
                                    value={form.data.MAIL_USERNAME}
                                    onChange={(e) =>
                                        form.setData('MAIL_USERNAME', e.target.value)
                                    }
                                    placeholder="notificaciones@gmail.com"
                                    required
                                />
                                <FieldError>{form.errors.MAIL_USERNAME}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel
                                    htmlFor="MAIL_PASSWORD"
                                    required={!seleccionado}
                                >
                                    Contraseña / App Password
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="MAIL_PASSWORD"
                                        type={mostrarPasswordForm ? 'text' : 'password'}
                                        value={form.data.MAIL_PASSWORD}
                                        onChange={(e) =>
                                            form.setData('MAIL_PASSWORD', e.target.value)
                                        }
                                        placeholder="••••••••••••••••"
                                        required={!seleccionado}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                                        onClick={() =>
                                            setMostrarPasswordForm(!mostrarPasswordForm)
                                        }
                                        title={
                                            mostrarPasswordForm
                                                ? 'Ocultar contraseña'
                                                : 'Ver contraseña'
                                        }
                                    >
                                        {mostrarPasswordForm ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                    <Lock className="size-3 shrink-0" />
                                    <span>
                                        {seleccionado
                                            ? 'Haz clic en el icono del ojo para ver la contraseña actual o escribe una nueva para cambiarla.'
                                            : 'Para Gmail, se recomienda generar una Contraseña de Aplicación de 16 caracteres.'}
                                    </span>
                                </div>
                                <FieldError>{form.errors.MAIL_PASSWORD}</FieldError>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field>
                                    <FieldLabel htmlFor="MAIL_FROM_NAME" required>
                                        Nombre Remitente
                                    </FieldLabel>
                                    <Input
                                        id="MAIL_FROM_NAME"
                                        value={form.data.MAIL_FROM_NAME}
                                        onChange={(e) =>
                                            form.setData('MAIL_FROM_NAME', e.target.value)
                                        }
                                        placeholder="ERP Notificaciones"
                                        required
                                    />
                                    <FieldError>{form.errors.MAIL_FROM_NAME}</FieldError>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="MAIL_FROM_ADDRESS" required>
                                        Correo Remitente
                                    </FieldLabel>
                                    <Input
                                        id="MAIL_FROM_ADDRESS"
                                        type="email"
                                        value={form.data.MAIL_FROM_ADDRESS}
                                        onChange={(e) =>
                                            form.setData('MAIL_FROM_ADDRESS', e.target.value)
                                        }
                                        placeholder="no-reply@empresa.com"
                                        required
                                    />
                                    <FieldError>{form.errors.MAIL_FROM_ADDRESS}</FieldError>
                                </Field>
                            </div>
                        </FieldGroup>
                    </form>

                    <Separator className="my-2" />

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDrawerAbierto(false)}
                                disabled={form.processing}
                            >
                                <X className="mr-1.5 size-4" />
                                Cancelar
                            </Button>
                        </SheetClose>
                        <Button
                            type="submit"
                            form="gmail-form"
                            disabled={form.processing}
                        >
                            {form.processing ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4" />
                            )}
                            {seleccionado ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

