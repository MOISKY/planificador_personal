import AppLogoIcon from '@/components/app-logo-icon';
import { LoginForm } from '@/components/auth/login-form';
import { Head } from '@inertiajs/react';

export default function LoginPage() {
    return (
        <>
            <Head title="Iniciar sesión" />
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <span className="flex items-center gap-2 font-medium">
                            <AppLogoIcon className="size-8" />
                            PLANIFICADOR PERSONAL
                        </span>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            <LoginForm />
                        </div>
                    </div>
                </div>
                <div className="relative hidden bg-muted lg:block">
                    <img
                        src="/images/login-cover.webp"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-[10%_center]"
                    />
                </div>
            </div>
        </>
    );
}
