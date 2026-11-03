import type { Product } from "./types";

// export const MOCK_USERS: MockUser[] = [
//   {
//     id: "usr_001",
//     role: "user",
//     profile: {
//       firstName: "Adaeze",
//       lastName: "Okafor",
//       email: "adaeze.okafor@gmail.com",
//       phone: "+234 803 456 7890",
//       address: "14 Bourdillon Road, Ikoyi",
//       city: "Lagos",
//       state: "Lagos",
//       country: "Nigeria",
//       dateOfBirth: "1990-04-12",
//       registeredAt: "2025-11-03T09:22:00Z",
//     },
//     cart: [
//       { key: "bpc-157_10mg", productId: "bpc-157", name: "BPC-157", dose: "10mg", price: 180000, qty: 2 },
//       { key: "epithalon_10mg", productId: "epithalon", name: "Epithalon", dose: "10mg", price: 200000, qty: 1 },
//     ],
//     transactions: [
//       {
//         id: "TXN-20251103-001",
//         date: "2025-11-03T10:15:00Z",
//         items: [{ key: "nad-plus_1000mg", productId: "nad-plus", name: "NAD+", dose: "1000mg", price: 150000, qty: 2 }],
//         total: 300000,
//         paymentMethod: "Visa",
//         status: "completed",
//       },
//     ],
//   },
//   {
//     id: "usr_002",
//     role: "user",
//     profile: {
//       firstName: "Emeka",
//       lastName: "Nwosu",
//       email: "emeka.nwosu@proton.me",
//       phone: "+234 706 123 4567",
//       address: "7 Yakubu Gowon Way",
//       city: "Abuja",
//       state: "FCT",
//       country: "Nigeria",
//       dateOfBirth: "1985-08-22",
//       registeredAt: "2025-12-14T14:50:00Z",
//     },
//     cart: [
//       { key: "tirzepatide_20mg", productId: "tirzepatide", name: "Tirzepatide", dose: "20mg", price: 200000, qty: 1 },
//       { key: "glutathione_1500mg", productId: "glutathione", name: "Glutathione", dose: "1500mg", price: 150000, qty: 3 },
//     ],
//     transactions: [
//       {
//         id: "TXN-20251214-001",
//         date: "2025-12-14T15:30:00Z",
//         items: [
//           { key: "tirzepatide_10mg", productId: "tirzepatide", name: "Tirzepatide", dose: "10mg", price: 150000, qty: 1 },
//           { key: "tesamorelin_10mg", productId: "tesamorelin", name: "Tesamorelin", dose: "10mg", price: 180000, qty: 1 },
//         ],
//         total: 330000,
//         paymentMethod: "Bitcoin",
//         status: "completed",
//       },
//       {
//         id: "TXN-20260102-001",
//         date: "2026-01-02T09:00:00Z",
//         items: [{ key: "retatrutide_10mg", productId: "retatrutide", name: "Retatrutide", dose: "10mg", price: 250000, qty: 1 }],
//         total: 250000,
//         paymentMethod: "USDC",
//         status: "completed",
//       },
//     ],
//   },
//   {
//     id: "usr_003",
//     role: "user",
//     profile: {
//       firstName: "Fatima",
//       lastName: "Al-Hassan",
//       email: "fatima.alhassan@yahoo.com",
//       phone: "+234 811 987 6543",
//       address: "22 Ring Road, GRA",
//       city: "Kano",
//       state: "Kano",
//       country: "Nigeria",
//       dateOfBirth: "1995-01-30",
//       registeredAt: "2026-01-18T11:05:00Z",
//     },
//     cart: [
//       { key: "glow_70mg", productId: "glow", name: "GLOW", dose: "70mg", price: 180000, qty: 2 },
//       { key: "snap8_topical", productId: "snap8", name: "SNAP-8", dose: "Topical", price: 180000, qty: 1 },
//       { key: "ghk-cu_100mg", productId: "ghk-cu", name: "GHK-Cu", dose: "100mg", price: 150000, qty: 1 },
//     ],
//     transactions: [],
//   },
//   {
//     id: "usr_004",
//     role: "user",
//     profile: {
//       firstName: "Chidi",
//       lastName: "Eze",
//       email: "chidi.eze@company.ng",
//       phone: "+234 909 234 5678",
//       address: "3 Trans-Amadi Road",
//       city: "Port Harcourt",
//       state: "Rivers",
//       country: "Nigeria",
//       dateOfBirth: "1978-06-15",
//       registeredAt: "2026-02-05T08:30:00Z",
//     },
//     cart: [
//       { key: "fox04-dri_standard", productId: "fox04-dri", name: "FOX04-DRI", dose: "Standard", price: 300000, qty: 1 },
//       { key: "wolverine-stack_standard", productId: "wolverine-stack", name: "Wolverine Stack", dose: "Standard", price: 200000, qty: 1 },
//     ],
//     transactions: [
//       {
//         id: "TXN-20260205-001",
//         date: "2026-02-05T09:15:00Z",
//         items: [{ key: "epithalon_40mg", productId: "epithalon", name: "Epithalon", dose: "40mg", price: 300000, qty: 2 }],
//         total: 600000,
//         paymentMethod: "Ethereum",
//         status: "completed",
//       },
//     ],
//   },
// ];

export const CATEGORY_ICONS: Record<string, string> = {
  "All": "◈",
  "GLP-1 / Metabolic": "⬡",
  "Growth Hormone": "↑",
  "Longevity": "∞",
  "Fat Loss": "◎",
  "Recovery": "✦",
  "Skin & Beauty": "✿",
  "Vitality": "◉",
  "Antioxidants": "❋",
  "Stacks": "⊕",
};

export const CATEGORIES = ["All", "GLP-1 / Metabolic", "Growth Hormone", "Longevity", "Fat Loss", "Recovery", "Skin & Beauty", "Vitality", "Antioxidants", "Stacks"];
