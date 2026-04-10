import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '../../../i18n/routing'
import Footer from '../../../components/Footer'
import styles from './RetailerPage.module.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const isDanish = locale !== 'en'

  const title = isDanish ? 'KNAPVÆRK — For Forhandlere' : 'KNAPVÆRK — For Retailers'
  const description = isDanish
    ? 'Håndskårne knapper til udvalgte forhandlere og skrædderier'
    : 'Handcut buttons in solid wood for select retailers and tailors'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: isDanish
        ? 'https://www.knapvaerk.com/retailer'
        : 'https://www.knapvaerk.com/en/retailer',
      siteName: 'KNAPVÆRK',
      locale: isDanish ? 'da_DK' : 'en_US',
      images: [{ url: '/assets/images/retailer/hero.jpg' }],
    },
  }
}

export default async function RetailerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('retailer')

  return (
    <>
      <main className={styles.page} data-page="retailer">
        <header className={styles.header}>
          <a href={`/${locale === routing.defaultLocale ? '' : locale}`} className={styles.logoLink}>
            <img
              src="/assets/images/logo1.svg"
              alt="KNAPVÆRK"
              className={styles.logo}
            />
          </a>
          <p className={styles.pageLabel}>{t('page_label')}</p>
          <p className={styles.heroSubtitle}>{t('hero_subtitle')}</p>
        </header>

        <section className={styles.section}>
          <p className={styles.body}>{t('intro_text')}</p>
          <div className={styles.imageBlock}>
            <img
              src="/assets/images/RetailerknivNY.webp"
              alt={t('sortiment_img_alt')}
              loading="lazy"
            />
          </div>
          <p className={styles.body}>{t('sortiment_text')}</p>
          <p className={styles.note}>{t('wholesale_only')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('why_title')}</h2>
          <p className={styles.body}>{t('why_text1')}</p>
          <p className={styles.body}>{t('why_text2')}</p>
          <p className={styles.body}>{t('why_text3')}</p>
          <div className={styles.imageBlock}>
            <img
              src="/assets/images/Retailerkniv.webp"
              alt={t('haandvaerk_img_alt')}
              loading="lazy"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('cta_title')}</h2>
          <div className={styles.imageBlock}>
            <img
              src="/assets/images/Retaileraeske.webp"
              alt={t('proevepakke_img_alt')}
              loading="lazy"
            />
          </div>
          <p className={styles.body}>{t('cta_text1')}</p>
          <p className={styles.body}>
            {t.rich('cta_text2', {
              emailLink: (chunks) => (
                <a href="mailto:info@knapvaerk.com" className={styles.emailLink}>
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
