import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// Localized error messages
const errorMessages = {
  da: {
    missingFields: 'Email, leveringsadresse og mindst én variant skal udfyldes',
    invalidEmail: 'Ugyldig email adresse',
    serverError: 'Der opstod en fejl. Prøv igen senere.',
  },
  en: {
    missingFields: 'Email, delivery address and at least one variant are required',
    invalidEmail: 'Invalid email address',
    serverError: 'Something went wrong. Please try again later.',
  },
}

// Danish display labels for the order email (sent to Lars, always in Danish)
const WOOD_LABELS = { ahorn: 'Ahorn', eg: 'Eg', valnod: 'Valnød', ibenholt: 'Ibenholt' }
const FORM_LABELS = { romso: 'Romsø', stavre: 'Stavre' }
const FINISH_LABELS = { linolie: 'Linolie', shellak: 'Shellak' }
const HOLES_LABELS = { one: 'Ét hul', two: 'To huller' }

// Escape user-provided text before interpolating into the HTML email.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function describeLine(line) {
  const form = FORM_LABELS[line.form] || line.form || ''
  const wood = WOOD_LABELS[line.wood] || line.wood || ''
  const finish = FINISH_LABELS[line.finish] || line.finish || ''
  const holes = HOLES_LABELS[line.holes] || line.holes || ''
  return { variant: `${form} · ${wood} · ${finish}`, holes, sku: line.sku || '', quantity: line.quantity }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { company = '', email, address, note = '', locale = 'da', lines = [], _gotcha } = body

    const t = errorMessages[locale] || errorMessages.da

    // Honeypot
    if (_gotcha) {
      return NextResponse.json({ error: t.serverError }, { status: 400 })
    }

    // Validation
    const validLines = Array.isArray(lines)
      ? lines.filter((l) => l && l.sku && Number(l.quantity) > 0)
      : []

    if (!company || !company.trim() || !email || !address || validLines.length === 0) {
      return NextResponse.json({ error: t.missingFields }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: t.invalidEmail }, { status: 400 })
    }

    const described = validLines.map(describeLine)

    // Plain text body
    const textLines = described
      .map((l) => `- ${l.variant} — ${l.holes} — antal: ${l.quantity}${l.sku ? ` (${l.sku})` : ''}`)
      .join('\n')

    const text = `
Ny bestilling

Virksomhed/navn: ${company}
Fra: ${email}

Varianter:
${textLines}

Leveringsadresse:
${address}
${note ? `\nNote:\n${note}` : ''}
    `

    // HTML body
    const tableRows = described
      .map(
        (l) => `
          <tr>
            <td style="padding: 6px 10px; border-bottom: 1px solid #eee;">${l.variant}${l.sku ? `<br><span style="color:#999;font-size:12px;">${l.sku}</span>` : ''}</td>
            <td style="padding: 6px 10px; border-bottom: 1px solid #eee;">${l.holes}</td>
            <td style="padding: 6px 10px; border-bottom: 1px solid #eee; text-align:right;">${l.quantity}</td>
          </tr>`
      )
      .join('')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">
          Ny bestilling
        </h2>

        <p style="margin: 5px 0;"><strong>Virksomhed/navn:</strong> ${escapeHtml(company)}</p>
        <p style="margin: 5px 0;"><strong>Fra:</strong> ${escapeHtml(email)}</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr>
              <th style="padding: 6px 10px; text-align:left; border-bottom: 2px solid #1a1a1a;">Variant</th>
              <th style="padding: 6px 10px; text-align:left; border-bottom: 2px solid #1a1a1a;">Huller</th>
              <th style="padding: 6px 10px; text-align:right; border-bottom: 2px solid #1a1a1a;">Antal</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin-top: 20px;">
          <p style="margin: 0 0 6px 0;"><strong>Leveringsadresse:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${address}</p>
        </div>
        ${
          note
            ? `<div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin-top: 12px;">
                 <p style="margin: 0 0 6px 0;"><strong>Note:</strong></p>
                 <p style="margin: 0; white-space: pre-wrap;">${note}</p>
               </div>`
            : ''
        }
      </div>
    `

    const resend = new Resend(process.env.RESEND_API_KEY)

    const data = await resend.emails.send({
      from: 'KNAPVÆRK Bestilling <kontakt@knapvaerk.com>',
      to: ['bjerre@knapvaerk.com'],
      replyTo: email,
      subject: `Bestilling — ${company}`,
      text,
      html,
    })

    return NextResponse.json({ success: true, id: data.id }, { status: 200 })
  } catch (error) {
    console.error('Order send error:', error)
    return NextResponse.json({ error: errorMessages.da.serverError }, { status: 500 })
  }
}
