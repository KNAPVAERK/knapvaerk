import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '../../../i18n/routing'
import Footer from '../../../components/Footer'
import OrderForm from '../../../components/OrderForm'
import { FORMS, variantsByForm } from '../../../lib/variants'
import styles from './RetailerPage.module.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const isDanish = locale !== 'en'

  return {
    title: isDanish ? 'KNAPVÆRK — For Forhandlere' : 'KNAPVÆRK — For Retailers',
    description: isDanish
      ? 'Forhandlerkatalog for KNAPVÆRK. Håndskårne træknapper. Priser er ekskl. moms.'
      : 'Trade catalogue for KNAPVÆRK. Handcut wooden buttons. Prices excl. VAT.',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function RetailerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('retailer')
  const tOrder = await getTranslations('order')
  const tw = await getTranslations('woods')
  const tf = await getTranslations('finishes')
  const tForm = await getTranslations('forms')

  const terms = [
    { label: t('term_price_label'), value: t('term_price_value') },
    { label: t('term_retail_label'), value: t('term_retail_value') },
    { label: t('term_minimum_label'), value: t('term_minimum_value') },
    { label: t('term_payment_label'), value: t('term_payment_value') },
    { label: t('term_shipping_label'), value: t('term_shipping_value') },
    { label: t('term_leadtime_label'), value: t('term_leadtime_value') },
  ]

  const formDescriptions: Record<string, string> = {
    romso: t('form_romso_desc'),
    stavre: t('form_stavre_desc'),
  }

  return (
    <>
      <main className={styles.page} data-page="retailer">
        <header className={styles.header}>
          <a href={`/${locale === routing.defaultLocale ? '' : locale}`} className={styles.logoLink}>
            <img src="/assets/images/logo1.svg" alt="KNAPVÆRK" className={styles.logo} />
          </a>
          <p className={styles.pageLabel}>{t('page_label')}</p>
        </header>

        {/* Intro */}
        <section className={styles.section}>
          <p className={styles.body}>{t('intro_text')}</p>
        </section>

        {/* Collection — grouped by form */}
        <section className={styles.gridSection}>
          <h2 className={styles.sectionTitle}>{t('collection_title')}</h2>
          <p className={styles.holesNote}>{t('spec_note')}</p>

          {FORMS.map((form) => (
            <div key={form} className={styles.group}>
              <div className={styles.groupHeader}>
                <h3 className={styles.groupTitle}>{tForm(form)}</h3>
                <p className={styles.groupDesc}>{formDescriptions[form]}</p>
              </div>

              <div className={styles.groupGrid}>
                {variantsByForm(form).map((v) => (
                  <article key={v.sku} className={styles.card}>
                    <div className={styles.cardImageWrap}>
                      {v.image ? (
                        <img
                          src={v.image}
                          alt={`${tForm(v.form)} · ${tw(v.wood)} · ${tf(v.finish)}`}
                          loading="lazy"
                          className={styles.cardImage}
                        />
                      ) : (
                        <span className={styles.cardPlaceholder}>{t('image_placeholder')}</span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <p className={styles.cardWood}>{tw(v.wood)}</p>
                      <p className={styles.cardFinish}>{tf(v.finish)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Custom series */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('craft_title')}</h2>
          <p className={styles.body}>{t('craft_text')}</p>
          <div className={styles.imageBlock}>
            <img src="/assets/images/Retailerkniv.webp" alt={t('craft_img_alt')} loading="lazy" />
          </div>
        </section>

        {/* Prices and terms */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('terms_title')}</h2>
          <dl className={styles.termsList}>
            {terms.map((term) => (
              <div key={term.label} className={styles.termItem}>
                <dt className={styles.termLabel}>{term.label}</dt>
                <dd className={styles.termValue}>{term.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Order */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{tOrder('title')}</h2>
          <p className={styles.body}>{tOrder('subtitle')}</p>
          <OrderForm locale={locale} />
          <p className={styles.mailFallback}>
            {tOrder('mailFallback')}{' '}
            <a href="mailto:info@knapvaerk.com" className={styles.emailLink}>
              info@knapvaerk.com
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
