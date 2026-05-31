'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { VARIANTS, FORMS, variantsByForm } from '../lib/variants'
import styles from './OrderForm.module.css'

// Wholesale pricing — mirrors the terms copy on the retailer page.
const PRICE_PER_BUTTON = 50 // DKK, excl. VAT (term_price_value)
const FREE_SHIPPING_THRESHOLD = 1000 // DKK, Denmark only (term_shipping_value)

// The two hole options, in column order.
const HOLE_COLUMNS = ['one', 'two']

// Quantity-map key for a single variant + hole combination.
const cellKey = (sku, holes) => `${sku}-${holes}`

export default function OrderForm({ locale }) {
  const t = useTranslations('order')
  const tw = useTranslations('woods')
  const tf = useTranslations('finishes')
  const tForm = useTranslations('forms')

  // Flat quantity map keyed by `${sku}-${holes}`; empty/0 entries are simply absent.
  const [quantities, setQuantities] = useState({})
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [formVisible, setFormVisible] = useState(true)
  const [touched, setTouched] = useState({ email: false, address: false })

  // Row label — wood · finish. The model (Romsø/Stavre) is shown by the group
  // heading above, so it's omitted here to avoid repetition.
  const variantLabel = (v) => `${tw(v.wood)} · ${tf(v.finish)}`

  // Full label including the model, for screen readers (read in isolation).
  const variantLabelFull = (v) =>
    `${tForm(v.form)} · ${tw(v.wood)} · ${tf(v.finish)}`

  const setCell = (sku, holes, raw) => {
    const key = cellKey(sku, holes)
    const value = Math.max(0, parseInt(raw, 10) || 0)
    setQuantities((prev) => {
      const next = { ...prev }
      if (value > 0) next[key] = value
      else delete next[key]
      return next
    })
  }

  // Live totals derived from the quantity map.
  const { totalQty, totalPrice, qualifiesFreeShipping, remaining } = useMemo(() => {
    const qty = Object.values(quantities).reduce((sum, n) => sum + n, 0)
    const price = qty * PRICE_PER_BUTTON
    return {
      totalQty: qty,
      totalPrice: price,
      qualifiesFreeShipping: price >= FREE_SHIPPING_THRESHOLD,
      remaining: Math.max(0, FREE_SHIPPING_THRESHOLD - price),
    }
  }, [quantities])

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const emailValid = email.length === 0 ? null : validateEmail(email)
  const addressValid = address.length === 0 ? null : address.trim().length > 0
  const hasValidLine = totalQty > 0
  const isFormValid = emailValid === true && address.trim().length > 0 && hasValidLine

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: '', message: '' })

    // Honeypot
    const formData = new FormData(e.target)
    if (formData.get('_gotcha')) {
      setStatus({ type: 'error', message: t('spamError') })
      return
    }

    setTouched({ email: true, address: true })

    if (emailValid !== true) {
      setStatus({ type: 'error', message: t('emailError') })
      return
    }
    if (address.trim().length === 0) {
      setStatus({ type: 'error', message: t('addressError') })
      return
    }
    if (!hasValidLine) {
      setStatus({ type: 'error', message: t('emptyOrderError') })
      return
    }

    // Build a minimal payload: only cells with quantity > 0, same line shape the
    // /api/order route already expects ({ sku, wood, form, finish, holes, quantity }).
    const lines = []
    for (const v of VARIANTS) {
      for (const holes of HOLE_COLUMNS) {
        const quantity = quantities[cellKey(v.sku, holes)]
        if (quantity > 0) {
          lines.push({
            sku: v.sku,
            wood: v.wood,
            form: v.form,
            finish: v.finish,
            holes,
            quantity,
          })
        }
      }
    }

    const payload = { email, address, note, locale, lines, _gotcha: '' }

    setLoading(true)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (res.ok) {
        setLoading(false)
        setStatus({ type: 'success', message: t('successTitle') })
        setFormVisible(false)
      } else {
        throw new Error(result.error || t('genericError'))
      }
    } catch (error) {
      setLoading(false)
      setStatus({ type: 'error', message: error.message || t('genericError') })
    }
  }

  if (!formVisible && status.type === 'success') {
    return (
      <div className={styles.formContainer}>
        <div className={styles.successState}>
          <div className={styles.successIcon}></div>
          <div>
            <h3 className={styles.successTitle}>{t('successTitle')}</h3>
            <p className={styles.successText}>{t('successMessage')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Honeypot */}
        <input
          type="text"
          name="_gotcha"
          tabIndex="-1"
          autoComplete="off"
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {/* Order matrix — one row per variant, two number inputs (one/two holes) */}
        <div className={styles.matrix}>
          <div className={`${styles.matrixRow} ${styles.matrixHead}`} aria-hidden="true">
            <span className={styles.matrixVariantHead}>{t('matrixVariantCol')}</span>
            <span className={styles.matrixHoleHead}>{t('matrixOneHole')}</span>
            <span className={styles.matrixHoleHead}>{t('matrixTwoHoles')}</span>
          </div>

          {FORMS.map((form) => (
            <div key={form} className={styles.matrixGroup}>
              <h3 className={styles.matrixGroupTitle}>{tForm(form)}</h3>

              {variantsByForm(form).map((v) => (
                <div key={v.sku} className={styles.matrixRow}>
                  <span className={styles.matrixVariant}>{variantLabel(v)}</span>

                  {HOLE_COLUMNS.map((holes) => {
                    const id = `qty-${v.sku}-${holes}`
                    const holeLabel =
                      holes === 'one' ? t('matrixOneHole') : t('matrixTwoHoles')
                    return (
                      <div key={holes} className={styles.matrixCell}>
                        <label className={styles.srOnly} htmlFor={id}>
                          {variantLabelFull(v)} — {holeLabel}
                        </label>
                        <input
                          id={id}
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          placeholder="0"
                          value={quantities[cellKey(v.sku, holes)] ?? ''}
                          onChange={(e) => setCell(v.sku, holes, e.target.value)}
                          className={styles.qtyInput}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Live summary — total + free-shipping indicator */}
        <div
          className={`${styles.summaryBar} ${
            qualifiesFreeShipping ? styles.summaryQualified : ''
          }`}
        >
          <div className={styles.summaryTotals}>
            <span className={styles.summaryTotalLabel}>{t('total')}</span>
            <span className={styles.summaryTotalValue}>
              {totalPrice.toLocaleString('da-DK')} DKK
            </span>
          </div>
          <p className={styles.summaryShipping} aria-live="polite">
            {totalQty === 0
              ? t('priceNote')
              : qualifiesFreeShipping
                ? t('shippingQualified')
                : t('shippingRemaining', {
                    amount: remaining.toLocaleString('da-DK'),
                  })}
          </p>
        </div>

        {/* Contact + delivery */}
        <div
          className={`${styles.formField} ${
            emailValid === false && touched.email ? styles.error : ''
          } ${emailValid === true ? styles.valid : ''}`}
        >
          <label htmlFor="order-email">{t('emailLabel')}</label>
          <input
            id="order-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            required
            aria-invalid={emailValid === false && touched.email}
          />
        </div>

        <div
          className={`${styles.formField} ${
            addressValid === false && touched.address ? styles.error : ''
          }`}
        >
          <label htmlFor="order-address">{t('addressLabel')}</label>
          <textarea
            id="order-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, address: true }))}
            required
            rows={3}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="order-note">{t('noteLabel')}</label>
          <textarea
            id="order-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>

        <button
          type="submit"
          className={`${styles.submitBtn} ${loading ? styles.isLoading : ''} ${
            !isFormValid ? styles.disabled : ''
          }`}
          disabled={loading || !isFormValid}
          aria-busy={loading}
        >
          <span className={styles.btnText}>{t('submitButton')}</span>
          <span className={styles.btnLoader} aria-hidden="true"></span>
        </button>

        {status.type === 'error' && (
          <div className={`${styles.formStatus} ${styles.error} ${styles.visible}`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  )
}
