export const site = {
    github: 'https://github.com/mosona-labs/mosona-manager',
    discord: 'https://discord.gg/gmWzrXFXsB',
    discussions: 'https://github.com/mosona-labs/mosona-manager/discussions',
} as const;

export const screenshots = [
    {
        title: 'Home',
        description: 'Overview of all your servers, their status, and recent activity.',
        src: '/screenshots/1.avif',
    },
    {
        title: 'Terminal',
        description: 'Access your servers via SSH or Mosona Agent, with project-based permissions.',
        src: '/screenshots/2.avif',
    },
    {
        title: 'New server',
        description: 'Step-by-step form to register servers and configure monitoring.',
        src: '/screenshots/3.avif',
    },
    {
        title: 'Monitor',
        description: 'Real-time and periodic charts from InfluxDB metrics.',
        src: '/screenshots/4.avif',
    },
    {
        title: 'Set public page',
        description: 'Configure your public-facing status page for shared project visibility.',
        src: '/screenshots/5.avif',
    },
    {
        title: 'Public page',
        description: 'Public-facing status page for shared project visibility.',
        src: '/screenshots/6.avif',
    },
    {
        title: 'User Profile',
        description: 'Manage your account, notifications, and personal preferences.',
        src: '/screenshots/7.avif',
    },
    {
        title: 'Admin',
        description: 'Manage users, roles, projects, and system-wide settings.',
        src: '/screenshots/8.avif',
    },
] as const;

export const techStack = ['Golang 1.26', 'Postgres 18', 'InfluxDB 2', 'Docker'] as const;
