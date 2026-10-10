import InputError from '@/components/noil/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { store as login } from '@/routes/login';
import { Form } from '@inertiajs/react';

export function LoginForm({ className }: { className?: string }) {
    return (
        <Form
            {...login.form()}
            resetOnSuccess={['password']}
            className={cn('flex flex-col gap-6', className)}
        >
            {({ processing, errors }) => (
                <FieldGroup>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Iniciar sesión
                        </h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            Ingresa tu correo y contraseña para acceder
                        </p>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="email" required>
                            Correo electrónico
                        </FieldLabel>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            autoComplete="email"
                            autoFocus
                            required
                            disabled={processing}
                            aria-invalid={!!errors.email}
                        />
                        <InputError message={errors.email} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password" required>
                            Contraseña
                        </FieldLabel>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Contraseña"
                            autoComplete="current-password"
                            required
                            disabled={processing}
                            aria-invalid={!!errors.password}
                        />
                        <InputError message={errors.password} />
                    </Field>
                    {errors.credentials && (
                        <div
                            role="alert"
                            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        >
                            {errors.credentials}
                        </div>
                    )}
                    <Field>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Iniciar sesión
                        </Button>
                    </Field>
                </FieldGroup>
            )}
        </Form>
    );
}
