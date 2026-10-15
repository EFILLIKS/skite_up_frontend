import { useEffect, useRef, useState } from 'react'
import ArrowBackIosNewRounded from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRounded from '@mui/icons-material/ArrowForwardIosRounded'
import { Box, IconButton, Typography } from '@mui/material'
import type { ProductSlideData } from '../../data/landingData'

interface ProductSliderProps {
  title: string
  slides: ProductSlideData[]
  renderVisual: (slide: ProductSlideData) => React.ReactNode
  interval?: number
  className?: string
}

export default function ProductSlider({ title, slides, renderVisual, interval = 5600, className = '' }: ProductSliderProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const slide = slides[activeSlide]

  useEffect(() => {
    if (paused || slides.length < 2) return
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), interval)
    return () => window.clearInterval(timer)
  }, [interval, paused, slides.length])

  const goTo = (index: number) => setActiveSlide((index + slides.length) % slides.length)

  return (
    <Box className={`product-slider ${className}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false) }} onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; setPaused(true) }} onTouchEnd={(event) => { const endX = event.changedTouches[0]?.clientX; if (touchStartX.current !== null && endX !== undefined) { const delta = endX - touchStartX.current; if (Math.abs(delta) > 45) goTo(activeSlide + (delta < 0 ? 1 : -1)) } touchStartX.current = null; setPaused(false) }}>
      <div className="product-slider__layout">
        <div className="product-slider__copy" key={`${title}-${activeSlide}`}>
          <span className="product-slider__eyebrow">PRODUCT TOUR / {String(activeSlide + 1).padStart(2, '0')}</span>
          <Typography component="h3">{slide.title}</Typography>
          <Typography className="product-slider__description">{slide.description}</Typography>
          <div className="product-slider__metric"><b>{slide.metric}</b><span>{slide.metricLabel}</span></div>
          <div className="product-slider__controls">
            <IconButton aria-label="Previous slide" onClick={() => goTo(activeSlide - 1)}><ArrowBackIosNewRounded /></IconButton>
            <IconButton aria-label="Next slide" onClick={() => goTo(activeSlide + 1)}><ArrowForwardIosRounded /></IconButton>
            <div className="product-slider__indicators" role="tablist" aria-label={`${title} slides`}>
              {slides.map((item, index) => <button key={item.title} type="button" aria-label={`Show ${item.title}`} aria-current={activeSlide === index} className={activeSlide === index ? 'is-active' : ''} onClick={() => goTo(index)} />)}
            </div>
            <span className="product-slider__counter">{String(activeSlide + 1).padStart(2, '0')} <i>/ {String(slides.length).padStart(2, '0')}</i></span>
          </div>
        </div>
        <div className="product-slider__visual" key={`visual-${title}-${activeSlide}`} aria-live="polite">{renderVisual(slide)}</div>
      </div>
      <div className="product-slider__progress" aria-hidden="true"><span style={{ transform: `scaleX(${(activeSlide + 1) / slides.length})` }} /></div>
    </Box>
  )
}