import HeadingSmall from '@/components/noil/heading-small';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FONT_SIZES, useFontSize, type FontSize } from '@/hooks/use-font-size';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { apariencia } from '@/routes/settings';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Apariencia', href: apariencia().url },
];

export default function Apariencia() {
    const { fontSize, setFontSize } = useFontSize();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Apariencia" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Tamaño de texto"
                        description="Escala toda la interfaz. Se guarda en este navegador."
                    />
                    <RadioGroup
                        value={fontSize}
                        onValueChange={(v) => setFontSize(v as FontSize)}
                        className="grid gap-3 sm:grid-cols-2"
                    >
                        {FONT_SIZES.map((f) => (
                            <Label
                                key={f.value}
                                htmlFor={`font-${f.value}`}
                                className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
                            >
                                <RadioGroupItem
                                    id={`font-${f.value}`}
                                    value={f.value}
                                />
                                <span
                                    className="font-bold"
                                    style={{ fontSize: f.escala }}
                                >
                                    Aa
                                </span>
                                <span className="text-sm">{f.label}</span>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
