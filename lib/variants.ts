// Single source of truth for the KNAPVÆRK retailer collection.
//
// The catalogue and the order form both read from this list, so a variant is
// defined in exactly one place. To update the collection, edit this file:
//   - add/remove a variant object
//   - swap an `image` path (new 1:1 photos go in /public/assets/images/)
//
// Holes (one/two) are NOT modelled here — both forms are available with one or
// two holes, and the customer chooses per line in the order form.

export type Form = 'romso' | 'stavre'
export type Wood = 'ahorn' | 'eg' | 'valnod' | 'ibenholt'
export type Finish = 'linolie' | 'shellak'

export interface Variant {
  sku: string
  form: Form
  wood: Wood
  finish: Finish
  /** Path under /public. Empty string = no photo yet (renders a placeholder). */
  image: string
}

export const VARIANTS: Variant[] = [
  // ── Romsø ──
  { sku: 'KV-101', form: 'romso', wood: 'ibenholt', finish: 'shellak', image: '/assets/images/IB-ROM-SHE.jpg' },
  { sku: 'KV-102', form: 'romso', wood: 'ibenholt', finish: 'linolie', image: '/assets/images/IB-ROM-LIN.jpg' },
  { sku: 'KV-201', form: 'romso', wood: 'ahorn',    finish: 'shellak', image: '/assets/images/AH-ROM-SHE.jpg' },
  { sku: 'KV-202', form: 'romso', wood: 'ahorn',    finish: 'linolie', image: '/assets/images/AH-ROM-LIN.jpg' },
  { sku: 'KV-301', form: 'romso', wood: 'valnod',   finish: 'linolie', image: '/assets/images/VAL-ROM-LIN.jpg' },
  { sku: 'KV-401', form: 'romso', wood: 'eg',       finish: 'linolie', image: '/assets/images/EG-ROM-LIN.jpg' },

  // ── Stavre ──
  { sku: 'KV-103', form: 'stavre', wood: 'ibenholt', finish: 'shellak', image: '/assets/images/IB-STAV-SHE.jpg' },
  { sku: 'KV-104', form: 'stavre', wood: 'ibenholt', finish: 'linolie', image: '' },
  { sku: 'KV-203', form: 'stavre', wood: 'ahorn',    finish: 'shellak', image: '' },
  { sku: 'KV-204', form: 'stavre', wood: 'ahorn',    finish: 'linolie', image: '/assets/images/AH-STAV-LIN.jpg' },
  { sku: 'KV-302', form: 'stavre', wood: 'valnod',   finish: 'linolie', image: '/assets/images/VAL-STAV-LIN.jpg' },
  { sku: 'KV-402', form: 'stavre', wood: 'eg',       finish: 'linolie', image: '/assets/images/EG-STAV-LIN.jpg' },
]

/** Forms in display order. */
export const FORMS: Form[] = ['romso', 'stavre']

/** Variants for a given form, in collection order. */
export function variantsByForm(form: Form): Variant[] {
  return VARIANTS.filter((v) => v.form === form)
}
