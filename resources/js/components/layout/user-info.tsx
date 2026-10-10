import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const displayUser = user || { name: 'Invitado', email: '', avatar: '' };

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={displayUser.avatar ?? undefined} alt={displayUser.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-foreground">
                    {getInitials(displayUser.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayUser.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {displayUser.email}
                    </span>
                )}
            </div>
        </>
    );
}
