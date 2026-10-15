import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Box, Container } from '@mui/material'

interface SectionContainerProps {
  children: ReactNode
  id?: string
  className?: string
  component?: 'section' | 'div'
}

export default function SectionContainer({ children, id, className = '', component = 'section' }: SectionContainerProps) {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !('IntersectionObserver' in window)) return

    section.classList.add('reveal-ready')
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add('has-entered')
        observer.unobserve(section)
      }
    }, { threshold: 0.08 })

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <Box ref={sectionRef} component={component} id={id} className={`section-band ${className}`}>
      <Container maxWidth="lg" className="section-container">
        {children}
      </Container>
    </Box>
  )
}