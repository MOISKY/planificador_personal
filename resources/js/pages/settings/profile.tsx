import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Perfil',
        href: edit().url,
    },
];

export default function Profile() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Datos del perfil"
                        description="Actualiza tu nombre y correo electrónico"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="name" required>
                                        Nombre
                                    </FieldLabel>
                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nombre completo"
                                        disabled={processing}
                                        aria-invalid={!!errors.name}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="email" required>
                                        Correo electrónico
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email ?? ''}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="correo@ejemplo.com"
                                        disabled={processing}
                                        aria-invalid={!!errors.email}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </Field>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Guardar
                                    </Button>

                                    {recentlySuccessful && (
                                        <p className="text-sm text-muted-foreground">
                                            Guardado
                                        </p>
                                    )}
                                </div>
                            </FieldGroup>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
