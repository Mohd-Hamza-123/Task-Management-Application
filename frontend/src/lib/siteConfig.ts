export const siteConfig = {
    name: "Veltoza",
    description:
        "A modern task management platform to organize tasks, track progress, and stay updated with email notifications.",
    url: "https://veltoza.vercel.app",
    author: "Mohd Hamza",
    links: {
        portfolio: "https://mohdhamza.dev",
        github: "https://github.com/Mohd-Hamza-123",
        linkedin: "https://www.linkedin.com/in/mohd-hamza-18959427a/",
        instagram: "https://www.instagram.com/byte_master_hamza/?hl=en",
    },
} as const;

export type SiteConfig = typeof siteConfig;