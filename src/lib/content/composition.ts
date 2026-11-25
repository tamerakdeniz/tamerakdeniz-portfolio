import type { PortfolioProject } from './portfolio';

/** The displayed lead asset also supplies the figure caption. */
export function compositionLead(project: PortfolioProject) {
  const variant = project.presentation.variant;
  if (variant === 'mobile' && project.mobile.length) return project.mobile[0];
  if (variant === 'technical' && project.diagrams.length) return project.diagrams[0];
  const primary = project.desktop[0] ?? project.cover ?? project.mobile[0] ?? project.diagrams[0] ?? null;
  if (variant === 'immersive' || (!project.desktop.length && !project.mobile.length)) {
    return project.video ?? project.cover ?? primary;
  }
  return primary;
}
