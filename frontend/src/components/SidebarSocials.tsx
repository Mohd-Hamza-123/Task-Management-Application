import { Globe } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaInstagram } from "react-icons/fa6";
import { siteConfig } from "@/lib/siteConfig";

const socials = [
    { href: siteConfig.links.github, icon: FaGithub, label: "GitHub" },
    { href: siteConfig.links.linkedin, icon: FaLinkedinIn, label: "LinkedIn" },
    { href: siteConfig.links.instagram, icon: FaInstagram, label: "Instagram" },
    { href: siteConfig.links.portfolio, icon: Globe, label: "Portfolio" },
];

export default function SidebarSocials() {
    return (
        <div className="border-t px-4 py-3">
            <p className="mb-2 px-1 text-xs text-muted-foreground">
                Built by{" "}
                <a
                    href={siteConfig.links.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:underline"
                >
                    {siteConfig.author}
                </a>
            </p>

            <div className="flex items-center gap-1">
                {socials.map(({ href, icon: Icon, label }) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        title={label}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Icon className="h-4 w-4" />
                    </a>
                ))}
            </div>
        </div>
    );
}