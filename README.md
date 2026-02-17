# Fiado App

A modern debt tracking and payment request app for small businesses and individuals in Brazil — inspired by [Tikkie](https://www.tikkie.me/) (the Netherlands' leading payment request platform).

## What is Fiado?

"Fiado" is a Brazilian term for selling on credit/tab — a common practice in small businesses where the shopkeeper trusts the customer to pay later. This app digitizes that trust.

## Vision

We're building the Brazilian Tikkie: a simple, fast, and delightful way to:

- Track debts owed to you (fiado)
- Send payment requests via WhatsApp/SMS with a single tap
- Let customers pay with a payment link (Pix, credit card, etc.)
- Get notified when you're paid
- See your full financial dashboard at a glance

## Current Features

- **Dashboard** — overview of total open debts, amount received, and top debtors
- **Customer management** — add and view customers with their phone numbers
- **Debt tracking** — record debts with description, amount, and date
- **Mark as paid** — quickly settle debts
- **Charge via WhatsApp** — send a pre-filled WhatsApp message to request payment

## Tech Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router v7](https://reactrouter.com/)
- [react-hot-toast](https://react-hot-toast.com/)
- LocalStorage for data persistence (MVP)

## Roadmap (Tikkie-inspired)

- [ ] Payment link generation (Pix QR code)
- [ ] SMS/WhatsApp payment request sending
- [ ] Customer-facing payment page
- [ ] Push notifications when paid
- [ ] Transaction history & receipts
- [ ] Multi-user / business accounts
- [ ] Analytics & reports

## Getting Started

```bash
npm install
npm run dev
```

## Contributing

This project is in early MVP stage. PRs and ideas are welcome!
