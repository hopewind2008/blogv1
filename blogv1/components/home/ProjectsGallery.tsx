'use client'

import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'

interface Project {
  href: string
  image: string
  title: string
  description: string
}

const projects: Project[] = [
  {
    href: '/projects/ai-chat',
    image: '/images/zodiac-bg.jpg',
    title: 'AI 星座运势',
    description: '基于大语言模型的智能对话系统',
  },
  {
    href: '/projects/image-gen',
    image: '/images/ai-chat-bg.jpg',
    title: 'AI 穿搭分析',
    description: '智能穿搭分析与推荐系统',
  },
  {
    href: '/projects/code-helper',
    image: '/images/jun-ohashi-pSBXlKhkk-M-unsplash.jpg',
    title: '代码助手',
    description: '智能代码补全与优化工具',
  },
  {
    href: '/projects/data-viz',
    image: '/images/jun-ohashi-pSBXlKhkk-M-unsplash.jpg',
    title: '数据可视化',
    description: '交互式数据展示平台',
  },
]

interface ProjectCardProps {
  project: Project
}

const ProjectCard = memo(({ project }: ProjectCardProps) => (
  <Link href={project.href} className="group relative overflow-hidden rounded-xl aspect-square">
    <Image
      src={project.image}
      alt={project.title}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      quality={75}
      className="object-cover transition-transform duration-300 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 md:p-6">
      <div>
        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{project.title}</h3>
        <p className="text-sm md:text-base text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          {project.description}
        </p>
      </div>
    </div>
  </Link>
))

ProjectCard.displayName = 'ProjectCard'

const ProjectsGallery = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
      {projects.map((project) => (
        <ProjectCard key={project.href} project={project} />
      ))}
    </div>
  )
}

export default memo(ProjectsGallery) 