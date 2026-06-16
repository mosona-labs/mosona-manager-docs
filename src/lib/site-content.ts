export const site = {
    github: 'https://github.com/mosona-labs/mosona-manager',
    discord: 'https://discord.gg/gmWzrXFXsB',
    discussions: 'https://github.com/mosona-labs/mosona-manager/discussions',
} as const;

export const screenshots = [
    {
        title: 'Home',
        description: 'Overview of all your servers, their status, and recent activity.',
        src: 'https://github.com/user-attachments/assets/6e486a04-647a-4201-a0d8-977d7994f832',
    },
    {
        title: 'Terminal',
        description: 'Access your servers via SSH or Mosona Agent, with project-based permissions.',
        src: 'https://github.com/user-attachments/assets/b164f3c5-ba03-4a31-a8dc-5c60d473af37',
    },
    {
        title: 'New server',
        description: 'Step-by-step form to register servers and configure monitoring.',
        src: 'https://github.com/user-attachments/assets/60ea1cdb-ec2d-4e4c-95e1-4472fba3c39c',
    },
    {
        title: 'Monitor',
        description: 'Real-time and periodic charts from InfluxDB metrics.',
        src: 'https://github.com/user-attachments/assets/c586f397-a4e9-4fd1-a0ab-f753ed4bfe8b',
    },
    {
        title: 'Set public page',
        description: 'Configure your public-facing status page for shared project visibility.',
        src: 'https://github.com/user-attachments/assets/96509eb5-b3ae-4223-8e18-9de5b77466f6',
    },
    {
        title: 'Public page',
        description: 'Public-facing status page for shared project visibility.',
        src: 'https://github.com/user-attachments/assets/15611147-45c2-4358-b5f0-22a5c2fab547',
    },
    {
        title: 'User Profile',
        description: 'Manage your account, notifications, and personal preferences.',
        src: 'https://github.com/user-attachments/assets/2efcc2dc-e87d-4a95-a854-0b44b871a903',
    },
    {
        title: 'Admin',
        description: 'Manage users, roles, projects, and system-wide settings.',
        src: 'https://github.com/user-attachments/assets/3e93b6b7-a41f-4cc6-9b72-4e7419696c0c',
    },
] as const;

export const techStack = ['Golang 1.26', 'Postgres 18', 'InfluxDB 2', 'Docker'] as const;
