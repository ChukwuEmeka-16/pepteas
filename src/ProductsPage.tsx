import { useState } from "react";
import type { Product, CartItem, Page } from "./types";
import { CATEGORIES, CATEGORY_ICONS } from "./data";
import { useAuth } from "app/_components/AuthListener";

function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function ProductCard({ product, prices, onAdd }: { product: Product; prices: Record<string, number>; onAdd: (item: CartItem) => void }) {
  const [selectedDose, setSelectedDose] = useState(product.variants[0].dose);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  
  const variant = product.variants.find((v) => v.dose === selectedDose)!;
  const price = prices[`${product.id}_${selectedDose}`] ?? variant.price;

  function handleAdd() {
    onAdd({ key: `${product.id}_${selectedDose}`, productId: product.id, name: product.name, dose: selectedDose, price, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="bg-white border border-[#ede8da] hover:border-[#c8a96e]/40 transition-all duration-200 flex flex-col group">
      <div className="bg-[#12302a] px-4 py-2 flex items-center justify-between">
        <span className="text-[#7aab97] text-[9px] tracking-widest uppercase">{product.category}</span>
        <span className="text-[#c8a96e]/60 text-[10px]">{CATEGORY_ICONS[product.category]}</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-xl text-[#12302a] mb-2 leading-tight">{product.name}</h3>
        <p className="text-[#9e9488] text-xs leading-relaxed mb-4 flex-1">{product.description}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {product.tags.map((t) => (
            <span key={t} className="text-[9px] border border-[#4a7c6a]/25 text-[#4a7c6a] px-1.5 py-0.5">{t}</span>
          ))}
        </div>

        {/* Dose selector */}
        {product.variants.length > 1 ? (
          <div className="mb-3">
            <div className="text-[#9e9488] text-[10px] uppercase tracking-widest mb-1.5">Select Dose / Size</div>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((v) => {
                const p = prices[`${product.id}_${v.dose}`] ?? v.price;
                return (
                  <button
                    key={v.dose}
                    onClick={() => setSelectedDose(v.dose)}
                    className={`text-xs px-2.5 py-1.5 border transition-colors flex flex-col items-center gap-0.5 ${selectedDose === v.dose ? "bg-[#12302a] border-[#12302a] text-[#c8a96e]" : "border-[#ede8da] text-[#9e9488] hover:border-[#12302a]/30"}`}
                  >
                    <span className="font-medium">{v.dose}</span>
                    <span className={`text-[9px] ${selectedDose === v.dose ? "text-[#c8a96e]/70" : "text-[#9e9488]/70"}`}>{formatNaira(p)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <div className="text-[#9e9488] text-[10px] uppercase tracking-widest mb-1">Size</div>
            <span className="inline-block bg-[#ede8da] text-[#9e9488] text-xs px-2.5 py-1 font-mono">{product.variants[0].dose}</span>
          </div>
        )}

        {/* Qty selector */}
        <div className="mb-4">
          <div className="text-[#9e9488] text-[10px] uppercase tracking-widest mb-1.5">Quantity (Vials)</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 border border-[#ede8da] text-[#9e9488] hover:border-[#c8a96e] hover:text-[#12302a] flex items-center justify-center transition-colors text-base leading-none">−</button>
            <span className="text-[#12302a] font-semibold text-sm w-8 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-8 h-8 border border-[#ede8da] text-[#9e9488] hover:border-[#c8a96e] hover:text-[#12302a] flex items-center justify-center transition-colors text-base leading-none">+</button>
            <span className="text-[#9e9488] text-xs">{qty === 1 ? "1 vial" : `${qty} vials`}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ede8da] flex items-end justify-between mb-3">
          <div>
            <div className="font-semibold text-xl text-[#12302a]">{formatNaira(price * qty)}</div>
            {qty > 1 && <div className="text-[#9e9488] text-[10px]">{formatNaira(price)} per vial</div>}
            <div className="text-[#9e9488] text-[10px]">Research grade · COA included</div>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className={`w-full py-2.5 text-xs tracking-widest uppercase transition-all duration-300 ${added ? "bg-[#4a7c6a] text-white" : "bg-[#12302a] text-[#f5f1e8] hover:bg-[#1e4a3e]"}`}
        >
          {added ? "Added to Cart ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

interface Props {
  products: Product[];
  prices: Record<string, number>;
  onAddToCart: (item: CartItem) => void;
  cartCount: number;
  cart:any[];
  cartTotal:number;
  checkoutStep:string
  setCheckoutStep:(step:string) => void;
  onCartOpen: () => void;
  onBack: () => void;
  removeFromCart: (item:CartItem,key:string) => void;
  onNavigate: (page: Page) => void;
}

export default function ProductsPage({ products,cart,checkoutStep,cartTotal, prices, onAddToCart,removeFromCart, cartCount, onBack, onNavigate,setCheckoutStep }: any) {
  const {userState} = useAuth();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");
  const [cartOpen,setCartOpen] = useState(false)

  const filtered = products
    .filter((p:any) => category === "All" || p.category === category)
    .filter((p:any) => search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t:any) => t.toLowerCase().includes(search.toLowerCase())))
    .sort((a:any, b:any) => {
      if (sort === "asc") return a.variants[0].price - b.variants[0].price;
      if (sort === "desc") return b.variants[0].price - a.variants[0].price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#f5f1e8] font-sans text-[#1a1a18]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#12302a]/95 backdrop-blur-md border-b border-[#4a7c6a]/20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-[#f5f1e8]/50 hover:text-[#c8a96e] transition-colors text-sm flex items-center gap-1.5">← <span className="hidden sm:inline">Home</span></button>
            <span className="text-[#4a7c6a]/40">|</span>
            <button onClick={onBack} className="text-[#c8a96e] text-2xl font-display italic">PEPTEAS.NG</button>
          </div>
          <div className="flex items-center gap-3">
            {userState?.id && <button onClick={() => onNavigate("profile")} className="text-[#f5f1e8]/60 hover:text-[#c8a96e] transition-colors hidden md:block" title="Profile">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </button>
            }
            {userState?.id &&<button onClick={() => onNavigate("history")} className="text-[#f5f1e8]/60 hover:text-[#c8a96e] transition-colors hidden md:block" title="Orders">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
            </button>
            }
            <button onClick={()=>setCartOpen(true)} className="relative text-[#f5f1e8]/80 hover:text-[#c8a96e] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.886-7.145a60.548 60.548 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#c8a96e] text-[#12302a] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-[#12302a] pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-[#7aab97] text-xs tracking-widest uppercase mb-3">Research Catalog</div>
          <h1 className="font-display text-5xl md:text-6xl text-[#f5f1e8] mb-4">Full <em className="text-[#c8a96e]">Peptide</em> Catalog</h1>
          <p className="text-[#f5f1e8]/50 text-sm max-w-lg">{products.length} research-grade compounds — all third-party tested, cold-chain shipped. Select dose and quantity per vial before adding to cart.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-[#ede8da] border-b border-[#d9d2c3]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9488]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input type="text" placeholder="Search peptides..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d9d2c3] text-sm text-[#12302a] placeholder-[#9e9488] focus:outline-none focus:border-[#c8a96e]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9e9488] text-xs">Sort:</span>
            {(["default", "asc", "desc"] as const).map((s) => (
              <button key={s} onClick={() => setSort(s)} className={`text-xs px-3 py-1.5 border transition-colors ${sort === s ? "border-[#c8a96e] bg-[#c8a96e]/10 text-[#c8a96e]" : "border-[#d9d2c3] text-[#9e9488] hover:border-[#c8a96e]/40"}`}>
                {s === "default" ? "Featured" : s === "asc" ? "Price ↑" : "Price ↓"}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-4 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 border transition-colors ${category === cat ? "bg-[#12302a] border-[#12302a] text-[#c8a96e]" : "border-[#d9d2c3] text-[#9e9488] hover:border-[#12302a]/30 hover:text-[#12302a]"}`}>
              <span>{CATEGORY_ICONS[cat]}</span>{cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-[#9e9488] text-xs mb-6">Showing {filtered.length} of {products.length} products</div>
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[#9e9488] text-sm">No products match your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p:any) => <ProductCard key={p.id} product={p} prices={prices} onAdd={onAddToCart} />)}
          </div>
        )}
      </div>
 
      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative bg-[#f5f1e8] w-full max-w-md flex flex-col h-full shadow-2xl">
            <div className="p-6 border-b border-[#ede8da] flex items-center justify-between bg-[#12302a]">
              <h2 className="font-display text-xl text-[#f5f1e8]">
                {checkoutStep === "cart" ? "Your Cart" : checkoutStep === "payment" ? "Payment" : "Order Confirmed"}
              </h2>
              <button onClick={() => setCartOpen(false)} className="text-[#f5f1e8]/60 hover:text-[#f5f1e8]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {checkoutStep === "cart" && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-20 text-[#9e9488] text-sm">Your cart is empty</div>
                  ) : cart.map((item:any) => (
                    <div key={item.key} className="flex items-center justify-between bg-white border border-[#ede8da] p-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#12302a]">{item.name}</div>
                        <div className="text-[#9e9488] text-xs mt-0.5">{item.dose} · {item.qty} vial{item.qty > 1 ? "s" : ""}</div>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <span className="font-semibold text-[#12302a] text-sm">{formatNaira(item.price * item.qty)}</span>
                        <button onClick={() => removeFromCart(item,item.key)} className="text-[#9e9488] hover:text-red-500 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                {cart.length > 0 && (
                  <div className="p-6 border-t border-[#ede8da]">
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-[#9e9488]">Subtotal</span>
                      <span className="font-semibold text-[#12302a]">{formatNaira(cartTotal)}</span>
                    </div>
                    <button onClick={() => setCheckoutStep("payment")} className="w-full bg-[#12302a] text-[#f5f1e8] py-3.5 text-xs tracking-widest uppercase hover:bg-[#1e4a3e] transition-colors">Proceed to Payment</button>
                  </div>
                )}
              </>
            )}
            {
              checkoutStep === "payment" &&(
                <>
                <div className="flex-1 overflow-y-auto p-6">
                  <p>Bank name: GT Bank</p>
                  <p>Account number: 0026141689</p>
                  <p>Account name: HAPPINESS ASIKARO</p>
                  <p> Please send the receipt of transfer to our whatsapp number: +234 8038708706</p>
                </div>
                </>
              )
            }
            

           
          </div>
        </div>
      )}

      <div className="bg-[#12302a] py-8 mt-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-8 justify-center">
          {["Third-Party COA on Every Batch", "Cold-Chain 48hr Shipping", "99.2% Average Purity", "Crypto Payments — 5% Off"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-[#f5f1e8]/50 text-xs"><span className="text-[#c8a96e]">✦</span>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
