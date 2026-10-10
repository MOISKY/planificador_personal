export default function AppLogo({ className }: { className?: string }) {
    return (
        <>
            <div
                className={`flex aspect-square ${className ?? 'size-9'} shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20 group-data-[collapsible=icon]:size-10`}
            >
                <img src="/logo_n_blanco.svg" alt="Noil" className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="mb-0.5 truncate leading-tight font-bold">
                    Software NOIL
                </span>
            </div>
        </>
    );
}
