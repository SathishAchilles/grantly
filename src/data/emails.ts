/** A message in a student's mailbox. */
export interface Email {
  id: string
  studentId: string
  from: string
  subject: string
  receivedOn: string
  body: string
}

/** The fixed mailbox returned by the simulated Gmail fetch. Every sender is fictional. */
export const mailbox: Email[] = [
  {
    id: 'meera-nsp-returned',
    studentId: 'meera',
    from: 'alerts@nsp-mail.example.org',
    subject: 'Application returned for correction',
    receivedOn: '2026-11-05',
    body: 'Your PM-USP CSSS renewal application for 2026-27 has been returned. Please provide current academic-year enrolment evidence.',
  },
  {
    id: 'meera-letter-ready',
    studentId: 'meera',
    from: 'scholarship-cell@lakeview.example.org',
    subject: 'Your enrolment letter for 2026-27 is ready',
    receivedOn: '2026-11-07',
    body: 'Your enrolment letter for academic year 2026-27 has been issued by the scholarship cell. Use it for your PM-USP CSSS renewal correction.',
  },
  {
    id: 'meera-campus-fest',
    studentId: 'meera',
    from: 'events@lakeview.example.org',
    subject: 'Campus fest this weekend',
    receivedOn: '2026-11-07',
    body: 'Join us for music and food on Saturday evening.',
  },
  {
    id: 'arjun-ecss-received',
    studentId: 'arjun',
    from: 'ecss-support@example.org',
    subject: 'HDFC ECSS UG 2026-27: application received',
    receivedOn: '2026-11-06',
    body: 'We have received your application for the HDFC Bank Parivartan ECSS programme (UG) 2026-27. Reference ECSS-UG-0412.',
  },
  {
    id: 'arjun-ecss-interview',
    studentId: 'arjun',
    from: 'ecss-support@example.org',
    subject: 'HDFC ECSS: shortlisted for interview on 20 Nov 2026',
    receivedOn: '2026-11-07',
    body: 'Congratulations, you have been shortlisted. Your personal interview is on 20 Nov 2026 at 11:00 am, online.',
  },
  {
    id: 'arjun-fee-waiver',
    studentId: 'arjun',
    from: 'accounts@deccan.example.org',
    subject: 'Merit fee waiver of ₹20,000 approved',
    receivedOn: '2026-11-07',
    body: 'Your merit fee waiver of ₹20,000 for 2026-27 has been approved and will be applied to your semester fee.',
  },
  {
    id: 'arjun-prize',
    studentId: 'arjun',
    from: 'prize-desk@example.org',
    subject: 'You won a scholarship! Pay ₹499 processing fee',
    receivedOn: '2026-11-07',
    body: 'Claim your ₹50,000 scholarship today. Pay a ₹499 processing fee to release it.',
  },
]
