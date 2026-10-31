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
    type ConfiguracionGithubItem,
    type UsuarioSimpleOption,
} from '@/types/configuracion';
import { type PaginatedData } from '@/types/pagination';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Check,
    Copy,
    Eye,
    EyeOff,
    FolderGit2,
    KeyRound,
    Loader2,
    Plus,
    Save,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    items: PaginatedData<ConfiguracionGithubItem>;
    usuarios: UsuarioSimpleOption[];
    searchValue: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configuración', href: '/configuracion/usuarios' },
    { title: 'Configuración GitHub', href: '/configuracion/github' },
];

export default function ConfiguracionGithubIndex({
    items,
    usuarios,
    searchValue,
}: Props) {
    const [drawerAbierto, setDrawerAbierto] = useState(false);
    const [seleccionado, setSeleccionado] =
        useState<ConfiguracionGithubItem | null>(null);
    const [mostrarTokenForm, setMostrarTokenForm] = useState(false);
    const [revelados, setRevelados] = useState<Record<number, boolean>>({});
    const [copiadoId, setCopiadoId] = useState<number | null>(null);

    const form = useForm({
        IdUsuario: usuarios.length > 0 ? String(usuarios[0].IdUsuario) : '',
        GITHUB_USERNAME: '',
        GITHUB_TOKEN: '',
    });

    useEffect(() => {
        if (seleccionado) {
            form.setData({
                IdUsuario: String(seleccionado.IdUsuario),
                GITHUB_USERNAME: seleccionado.GITHUB_USERNAME ?? '',
                GITHUB_TOKEN: seleccionado.GITHUB_TOKEN ?? '',
            });
        } else {
            form.reset();
            form.setData({
                IdUsuario: usuarios.length > 0 ? String(usuarios[0].IdUsuario) : '',
                GITHUB_USERNAME: '',
                GITHUB_TOKEN: '',
            });
        }
        setMostrarTokenForm(false);
        form.clearErrors();
    }, [seleccionado, drawerAbierto, usuarios]);

    const abrirNuevo = () => {
        setSeleccionado(null);
        setDrawerAbierto(true);
    };

    const abrirEditar = (item: ConfiguracionGithubItem) => {
        setSeleccionado(item);
        setDrawerAbierto(true);
    };

    const toggleRevelar = (id: number) => {
        setRevelados((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const copiarToken = (item: ConfiguracionGithubItem) => {
        if (item.GITHUB_TOKEN) {
            navigator.clipboard.writeText(item.GITHUB_TOKEN);
            setCopiadoId(item.IdUsuarioConfiguracionGithub);
            setTimeout(() => setCopiadoId(null), 2000);
        }
    };

    const eliminar = async (item: ConfiguracionGithubItem) => {
        const usuarioNombre = item.usuario?.SNombre ?? 'Usuario';
        if (
            await confirmDialog(
                `¿Estás seguro que deseas eliminar la configuración de GitHub para "${item.GITHUB_USERNAME}" (${usuarioNombre})? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(
                `/configuracion/github/${item.IdUsuarioConfiguracionGithub}`,
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
                `/configuracion/github/${seleccionado.IdUsuarioConfiguracionGithub}`,
                {
                    preserveScroll: true,
                    onSuccess: () => setDrawerAbierto(false),
                },
            );
        } else {
            form.post('/configuracion/github', {
                preserveScroll: true,
                onSuccess: () => setDrawerAbierto(false),
            });
        }
    };

    const enmascararToken = (token?: string, revelado: boolean = false) => {
        if (!token) return '—';
        if (revelado) return token;
        if (token.startsWith('ghp_')) {
            return `ghp_••••••••••••${token.slice(-4)}`;
        }
        return '••••••••••••••••';
    };

    const columns: Column<ConfiguracionGithubItem>[] = [
        {
            key: 'usuario',
            label: 'Usuario del Sistema',
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
            key: 'GITHUB_USERNAME',
            label: 'Usuario GitHub',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 font-mono text-xs">
                        <FolderGit2 className="size-3 text-muted-foreground" />
                        {item.GITHUB_USERNAME}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'GITHUB_TOKEN',
            label: 'Token de Acceso',
            render: (item) => {
                const revelado = !!revelados[item.IdUsuarioConfiguracionGithub];
                const copiado = copiadoId === item.IdUsuarioConfiguracionGithub;
                return (
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                        <KeyRound className="size-3.5 shrink-0 text-amber-500" />
                        <span className="truncate max-w-[200px]">
                            {enmascararToken(item.GITHUB_TOKEN, revelado)}
                        </span>
                        {item.GITHUB_TOKEN && (
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                        toggleRevelar(item.IdUsuarioConfiguracionGithub)
                                    }
                                    title={revelado ? 'Ocultar token' : 'Revelar token'}
                                >
                                    {revelado ? (
                                        <EyeOff className="size-3.5" />
                                    ) : (
                                        <Eye className="size-3.5" />
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 text-muted-foreground hover:text-foreground"
                                    onClick={() => copiarToken(item)}
                                    title="Copiar token"
                                >
                                    {copiado ? (
                                        <Check className="size-3.5 text-emerald-500" />
                                    ) : (
                                        <Copy className="size-3.5" />
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración GitHub - Configuración" />
            <PageShell>
                <ContextPanel
                    icon={<FolderGit2 />}
                    title="Configuración de GitHub"
                    description="Gestión de cuentas y tokens de acceso personal (PAT) de GitHub asociados a usuarios."
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
                        baseUrl="/configuracion/github"
                        searchValue={searchValue}
                        searchPlaceholder="Buscar por usuario o cuenta de GitHub..."
                        idKey="IdUsuarioConfiguracionGithub"
                        onEdit={abrirEditar}
                        onDelete={eliminar}
                        emptyTitle="No hay configuraciones de GitHub"
                        emptyDescription="Agrega una nueva cuenta de GitHub con su token para sincronizar repositorios y commits."
                    />
                </PageContent>
            </PageShell>

            <Sheet open={drawerAbierto} onOpenChange={setDrawerAbierto}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <FolderGit2 className="size-5 text-primary" />
                            {seleccionado
                                ? 'Editar Configuración GitHub'
                                : 'Nueva Configuración GitHub'}
                        </SheetTitle>
                        <SheetDescription>
                            {seleccionado
                                ? 'Modifica el usuario de GitHub o actualiza su token de acceso personal.'
                                : 'Vincula un usuario del sistema con su cuenta y token de GitHub.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        id="github-form"
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 px-6 py-4"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="IdUsuario" required>
                                    Usuario del Sistema
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

                            <Field>
                                <FieldLabel htmlFor="GITHUB_USERNAME" required>
                                    Usuario de GitHub
                                </FieldLabel>
                                <Input
                                    id="GITHUB_USERNAME"
                                    value={form.data.GITHUB_USERNAME}
                                    onChange={(e) =>
                                        form.setData('GITHUB_USERNAME', e.target.value)
                                    }
                                    placeholder="Ej. torvalds o mi-usuario-org"
                                    required
                                    autoFocus
                                />
                                <FieldError>{form.errors.GITHUB_USERNAME}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel
                                    htmlFor="GITHUB_TOKEN"
                                    required={!seleccionado}
                                >
                                    Personal Access Token (PAT)
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="GITHUB_TOKEN"
                                        type={mostrarTokenForm ? 'text' : 'password'}
                                        value={form.data.GITHUB_TOKEN}
                                        onChange={(e) =>
                                            form.setData('GITHUB_TOKEN', e.target.value)
                                        }
                                        placeholder="ghp_••••••••••••••••••••••••••••••••••••"
                                        required={!seleccionado}
                                        className="pr-10 font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                                        onClick={() =>
                                            setMostrarTokenForm(!mostrarTokenForm)
                                        }
                                        title={
                                            mostrarTokenForm
                                                ? 'Ocultar token'
                                                : 'Ver token'
                                        }
                                    >
                                        {mostrarTokenForm ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {seleccionado
                                        ? 'Haz clic en el icono del ojo para visualizar el token almacenado o ingresa uno nuevo para reemplazarlo.'
                                        : 'Token de acceso personal de GitHub con permisos de lectura de repositorios.'}
                                </p>
                                <FieldError>{form.errors.GITHUB_TOKEN}</FieldError>
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
                            form="github-form"
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

