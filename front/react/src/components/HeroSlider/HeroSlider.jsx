import { useEffect, useRef } from 'react'
import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

export default function HeroSlider({ slides, height = '600px' }) {
    const swiperRef = useRef(null)

    useEffect(() => {
        const swiper = new Swiper(swiperRef.current, {
            modules: [Navigation, Pagination, Autoplay],
            loop: true,
            autoplay: { delay: 5000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            speed: 1000,
        })
        return () => swiper.destroy()
    }, [])

    return (
        <section className="hero-slider" style={{ height }}>
            <div className="swiper" ref={swiperRef}>
                <div className="swiper-wrapper">
                    {slides.map((slide, i) => (
                        <div className="swiper-slide" key={i}>
                            <img src={slide.image} alt={slide.title} className="slide-bg" loading="lazy" />
                            <div className="slide-content">
                                <h2 className="h1-28">{slide.title}</h2>
                                {slide.subtitle && <p className="body-16">{slide.subtitle}</p>}
                                {slide.price && <p className="price-20">{slide.price} ₽</p>}
                                {slide.link && (
                                    <a href={slide.link.href} className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                                        {slide.link.label}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="swiper-pagination" />
                <div className="swiper-button-next" />
                <div className="swiper-button-prev" />
            </div>
        </section>
    )
}