import { IProject } from './types';

/**
 * Joshua Mathers' real project portfolio
 * Showcasing interactive web applications and creative coding projects
 */
export const projects: IProject[] = [
  {
    id: 'travelglobe',
    title: 'TravelGlobe',
    description: 'An interactive 3D visualization of my travel history using Globe.GL. Explore countries I\'ve visited with smooth animations and detailed information overlays.',
    technologies: ['Globe.GL', 'JavaScript', 'CSS3', 'HTML5'],
    imageUrl: '/images/projects/project-1.png',
    demoUrl: 'https://josh098900.github.io/travelglobe/',
    githubUrl: 'https://github.com/josh098900/travelglobe',
    featured: true,
    completedDate: '10-04-2025'
  },
  {
    id: 'severance-review',
    title: 'Severance Fan Project',
    description: 'Interactive fan-made web application for the Apple TV series "Severance". Features immersive UI design inspired by the show\'s aesthetic and interactive elements.',
    technologies: ['HTML5', 'CSS3', 'JavaScript'],
    imageUrl: '/images/projects/project-2.png',
    demoUrl: 'https://josh098900.github.io/severance_review/',
    githubUrl: 'https://github.com/josh098900/severance_review',
    featured: true,
    completedDate: '12-12-2024'
  },
  {
    id: 'laptop-survival-101',
    title: 'Laptop Survival 101',
    description: 'A humorous interactive game about a lecturer\'s daily struggles with technology. Features engaging gameplay mechanics and witty commentary on academic life.',
    technologies: ['HTML5', 'CSS3', 'JavaScript'],
    imageUrl: '/images/projects/project-3.png',
    demoUrl: 'https://josh098900.github.io/laptop-survival-101/',
    githubUrl: 'https://github.com/josh098900/laptop-survival-101',
    featured: true,
    completedDate: '21-01-2025'
  },
  {
    id: 'chaos-engine',
    title: 'Chaos Engine',
    description: 'A dynamic web application designed for D&D sessions, providing random event generation and campaign management tools. Built to enhance tabletop gaming experiences.',
    technologies: ['HTML5', 'CSS3', 'JavaScript'],
    imageUrl: '/images/projects/project-4.png',
    demoUrl: 'https://josh098900.github.io/chaos_engine/',
    githubUrl: 'https://github.com/josh098900/chaos_engine',
    featured: false,
    completedDate: '21-11-2024'
  },
  {
    id: 'f1-canadian-gp-dashboard',
    title: 'F1 Canadian GP Dashboard',
    description: 'Real time weather dashboard for the canadian grand prix',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Nextjs'],
    imageUrl: '/images/projects/f1-canadian-gp.png',
    demoUrl: 'https://canadagp.vercel.app/',
    githubUrl: 'https://github.com/josh098900/canadagp',
    featured: true,
    completedDate: '27-06-2025'
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