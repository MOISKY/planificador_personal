import { createInertiaApp, router } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Planificador Personal';

router.on('finish', (event) => {
    const visit = event.detail.visit;
    if (visit.method !== 'get' && !visit.cancelled && !visit.interrupted) {
        router.flushAll();
    }
});

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#2463EB',
    },
});
