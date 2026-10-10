import { toUrl } from '@/lib/utils';
import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

interface UrlActiveOptions {
    /**
     * Replica la regla de activación del aside original de sspa_web2022:
     * `Request::is('ruta*')`. True si la URL actual es exactamente la ruta o
     * empieza con ella (módulos/submenús se activan con cualquier descendiente).
     */
    wildcard?: boolean;
}

export function useActiveUrl() {
    const page = usePage();
    const currentUrlPath = new URL(page.url, window?.location.origin).pathname;

    function urlIsActive(
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
        options?: UrlActiveOptions,
    ) {
        const target = toUrl(urlToCheck);
        const normalized = target.startsWith('/') ? target : `/${target}`;
        const current = currentUrl ?? currentUrlPath;

        if (options?.wildcard) {
            return current === normalized || current.startsWith(normalized);
        }

        return current === normalized;
    }

    return {
        currentUrl: currentUrlPath,
        urlIsActive,
    };
}
