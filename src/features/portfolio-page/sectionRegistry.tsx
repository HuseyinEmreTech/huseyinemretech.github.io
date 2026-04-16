import type { ComponentType } from 'react'
import type { PortfolioSectionId } from '@/shared/portfolio/sectionIds'
import { HeroSection } from '@/features/portfolio-page/ui/HeroSection'
import { ExperienceSection } from '@/features/portfolio-page/ui/ExperienceSection'
import { EducationSection } from '@/features/portfolio-page/ui/EducationSection'
import { ProjectsSection } from '@/features/portfolio-page/ui/ProjectsSection'
import { CourseworkSection } from '@/features/portfolio-page/ui/CourseworkSection'
import { SkillsSection } from '@/features/portfolio-page/ui/SkillsSection'
import { ContactSection } from '@/features/portfolio-page/ui/ContactSection'

export const portfolioSectionComponents: Record<PortfolioSectionId, ComponentType> = {
  about: HeroSection,
  experience: ExperienceSection,
  education: EducationSection,
  projects: ProjectsSection,
  coursework: CourseworkSection,
  skills: SkillsSection,
  contact: ContactSection,
}
