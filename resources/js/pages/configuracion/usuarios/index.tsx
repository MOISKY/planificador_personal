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
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type UsuarioConfigItem } from '@/types/configuracion';
import { type PaginatedData } from '@/types/pagination';
import { Head, useForm } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    Phone,
    Plus,
    Save,
    User,
    UserCog,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<UsuarioConfigItem>;
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configuración', href: '/configuracion/usuarios' },
    { title: 'Usuarios', href: '/configuracion/usuarios' },
];

export default function UsuariosIndex({ items, searchValue }: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<UsuarioConfigItem | null>(null);
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const form = useForm({
        NombreUsuario: '',
        SNombre: '',
        SMail: '',
        STelefono: '',
        password: '',
        EActivo: 'Si',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                NombreUsuario: seleccionado.NombreUsuario ?? seleccionado.SIdUsuario ?? '',
                SNombre: seleccionado.SNombre ?? '',
                SMail: seleccionado.SMail ?? '',
                STelefono: seleccionado.STelefono ?? '',
                password: seleccionado.password_plano ?? '',
                EActivo: seleccionado.EActivo ?? 'Si',
            });
        } else {
            form.reset();
            form.setData({
                NombreUsuario: '',
                SNombre: '',
                SMail: '',
                STelefono: '',
                password: '',
                EActivo: 'Si',
            });
        }
        setMostrarPassword(false);
        form.clearErrors();
    }, [seleccionado, drawerAbierto]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: UsuarioConfigItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (seleccionado) {
            form.put(`/configuracion/usuarios/${seleccionado.IdUsuario}`, {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        } else {
            form.post('/configuracion/usuarios', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const columns: Column<UsuarioConfigItem>[] = [
        {
            key: 'NombreUsuario',
            label: 'Usuario',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <User className="size-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-foreground">
                            {item.NombreUsuario || item.SIdUsuario}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'SNombre',
            label: 'Nombre Completo',
            render: (item) => (
                <span className="font-medium text-foreground">{item.SNombre}</span>
            ),
        },
        {
            key: 'SMail',
            label: 'Correo Electrónico',
            render: (item) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="size-3.5" />
                    <span className="text-xs">{item.SMail}</span>
                </div>
            ),
        },
        {
            key: 'STelefono',
            label: 'Teléfono',
            render: (item) =>
                item.STelefono ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="size-3.5" />
                        <span className="text-xs">{item.STelefono}</span>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            key: 'EActivo',
            label: 'Estatus',
            className: 'w-28 text-center',
            render: (item) => (
                <Badge
                    variant={item.EActivo === 'Si' ? 'default' : 'secondary'}
                    className={
                        item.EActivo === 'Si'
                            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                    }
                >
                    {item.EActivo === 'Si' ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catálogo de Usuarios - Configuración" />
            <PageShell>
                <ContextPanel
                    icon={<UserCog />}
                    title="Catálogo de Usuarios"
                    description="Administración de cuentas de usuarios, accesos y contraseñas del sistema."
                    actions={
                        <Button size="sm" onClick={abrirNuevo}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo Usuario
                        </Button>
                    }
                />

                <PageContent>
                    <DataTable
                        data={items.data}
                        columns={columns}
                        pagination={items}
                        baseUrl="/configuracion/usuarios"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por usuario, nombre, correo o teléfono..."
                        idKey="IdUsuario"
                        onEdit={abrirEditar}
                        emptyTitle="No hay usuarios registrados"
                        emptyDescription="Agrega un nuevo usuario para otorgarle credenciales de acceso al sistema."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <UserCog className="size-5 text-primary" />
                            {seleccionado ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica los datos del usuario y consulta o actualiza su contraseña de acceso.'
                                : 'Ingresa la información requerida para registrar un nuevo usuario.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form id="usuario-form" onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="NombreUsuario" required>
                                    Nombre de Usuario
                                </FieldLabel>
                                <Input
                                    id="NombreUsuario"
                                    value={form.data.NombreUsuario}
                                    onChange={(e) => form.setData('NombreUsuario', e.target.value)}
                                    placeholder="Ej. jrodriguez"
                                    required
                                    autoFocus
                                />
                                <FieldError>{form.errors.NombreUsuario}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="SNombre" required>
                                    Nombre Completo
                                </FieldLabel>
                                <Input
                                    id="SNombre"
                                    value={form.data.SNombre}
                                    onChange={(e) => form.setData('SNombre', e.target.value)}
                                    placeholder="Ej. Juan Rodríguez Pérez"
                                    required
                                />
                                <FieldError>{form.errors.SNombre}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="SMail" required>
                                    Correo Electrónico
                                </FieldLabel>
                                <Input
                                    id="SMail"
                                    type="email"
                                    value={form.data.SMail}
                                    onChange={(e) => form.setData('SMail', e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                                <FieldError>{form.errors.SMail}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="STelefono">
                                    Teléfono
                                </FieldLabel>
                                <Input
                                    id="STelefono"
                                    value={form.data.STelefono}
                                    onChange={(e) => form.setData('STelefono', e.target.value)}
                                    placeholder="Ej. 5512345678"
                                />
                                <FieldError>{form.errors.STelefono}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password" required={!seleccionado}>
                                    Contraseña
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={mostrarPassword ? 'text' : 'password'}
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        placeholder={seleccionado ? 'Ingresa o edita la contraseña' : '••••••••'}
                                        required={!seleccionado}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                                        onClick={() => setMostrarPassword(!mostrarPassword)}
                                        title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    >
                                        {mostrarPassword ? (
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
                                            ? 'Haz clic en el icono del ojo para ver la contraseña actual o modificarla.'
                                            : 'Define una contraseña segura (mínimo 4 caracteres).'}
                                    </span>
                                </div>
                                <FieldError>{form.errors.password}</FieldError>
                            </Field>

                            <Field>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <FieldLabel htmlFor="EActivo" className="text-sm font-medium cursor-pointer">
                                            Usuario Activo
                                        </FieldLabel>
                                        <p className="text-xs text-muted-foreground">
                                            {form.data.EActivo === 'Si'
                                                ? 'Permitir inicio de sesión en el sistema'
                                                : 'Acceso bloqueado'}
                                        </p>
                                    </div>
                                    <Switch
                                        id="EActivo"
                                        checked={form.data.EActivo === 'Si'}
                                        onCheckedChange={(checked) =>
                                            form.setData('EActivo', checked ? 'Si' : 'No')
                                        }
                                    />
                                </div>
                                <FieldError>{form.errors.EActivo}</FieldError>
                            </Field>
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
                            form="usuario-form"
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

