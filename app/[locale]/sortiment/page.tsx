import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '../../../i18n/routing'
import Footer from '../../../components/Footer'
import styles from './SortimentPage.module.css'

interface Product {
  sku: string
  traesort: string
  form: string
  overflade: string
  image: string
  imageStyle?: { objectPosition?: string }
}

interface ProductGroup {
  label: string
  products: Product[]
}

const productGroups: ProductGroup[] = [
  {
    label: 'Ibenholt',
    products: [
      { sku: 'KV-101', traesort: 'Ibenholt', form: 'Romsø',  overflade: 'Shellak', image: '/assets/images/IB-ROM-SHE.jpg' },
      { sku: 'KV-102', traesort: 'Ibenholt', form: 'Romsø',  overflade: 'Linolie', image: '/assets/images/IB-ROM-LIN.jpg' },
      { sku: 'KV-103', traesort: 'Ibenholt', form: 'Stavre', overflade: 'Shellak', image: '/assets/images/IB-STAV-SHE.jpg' },
      { sku: 'KV-104', traesort: 'Ibenholt', form: 'Stavre', overflade: 'Linolie', image: '' },
    ],
  },
  {
    label: 'Valnød',
    products: [
      { sku: 'KV-301', traesort: 'Valnød', form: 'Romsø',  overflade: 'Linolie', image: '/assets/images/VAL-ROM-LIN.jpg' },
      { sku: 'KV-302', traesort: 'Valnød', form: 'Stavre', overflade: 'Linolie', image: '/assets/images/VAL-STAV-LIN.jpg' },
    ],
  },
  {
    label: 'Eg',
    products: [
      { sku: 'KV-401', traesort: 'Eg', form: 'Romsø',  overflade: 'Linolie', image: '/assets/images/EG-ROM-LIN.jpg', imageStyle: { objectPosition: 'center calc(50% + 25px)' } },
      { sku: 'KV-402', traesort: 'Eg', form: 'Stavre', overflade: 'Linolie', image: '/assets/images/EG-STAV-LIN.jpg' },
    ],
  },
  {
    label: 'Ahorn',
    products: [
      { sku: 'KV-201', traesort: 'Ahorn', form: 'Romsø',  overflade: 'Shellak', image: '/assets/images/AH-ROM-SHE.jpg' },
      { sku: 'KV-202', traesort: 'Ahorn', form: 'Romsø',  overflade: 'Linolie', image: '/assets/images/AH-ROM-LIN.jpg' },
      { sku: 'KV-203', traesort: 'Ahorn', form: 'Stavre', overflade: 'Shellak', image: '' },
      { sku: 'KV-204', traesort: 'Ahorn', form: 'Stavre', overflade: 'Linolie', image: '/assets/images/AH-STAV-LIN.jpg' },
    ],
  },
]

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const isDanish = locale !== 'en'

  return {
    title: isDanish ? 'KNAPVÆRK — Sortiment' : 'KNAPVÆRK — Trade Catalogue',
    description: isDanish
      ? 'Forhandlerkatalog for KNAPVÆRK. Håndskårne træknapper. Priser er ekskl. moms.'
      : 'Trade catalogue for KNAPVÆRK. Handcut wooden buttons. Prices excl. VAT.',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function SortimentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('sortiment')

  return (
    <>
      <main className={styles.page} data-page="sortiment">
        <header className={styles.header}>
          <a href={`/${locale === routing.defaultLocale ? '' : locale}`} className={styles.logoLink}>
            <img
              src="/assets/images/logo1.svg"
              alt="KNAPVÆRK"
              className={styles.logo}
            />
          </a>
          <p className={styles.pageLabel}>{t('page_label')}</p>
        </header>

        <section className={styles.gridSection}>
          {productGroups.map((group) => (
            <div key={group.label} className={styles.group}>
              <div className={styles.groupGrid}>
                {group.products.map((product) => (
                  <article key={product.sku} className={styles.card}>
                    <div className={styles.cardImageWrap}>
                      {product.image && (
                        <img
                          src={product.image}
                          alt={`${product.traesort} · ${product.form} · ${product.overflade}`}
                          loading="lazy"
                          className={styles.cardImage}
                          style={product.imageStyle}
                        />
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <div>
                          <p className={styles.cardTraesort}>{product.traesort}</p>
                          <p className={styles.cardForm}>{product.form}</p>
                          <p className={styles.cardOverflade}>{product.overflade}</p>
                        </div>
                        <p className={styles.cardPrice}>50 DKK</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className={styles.contactSection}>
          <p className={styles.body}>
            Bestillinger og forespørgsler sendes til{' '}
            <a href="mailto:info@knapvaerk.com" className={styles.emailLink}>
              info@knapvaerk.com
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
