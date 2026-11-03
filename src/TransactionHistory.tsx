import { useState } from "react";
import type { Transaction, Page } from "./types";

function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-[#4a7c6a]/10 text-[#4a7c6a] border border-[#4a7c6a]/30",
  pending: "bg-[#c8a96e]/10 text-[#c8a96e] border border-[#c8a96e]/30",
  processing: "bg-[#4a7c6a]/10 text-[#4a7c6a] border border-[#4a7c6a]/20",
};

interface Props {
  transactions: Transaction[];
  onBack: () => void;
  cartCount: number;
  onCartOpen: () => void;
  onNavigate: (page: Page) => void;
}

export default function TransactionHistory({ transactions, onBack, cartCount, onCartOpen, onNavigate }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  const filtered = transactions.filter((t) => filter === "all" || t.status === filter);
  const totalSpent = transactions.filter((t) => t.status === "completed").reduce((s, t) => s + t.total, 0);

  return (
    <div className="min-h-screen bg-[#f5f1e8] font-sans text-[#1a1a18]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#12302a]/95 backdrop-blur-md border-b border-[#4a7c6a]/20">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-[#f5f1e8]/50 hover:text-[#c8a96e] transition-colors text-sm flex items-center gap-1.5">← <span className="hidden sm:inline">Home</span></button>
            <span className="text-[#4a7c6a]/40">|</span>
            <button onClick={onBack} className="text-[#c8a96e] text-2xl font-display italic">PEPTEAS.NG</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("profile")} className="text-[#f5f1e8]/60 hover:text-[#c8a96e] text-xs hidden md:block transition-colors">Profile</button>
            <button onClick={() => onNavigate("products")} className="text-[#f5f1e8]/60 hover:text-[#c8a96e] text-xs hidden md:block transition-colors">Catalog</button>
            <button onClick={onCartOpen} className="relative text-[#f5f1e8]/80 hover:text-[#c8a96e] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.886-7.145a60.548 60.548 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#c8a96e] text-[#12302a] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="bg-[#12302a] py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-[#7aab97] text-xs tracking-widest uppercase mb-3">Account</div>
            <h1 className="font-display text-4xl text-[#f5f1e8] mb-6">Order History</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#1e4a3e]/60 border border-[#4a7c6a]/20 p-4">
                <div className="text-[#7aab97] text-[10px] tracking-widest uppercase mb-1">Total Orders</div>
                <div className="font-display text-2xl text-[#f5f1e8]">{transactions.length}</div>
              </div>
              <div className="bg-[#1e4a3e]/60 border border-[#4a7c6a]/20 p-4">
                <div className="text-[#7aab97] text-[10px] tracking-widest uppercase mb-1">Completed</div>
                <div className="font-display text-2xl text-[#f5f1e8]">{transactions.filter((t) => t.status === "completed").length}</div>
              </div>
              <div className="bg-[#1e4a3e]/60 border border-[#4a7c6a]/20 p-4">
                <div className="text-[#7aab97] text-[10px] tracking-widest uppercase mb-1">Total Spent</div>
                <div className="font-display text-2xl text-[#c8a96e]">{formatNaira(totalSpent)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Filter */}
          <div className="flex gap-2 mb-8">
            {(["all", "completed", "pending"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs px-4 py-2 border capitalize transition-colors ${filter === f ? "bg-[#12302a] border-[#12302a] text-[#c8a96e]" : "border-[#ede8da] text-[#9e9488] hover:border-[#12302a]/30"}`}>{f}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-[#12302a] font-display text-2xl mb-2">No orders yet</div>
              <p className="text-[#9e9488] text-sm mb-6">Orders you place will appear here.</p>
              <button onClick={() => onNavigate("products")} className="bg-[#12302a] text-[#f5f1e8] px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#1e4a3e] transition-colors">Browse Catalog</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((tx) => (
                <div key={tx.id} className="bg-white border border-[#ede8da] hover:border-[#c8a96e]/30 transition-colors">
                  <button
                    onClick={() => setExpanded(expanded === tx.id ? null : tx.id)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[#12302a] font-medium text-sm">{tx.id}</div>
                        <div className="text-[#9e9488] text-xs mt-0.5">{formatDate(tx.date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 ${STATUS_STYLES[tx.status]}`}>{tx.status}</span>
                      <div className="text-right">
                        <div className="font-semibold text-[#12302a]">{formatNaira(tx.total)}</div>
                        <div className="text-[#9e9488] text-xs">{tx.paymentMethod}</div>
                      </div>
                      <svg className={`w-4 h-4 text-[#9e9488] transition-transform ${expanded === tx.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </div>
                  </button>

                  {expanded === tx.id && (
                    <div className="border-t border-[#ede8da] px-5 pb-5 pt-4">
                      <div className="text-[#9e9488] text-[10px] tracking-widest uppercase mb-3">Items Ordered</div>
                      <div className="space-y-2">
                        {tx.items.map((item) => (
                          <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#ede8da] last:border-0">
                            <div>
                              <div className="text-[#12302a] text-sm font-medium">{item.name}</div>
                              <div className="text-[#9e9488] text-xs">{item.dose} · {item.qty} vial{item.qty > 1 ? "s" : ""}</div>
                            </div>
                            <div className="text-[#12302a] font-medium text-sm">{formatNaira(item.price * item.qty)}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#ede8da]">
                        <div>
                          <div className="text-[#9e9488] text-xs">Payment: <span className="text-[#12302a]">{tx.paymentMethod}</span></div>
                          <div className="text-[#9e9488] text-xs mt-0.5">COA included with each vial</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#9e9488] text-xs">Total</div>
                          <div className="font-semibold text-[#12302a]">{formatNaira(tx.total)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
