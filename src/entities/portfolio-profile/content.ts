import type { Education, Experience, Skill } from '@/shared/types/portfolio'

export const experiences: Experience[] = [
  {
    title: 'exp1-title',
    company: 'exp1-company',
    date: 'exp1-date',
    description: 'exp1-desc',
    responsibilities: ['exp1-li1', 'exp1-li2'],
  },
  {
    title: 'exp2-title',
    company: 'exp2-company',
    date: 'exp2-date',
    description: '',
    responsibilities: ['exp2-li1', 'exp2-li2', 'exp2-li3'],
  },
]

export const educations: Education[] = [
  {
    title: 'edu1-title',
    school: 'edu1-school',
    date: 'edu1-date',
    degree: 'edu1-degree',
  },
  {
    title: 'edu2-title',
    school: 'edu2-school',
    date: 'edu2-date',
    degree: 'edu2-degree',
  },
]

export const skills: Skill[] = [
  { name: 'skill-erp-cons', category: 'erp' },
  { name: 'skill-erp-inst', category: 'erp' },
  { name: 'skill-ba', category: 'erp' },
  { name: 'skill-opt', category: 'erp' },
  { name: 'skill-acc', category: 'erp' },
  { name: 'C#', category: 'dev' },
  { name: '.NET Core', category: 'dev' },
  { name: 'Blazor', category: 'dev' },
  { name: 'SQL Server', category: 'dev' },
  { name: 'HTML/CSS', category: 'dev' },
  { name: 'skill-hw-int', category: 'tech' },
  { name: 'skill-ts', category: 'tech' },
  { name: 'skill-net', category: 'tech' },
  { name: 'skill-srv', category: 'tech' },
  { name: 'skill-rem', category: 'tech' },
]
