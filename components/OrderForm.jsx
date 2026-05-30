'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { VARIANTS } from '../lib/variants'
import styles from './OrderForm.module.css'

let lineId = 0
const nextLineId = () => ++lineId

export default function OrderForm({ locale }) {
  const t = useTranslations('order')
  const tw = useTranslations('woods')
  const tf = useTranslations('finishes')
  const tForm = useTranslations('forms')

  const [lines, setLines] = useState([])
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [formVisible, setFormVisible] = useState(true)
  const [touched, setTouched] = useState({ email: false, address: false })

  // Human-readable label for a variant, e.g. "Romsø · Ahorn · Shellak"
  const variantLabel = (v) =>
    `${tForm(v.form)} · ${tw(v.wood)} · ${tf(v.finish)}`

  // Options grouped by form for the picker
  const options = useMemo(
    () => VARIANTS.map((v) => ({ sku: v.sku, label: variantLabel(v), form: v.form, wood: v.wood, finish: v.finish })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  )

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const emailValid = email.length === 0 ? null : validateEmail(email)
  const addressValid = address.length === 0 ? null : address.trim().length > 0
  const hasValidLine = lines.some((l) => l.sku && l.quantity > 0)
  const isFormValid = emailValid === true && address.trim().length > 0 && hasValidLine

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: nextLineId(), sku: '', holes: 'one', quantity: 1 },
    ])
  }

  const updateLine = (id, patch) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const removeLine = (id) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

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

    const payload = {
      email,
      address,
      note,
      locale,
      lines: lines
        .filter((l) => l.sku && l.quantity > 0)
        .map((l) => {
          const v = options.find((o) => o.sku === l.sku)
          return {
            sku: l.sku,
            wood: v?.wood,
            form: v?.form,
            finish: v?.finish,
            holes: l.holes,
            quantity: l.quantity,
          }
        }),
      _gotcha: '',
    }

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

        {/* Order lines */}
        <div className={styles.lines}>
          {lines.map((line) => (
            <div key={line.id} className={styles.lineRow}>
              <div className={styles.lineVariant}>
                <label className={styles.srOnly} htmlFor={`variant-${line.id}`}>
                  {t('selectVariant')}
                </label>
                <select
                  id={`variant-${line.id}`}
                  value={line.sku}
                  onChange={(e) => updateLine(line.id, { sku: e.target.value })}
                  className={styles.select}
                  required
                >
                  <option value="" disabled>
                    {t('selectVariant')}
                  </option>
                  {options.map((o) => (
                    <option key={o.sku} value={o.sku}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.lineHoles}>
                <label className={styles.srOnly} htmlFor={`holes-${line.id}`}>
                  {t('holesLabel')}
                </label>
                <select
                  id={`holes-${line.id}`}
                  value={line.holes}
                  onChange={(e) => updateLine(line.id, { holes: e.target.value })}
                  className={styles.select}
                >
                  <option value="one">{t('holesOne')}</option>
                  <option value="two">{t('holesTwo')}</option>
                </select>
              </div>

              <div className={styles.lineQty}>
                <label className={styles.srOnly} htmlFor={`qty-${line.id}`}>
                  {t('quantityLabel')}
                </label>
                <input
                  id={`qty-${line.id}`}
                  type="number"
                  min="1"
                  step="1"
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(line.id, {
                      quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                    })
                  }
                  className={styles.qtyInput}
                  aria-label={t('quantityLabel')}
                />
              </div>

              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeLine(line.id)}
                aria-label={t('removeVariant')}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button type="button" className={styles.addBtn} onClick={addLine}>
          + {t('addVariant')}
        </button>

        {/* Contact + delivery */}
        <div className={`${styles.formField} ${emailValid === false && touched.email ? styles.error : ''} ${emailValid === true ? styles.valid : ''}`}>
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

        <div className={`${styles.formField} ${addressValid === false && touched.address ? styles.error : ''}`}>
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
          className={`${styles.submitBtn} ${loading ? styles.isLoading : ''} ${!isFormValid ? styles.disabled : ''}`}
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
