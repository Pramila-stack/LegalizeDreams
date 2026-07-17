import { useState } from 'react'

const faqs = [
  {
    q: 'How long is the delivery time and what’s the delivery fee?',
    a: 'Orders are delivered within 3-5 business days across the country. A flat delivery fee applies at checkout and is waived on orders over Rs 3,000.',
  },
  {
    q: 'Are your skincare items authentic?',
    a: 'Yes — every skincare product is sourced directly from authorized distributors and comes with original packaging and batch codes.',
  },
  {
    q: 'I haven’t received any confirmation email or SMS?',
    a: 'Confirmations can occasionally land in spam. If you still don’t see it within an hour, reach out via our contact page with your order details.',
  },
  {
    q: 'Do the lip tints cause dark lips?',
    a: 'No, our tints are formulated to be non-drying and pigment-safe. We recommend a lip balm underneath for extra comfort.',
  },
  {
    q: 'Returns?',
    a: 'Unused items in original packaging can be returned within 7 days of delivery. See our Returns Policy for full details.',
  },
  {
    q: 'Is everything in stock that’s on the website?',
    a: 'We update stock in real time, but very high-demand items can sell out quickly. Out-of-stock items are clearly marked on the product page.',
  },
]

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 animate-on-scroll">
      <h2 className="font-display text-center text-3xl font-semibold text-black">Most Asked Questions</h2>

      <div className="mt-8 divide-y divide-brand-100 border-y border-brand-100">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-brand-900"
                aria-expanded={isOpen}
              >
                {item.q}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`shrink-0 text-brand-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && <p className="pb-4 text-sm leading-relaxed text-brand-600">{item.a}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
