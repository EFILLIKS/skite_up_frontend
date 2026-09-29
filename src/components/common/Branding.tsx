import type { SVGProps } from 'react'
import skiteupLogo from '../../assets/LOGO.svg'

interface BrandMarkProps extends SVGProps<SVGSVGElement> {
  className?: string
}

export function BrandMark({ className = '', ...props }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 42 56" focusable="false" {...props}>
        <path d="M36 10C32 6.8 26.8 5 21 5 11 5 5 10 5 18c0 7 4.8 10.1 13.8 12.3l7.7 1.9c4.5 1.1 7 3 7 6.8 0 4.3-4.4 7-11.2 7-6.8 0-12.9-2.7-17.3-7.2L.5 44c5.4 5.1 13.2 8 22 8 10.7 0 17-5.4 17-13.5 0-8-5.3-11.2-12.9-13.2l-8.2-2.1c-4.7-1.3-7.4-3-7.4-6.1 0-4 3.8-6.4 9.7-6.4 5.2 0 9.6 1.7 13.2 4.5L36 10Z" />
      </svg>
    </span>
  )
}

interface BrandWordmarkProps {
  className?: string
}

export function BrandWordmark({ className = '' }: BrandWordmarkProps) {
  return (
    <img className={`brand-wordmark ${className}`} src={skiteupLogo} alt="SKITEUP" />
  )
}

interface BrandLockupProps {
  className?: string
  wordmarkClassName?: string
}

export default function BrandLockup({ className = '', wordmarkClassName = '' }: BrandLockupProps) {
  return (
    <span className={`brand-lockup ${className}`}>
      <BrandWordmark className={wordmarkClassName} />
    </span>
  )
}