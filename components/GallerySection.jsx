'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { urlFor } from '../lib/sanity'
import styles from './GallerySection.module.css'

export default function GallerySection({
  id,
  title,
  subtitle,
  metaText,
  images = [],
  sectionNumber
}) {
  const t = useTranslations('gallery')
  const [visible, setVisible] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const sectionRef = useRef(null)
  const lightboxRef = useRef(null)
  const closeButtonRef = useRef(null)
  const lastFocusedElement = useRef(null)
  const scrollPosition = useRef(0)

  const openLightbox = (image, index) => {
    lastFocusedElement.current = document.activeElement

    // Store current scroll position
    scrollPosition.current = window.pageYOffset

    // Prevent scroll on body
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPosition.current}px`
    document.body.style.width = '100%'

    setLightboxImage({ ...image, index })
  }

  const closeLightbox = () => {
    // Restore scroll position
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''

    window.scrollTo(0, scrollPosition.current)

    setLightboxImage(null)

    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus()
    }
  }

  const navigateToNextImage = () => {
    if (!lightboxImage || !images || images.length <= 1) return

    const nextIndex = (lightboxImage.index + 1) % images.length
    setLightboxImage({ ...images[nextIndex], index: nextIndex })
  }

  const navigateToPreviousImage = () => {
    if (!lightboxImage || !images || images.length <= 1) return

    const prevIndex = lightboxImage.index === 0
      ? images.length - 1
      : lightboxImage.index - 1
    setLightboxImage({ ...images[prevIndex], index: prevIndex })
  }

  const handleKeyDown = (e) => {
    if (!lightboxImage) return

    switch(e.key) {
      case 'Escape':
        closeLightbox()
        break
      case 'ArrowRight':
        navigateToNextImage()
        break
      case 'ArrowLeft':
        navigateToPreviousImage()
        break
      default:
        break
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px'
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  // Cleanup body styles on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [lightboxImage])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxImage) {
      document.addEventListener('keydown', handleKeyDown)

      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [lightboxImage])

  // Focus trap
  useEffect(() => {
    if (!lightboxImage) return

    const handleTabKey = (e) => {
      if (!lightboxRef.current) return

      const focusableElements = lightboxRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.key !== 'Tab') return

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleTabKey)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [lightboxImage])

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.visible : ''}`}
      id={id}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && (
            <div className={styles.subtitle}>
              {subtitle.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
          {metaText && <div className={styles.metaText}>{metaText}</div>}
        </div>

        <div className={styles.imagesContainer}>
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <div key={index} className={styles.imageWrapper}>
                <Image
                  onClick={() => openLightbox(image, index)}
                  src={urlFor(image).width(1000).auto('format').url()}
                  alt={image.alt || `${title} billede ${index + 1}`}
                  width={1000}
                  height={1000}
                  loading="lazy"
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.image}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openLightbox(image, index)
                    }
                  }}
                />
                {image.caption && (
                  <p className={styles.caption}>{image.caption}</p>
                )}
              </div>
            ))
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>{t('placeholder')}</span>
            </div>
          )}
        </div>
      </div>

      {lightboxImage && (
        <div
          ref={lightboxRef}
          className={styles.lightbox}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Forstørret visning af ${title} billede ${lightboxImage.index + 1} af ${images.length}`}
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <Image
              src={urlFor(lightboxImage).width(2000).auto('format').url()}
              alt={lightboxImage.alt || `${title} billede ${lightboxImage.index + 1}`}
              width={2000}
              height={2667}
              quality={95}
              sizes="90vw"
              className={styles.lightboxImage}
            />
            <button
              ref={closeButtonRef}
              className={styles.closeButton}
              onClick={closeLightbox}
              aria-label={t('closeLightbox')}
            >
              ✕
            </button>
            {lightboxImage.caption && (
              <p className={styles.lightboxCaption}>{lightboxImage.caption}</p>
            )}

            {images && images.length > 1 && (
              <div className={styles.navigationHint} aria-hidden="true">
                <span className={styles.hintText}>
                  {t('lightboxNav')}
                </span>
              </div>
            )}

            <div className={styles.escapeHint} aria-hidden="true">
              <span className={styles.hintText}>
                {t('lightboxClose')}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
