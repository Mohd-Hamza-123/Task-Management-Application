import Link from "next/link";

export default function SidebarItem({
    icon,
    label,
    active = false,
    href,
}: {
    icon: React.ReactNode;
    href: string;
    label: string;
    active?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
