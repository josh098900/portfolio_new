import { IProject } from './types';

/**
 * Sample project data for the portfolio
 * This data demonstrates the structure and can be replaced with real projects
 */
export const projects: IProject[] = [
  {
    id: 'pixel-game-engine',
    title: 'Pixel Game Engine',
    description: 'A lightweight 2D game engine built with TypeScript and Canvas API. Features sprite animation, collision detection, and a component-based architecture perfect for retro-style games.',
    technologies: ['TypeScript', 'Canvas API', 'WebGL', 'Webpack'],
    imageUrl: '/images/projects/project-1.png',
    demoUrl: 'https://pixel-game-engine-demo.vercel.app',
    githubUrl: 'https://github.com/developer/pixel-game-engine',
    featured: true,
    completedDate: '2024-03-15',
    galleryImages: [
      '/images/projects/pixel-game-engine-1.png',
      '/images/projects/pixel-game-engine-2.png',
      '/images/projects/pixel-game-engine-3.png'
    ]
  },
  {
    id: 'retro-portfolio',
    title: 'Retro Portfolio Website',
    description: 'A nostalgic portfolio website inspired by 80s computer interfaces. Built with Next.js and features terminal-style navigation and pixel art animations.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    imageUrl: '/images/projects/project-2.png',
    demoUrl: 'https://retro-portfolio.vercel.app',
    githubUrl: 'https://github.com/developer/retro-portfolio',
    featured: true,
    completedDate: '2024-02-28',
    galleryImages: [
      '/images/projects/retro-portfolio-1.png',
      '/images/projects/retro-portfolio-2.png'
    ]
  },
  {
    id: 'pixel-art-generator',
    title: 'Pixel Art Generator',
    description: 'An AI-powered tool that converts regular images into pixel art. Features customizable color palettes, dithering options, and export functionality.',
    technologies: ['Python', 'OpenCV', 'Flask', 'React', 'PIL'],
    imageUrl: '/images/projects/project-3.png',
    demoUrl: 'https://pixel-art-gen.herokuapp.com',
    githubUrl: 'https://github.com/developer/pixel-art-generator',
    featured: false,
    completedDate: '2024-01-20',
    galleryImages: [
      '/images/projects/pixel-art-generator-1.png'
    ]
  },
  {
    id: 'chip8-emulator',
    title: 'CHIP-8 Emulator',
    description: 'A fully functional CHIP-8 emulator written in Rust with WebAssembly bindings. Includes a debugger and supports all original CHIP-8 instructions.',
    technologies: ['Rust', 'WebAssembly', 'JavaScript', 'HTML5 Canvas'],
    imageUrl: '/images/placeholder-project.svg',
    demoUrl: 'https://chip8-emu.netlify.app',
    githubUrl: 'https://github.com/developer/chip8-emulator',
    featured: true,
    completedDate: '2023-12-10',
    galleryImages: [
      '/images/projects/chip8-emulator-1.png',
      '/images/projects/chip8-emulator-2.png'
    ]
  },
  {
    id: 'blockchain-visualizer',
    title: 'Blockchain Visualizer',
    description: 'An interactive web application that visualizes blockchain concepts with pixel art graphics. Educational tool for understanding cryptocurrency and distributed ledgers.',
    technologies: ['Vue.js', 'D3.js', 'Node.js', 'Express', 'MongoDB'],
    imageUrl: '/images/placeholder-project.svg',
    demoUrl: 'https://blockchain-viz.vercel.app',
    githubUrl: 'https://github.com/developer/blockchain-visualizer',
    featured: false,
    completedDate: '2023-11-05',
  },
  {
    id: 'retro-music-player',
    title: 'Retro Music Player',
    description: 'A nostalgic music player with a vintage interface inspired by 80s boomboxes. Features equalizer visualization and playlist management.',
    technologies: ['React', 'Web Audio API', 'CSS3', 'IndexedDB'],
    imageUrl: '/images/placeholder-project.svg',
    demoUrl: 'https://retro-player.surge.sh',
    githubUrl: 'https://github.com/developer/retro-music-player',
    featured: false,
    completedDate: '2023-10-15',
  }
];

/**
 * Get all projects
 */
export const getAllProjects = (): IProject[] => {
  return projects;
};

/**
 * Get featured projects only
 */
export const getFeaturedProjects = (): IProject[] => {
  return projects.filter(project => project.featured);
};

/**
 * Get a project by ID
 */
export const getProjectById = (id: string): IProject | undefined => {
  return projects.find(project => project.id === id);
};

/**
 * Get projects by technology
 */
export const getProjectsByTechnology = (technology: string): IProject[] => {
  return projects.filter(project => 
    project.technologies.some(tech => 
      tech.toLowerCase().includes(technology.toLowerCase())
    )
  );
};

/**
 * Get the most recent projects
 */
export const getRecentProjects = (limit: number = 3): IProject[] => {
  return projects
    .sort((a, b) => {
      if (!a.completedDate) return 1;
      if (!b.completedDate) return -1;
      return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
    })
    .slice(0, limit);
};