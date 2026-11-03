"use client";

import { useEffect, useState } from "react";
import type { CartItem, Transaction, UserProfile, Page, Product } from "./types";
import ProductsPage from "./ProductsPage";
import ProfilePage from "./ProfilePage";
import TransactionHistory from "./TransactionHistory";
import AdminPanel from "./AdminPanel";
import { useRouter } from "next/navigation";
import { arrayRemove, arrayUnion, collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "firebase/firebase";
import { useAuth } from "app/_components/AuthListener";
import { signOut } from "firebase/auth";

const HOMEPAGE_FEATURED = ["bpc-157", "epithalon", "tirzepatide", "ghk-cu"];

const PAYMENT_METHODS = [
  { name: "Visa / Mastercard", icon: "💳", desc: "All major credit & debit cards" },
  { name: "Bitcoin", icon: "₿", desc: "BTC — 5% discount applied" },
  { name: "Ethereum", icon: "Ξ", desc: "ETH — 5% discount applied" },
  { name: "USDC / USDT", icon: "◎", desc: "Stablecoins accepted" },
  { name: "Monero", icon: "ɱ", desc: "XMR — Maximum privacy" },
  { name: "Bank Transfer", icon: "🏦", desc: "ACH & wire transfer" },
];

const TESTIMONIALS = [
  { name: "Dr. Mara Levenson", title: "Functional Medicine Physician", text: "PEPTEAS.NG sets the bar for transparency and purity in the research peptide space. My patients consistently report measurable improvements within the first cycle.", avatar: "ML" },
  { name: "James Okonkwo", title: "Competitive Powerlifter", text: "BPC-157 got me back on the platform 6 weeks after a grade II shoulder tear. The certificate of analysis gave me full confidence in what I was putting in my body.", avatar: "JO" },
  { name: "Sofia Hernandez", title: "Biohacker & Wellness Coach", text: "I've sourced peptides from 8 different suppliers. PEPTEAS.NG is the only one I recommend to clients — purity reports, cold-chain shipping, and exceptional service.", avatar: "SH" },
];

// const TRUST_STATS = [
//   { value: "99.2%", label: "Average Peptide Purity" },
//   { value: "12,400+", label: "Verified Customers" },
//   { value: "Third-Party", label: "COA Testing on Every Batch" },
//   { value: "48hr", label: "Cold-Chain Shipping" },
// ];

function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#4a7c6a]/20 hover:border-[#c8a96e]/30 transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full text-left flex items-center justify-between p-5 text-[#f5f1e8] text-sm font-medium">
        <span>{q}</span>
        <span className={`text-[#c8a96e] transition-transform duration-200 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <div className="px-5 pb-5 text-[#f5f1e8]/50 text-xs leading-relaxed border-t border-[#4a7c6a]/10 pt-4">{a}</div>}
    </div>
  );
}

function FeaturedProductCard({ product, prices, onAdd }: { product: Product; prices: Record<string, number>; onAdd: (item: CartItem) => void }) {
  const [selectedDose, setSelectedDose] = useState(product.variants[0].dose);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.dose === selectedDose)!;
  const price = prices[`${product.id}_${selectedDose}`] ?? variant.price;

  function handleAdd() {
    onAdd({ key: `${product.id}_${selectedDose}`, productId: product.id, name: product.name, dose: selectedDose, price, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="bg-white border border-[#ede8da] hover:border-[#c8a96e]/40 transition-all duration-300 flex flex-col group">
      <div className="relative overflow-hidden bg-[#ede8da] h-48">
        <div className="w-full h-full bg-gradient-to-br from-[#1e4a3e] to-[#12302a] flex items-center justify-center">
          <span className="font-display italic text-[#c8a96e] text-3xl">{product.name.charAt(0)}</span>
        </div>
        <span className="absolute top-3 left-3 bg-[#c8a96e] text-[#12302a] text-[10px] tracking-widest uppercase px-2.5 py-1 font-semibold">
          {product.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="text-[#4a7c6a] text-[10px] tracking-widest uppercase mb-1">{product.category}</div>
        <h3 className="font-display text-xl text-[#12302a] mb-2">{product.name}</h3>
        <p className="text-[#9e9488] text-xs leading-relaxed mb-4 flex-1">{product.description}</p>

        {/* Dose selector */}
        {product.variants.length > 1 && (
          <div className="mb-3">
            <div className="text-[#9e9488] text-[10px] uppercase tracking-widest mb-1.5">Select Dose</div>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((v) => (
                <button
                  key={v.dose}
                  onClick={() => setSelectedDose(v.dose)}
                  className={`text-xs px-3 py-1 border transition-colors ${selectedDose === v.dose ? "bg-[#12302a] border-[#12302a] text-[#c8a96e]" : "border-[#ede8da] text-[#9e9488] hover:border-[#12302a]/30"}`}
                >
                  {v.dose}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Qty selector */}
        <div className="mb-4">
          <div className="text-[#9e9488] text-[10px] uppercase tracking-widest mb-1.5">Vials</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-7 h-7 border border-[#ede8da] text-[#9e9488] hover:border-[#c8a96e] hover:text-[#12302a] text-sm flex items-center justify-center transition-colors">−</button>
            <span className="text-[#12302a] font-medium text-sm w-8 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-7 h-7 border border-[#ede8da] text-[#9e9488] hover:border-[#c8a96e] hover:text-[#12302a] text-sm flex items-center justify-center transition-colors">+</button>
            <span className="text-[#9e9488] text-xs ml-1">{qty > 1 ? `${qty} vials` : "1 vial"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-semibold text-lg text-[#12302a]">{formatNaira(price * qty)}</span>
            {qty > 1 && <span className="text-[#9e9488] text-xs ml-2">{formatNaira(price)} each</span>}
          </div>
          <span className="text-[#9e9488] text-xs">{selectedDose}</span>
        </div>
        <button
          onClick={handleAdd}
          className={`w-full py-2.5 text-xs tracking-widest uppercase transition-all duration-300 ${added ? "bg-[#4a7c6a] text-white" : "bg-[#12302a] text-[#f5f1e8] hover:bg-[#1e4a3e]"}`}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const {userState} = useAuth();

  const [page, setPage] = useState<Page>("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "payment" | "confirm">("cart");
  const [selectedPayment, setSelectedPayment] = useState("Visa / Mastercard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
  const [transactions, setTransactions] = useState<Transaction[]>([]);
 

 



  const [products, setProducts] = useState<Product[]>([]);
  // Editable prices: key = productId_dose
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => p.variants.forEach((v) => { map[`${p.id}_${v.dose}`] = v.price; }));
    return map;
  });
  

 // const [mockUsers] = useState(MOCK_USERS);

  const cartCount = userState?.cart?.reduce((s:any, i:any) => s + i.qty, 0);
  const cartTotal = userState?.cart?.reduce((s:any, i:any) => s + i.price * i.qty, 0);
  const cryptoDiscount = ["Bitcoin", "Ethereum", "USDC / USDT", "Monero"].includes(selectedPayment);
  const finalTotal = cryptoDiscount ? cartTotal * 0.95 : cartTotal;

  const featuredProducts = products.filter((p) => HOMEPAGE_FEATURED.includes(p.id));

  async function addToCart(item: CartItem) {
    if (!userState.id) {
      alert('sign in to add items to your cart')
      return
    }

    try {
      const userRef = doc(db,"users",userState.id)
      await updateDoc(userRef,{cart:arrayUnion(item)})
      .then(()=>{
        setCartOpen(true);
        setCheckoutStep("cart");
      })
    } catch (error) {
      alert('error adding item')
    }


  }

  async function removeFromCart(item:CartItem,key:string) {
    if (!userState.id) {
      alert('sign in to remove items in your cart')
      return
    }

    try {
      const userRef = doc(db,"users",userState.id)
      await updateDoc(userRef,{cart:arrayRemove(item)})
      .then(()=>{
        setCartOpen(true);
        setCheckoutStep("cart");
      })
    } catch (error) {
      alert('error removing item')
    }



  }

  function confirmOrder() {
    const tx: Transaction = {
      id: `TXN-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...userState.cart],
      total: finalTotal,
      paymentMethod: selectedPayment,
      status: "completed",
    };
    setTransactions((prev) => [tx, ...prev]);
    setCheckoutStep("confirm");
  }

  function updatePrice(key: string, value: number) {
    setPrices((prev) => ({ ...prev, [key]: value }));
    const [productId, dose] = key.split("_");
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, variants: p.variants.map((v) => (v.dose === dose ? { ...v, price: value } : v)) }
          : p
      )
    );
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  }
  
  const router = useRouter();

  const navLinks = [
    { label: "Products", action: () => scrollTo("featured") },
    { label: "Science", action: () => scrollTo("science") },
    { label: "Testimonials", action: () => scrollTo("testimonials") },
    { label: "FAQ", action: () => scrollTo("faq") },
    { label: "Full Catalog", action: () => setPage("products"), highlight: true },
  ];


  
  const getProducts = async()=>{
    const collectionRef = collection(db,"products")
    const data :any= []
    await getDocs(collectionRef).then((result)=>{
      result.forEach((item)=>{
        data.push(item.data())
      })
      setProducts(data)
    }).catch(err=>console.log(err))
    
  }

  useEffect(()=>{
   
    getProducts();
      
  

  },[userState])
  
  
  const logOut = async() =>{
    const confirmed = window.confirm("Are you sure you want to log out?")
    if(!confirmed) return

    await signOut(auth).then(()=>{
      alert('logged out')
      localStorage.removeItem("auth")
    })
    .catch(err=>alert(err));
  }
   

  if (page === "products") {
    return <ProductsPage cart={userState.cart} cartTotal={cartTotal} checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} removeFromCart={removeFromCart}  products={products} prices={prices} onAddToCart={addToCart} cartCount={cartCount} onCartOpen={() => { setCartOpen(true); setCheckoutStep("cart"); }} onBack={() => setPage("home")} onNavigate={setPage} />;
  }
  if (page === "profile") {
    return <ProfilePage cart={userState.cart} cartTotal={cartTotal} checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} removeFromCart={removeFromCart} onBack={() => setPage("home")} cartCount={cartCount}  onNavigate={setPage} />;
  }
  if (page === "history") {
    return <TransactionHistory transactions={transactions} onBack={() => setPage("home")} cartCount={cartCount} onCartOpen={() => { setCartOpen(true); }} onNavigate={setPage} />;
  }
  if (page === "admin") {
    return <AdminPanel products={products} prices={prices} onUpdatePrice={updatePrice}  onBack={() => setPage("home")} onNavigate={setPage} />;
  }




  return (
    <div className="min-h-full bg-[#f5f1e8] font-sans text-[#1a1a18]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#12302a]/95 backdrop-blur-md border-b border-[#4a7c6a]/20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <button onClick={() => setPage("home")} className="flex items-center gap-2">
            <span className="text-[#c8a96e] text-2xl font-display italic">PEPTEAS.NG</span>
            <span className="text-[#7aab97] text-xs tracking-[0.15em] uppercase hidden sm:block">Science. Purity. Wellness.</span>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#f5f1e8]/80">
            {navLinks.map((l) => (
              <button key={l.label} onClick={l.action} className={`hover:text-[#c8a96e] transition-colors ${l.highlight ? "text-[#c8a96e] font-medium" : ""}`}>{l.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {userState?.id ? (
              <>
                <button onClick={() => setPage("profile")} className="hidden md:flex items-center gap-2 text-[#f5f1e8]/70 hover:text-[#c8a96e] transition-colors" title="Profile">
                  <div className="w-7 h-7 bg-[#c8a96e] text-[#12302a] flex items-center justify-center text-xs font-bold">
                    {userState.firstName ? userState.firstName[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-xs">{userState.firstName || "Account"}</span>
                </button>
                <button onClick={() => setPage("history")} className="text-[#f5f1e8]/60 hover:text-[#c8a96e] transition-colors hidden md:block" title="Orders">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                </button>
                <button
                  onClick={logOut}
                  className="text-[#f5f1e8]/40 hover:text-[#c8a96e] text-xs hidden md:block transition-colors"
                  title="Sign out"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => router.push('/authentication')} className="text-[#f5f1e8]/70 hover:text-[#c8a96e] text-sm transition-colors">Sign in</button>
                <button onClick={() => router.push('/authentication')} className="bg-[#c8a96e] text-[#12302a] px-4 py-1.5 text-xs tracking-widest uppercase font-semibold hover:bg-[#e2c990] transition-colors">Register</button>
              </div>
            )}
            <button onClick={() => { setCartOpen(true); setCheckoutStep("cart"); }} className="relative text-[#f5f1e8]/80 hover:text-[#c8a96e] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.886-7.145a60.548 60.548 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#c8a96e] text-[#12302a] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
            <button className="md:hidden text-[#f5f1e8]/80" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"} /></svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#12302a] border-t border-[#4a7c6a]/20 px-6 py-4 flex flex-col gap-3 text-sm text-[#f5f1e8]/80">
            
            {navLinks.map((l) => <button key={l.label} onClick={l.action} className={`text-left hover:text-[#c8a96e] transition-colors ${l.highlight ? "text-[#c8a96e]" : ""}`}>{l.label}</button>)}
            {userState?.id  ? (
              <>
                <button onClick={() => { setPage("profile"); setMobileMenuOpen(false); }} className="text-left hover:text-[#c8a96e]">Profile</button>
                <button onClick={() => { setPage("history"); setMobileMenuOpen(false); }} className="text-left hover:text-[#c8a96e]">Order History</button>
                <button onClick={logOut} className="text-left text-[#f5f1e8]/40 hover:text-[#c8a96e]">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => { router.push('/authentication'); setMobileMenuOpen(false); }} className="text-left hover:text-[#c8a96e]">Sign In</button>
                <button onClick={() => { router.push('/authentication'); setMobileMenuOpen(false); }} className="text-left text-[#c8a96e]">Create Account →</button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="hero" className="relative min-h-screen bg-[#12302a] overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1602052577122-f73b9710adba?w=1600&h=900&fit=crop&auto=format)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12302a] via-[#12302a]/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 grid md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#4a7c6a]/30 border border-[#4a7c6a]/50 rounded-full px-4 py-1.5 text-[#7aab97] text-xs tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 bg-[#c8a96e] rounded-full animate-pulse" />
              Third-Party Tested · 99.2% Purity
            </div>
           
            <h1 className="font-display text-5xl md:text-7xl text-[#f5f1e8] leading-[1.05] mb-6">
              Precision<br /><em className="text-[#c8a96e]">Peptide</em><br />Wellness
            </h1>
            <p className="text-[#f5f1e8]/70 text-lg leading-relaxed max-w-lg mb-10">
              Research-grade peptides, rigorously tested, cold-chain delivered. Every batch comes with a Certificate of Analysis — because what you put in your body should never be a mystery.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => scrollTo("featured")} className="bg-[#c8a96e] text-[#12302a] px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#e2c990] transition-colors">Shop Peptides</button>
              <button onClick={() => setPage("products")} className="border border-[#4a7c6a] text-[#f5f1e8]/80 px-8 py-3.5 text-sm hover:border-[#c8a96e] hover:text-[#c8a96e] transition-colors">Full Catalog →</button>
            </div>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1656331797721-b593b8f00297?w=480&h=560&fit=crop&auto=format" alt="Molecular peptide structure" className="w-80 h-96 object-cover opacity-60" />
              <div className="absolute bottom-6 left-6 right-6 bg-[#12302a]/90 backdrop-blur border border-[#4a7c6a]/40 p-4">
                <div className="text-[#c8a96e] text-xs tracking-widest uppercase mb-1">Purity Verified</div>
                <div className="text-[#f5f1e8] font-display text-2xl">99.2% avg</div>
                <div className="text-[#f5f1e8]/50 text-xs mt-1">HPLC tested · every batch</div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="absolute bottom-0 left-0 right-0 bg-[#1e4a3e]/80 backdrop-blur border-t border-[#4a7c6a]/20">
          <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl text-[#c8a96e]">{s.value}</div>
                <div className="text-[#f5f1e8]/50 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div> */}
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-24 bg-[#f5f1e8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14 flex items-end justify-between flex-wrap gap-6">
            <div>
              <div className="text-[#4a7c6a] text-xs tracking-widest uppercase mb-3">Featured</div>
              <h2 className="font-display text-4xl md:text-5xl text-[#12302a]">Our Peptide<br /><em>Collection</em></h2>
            </div>
            <button onClick={() => setPage("products")} className="bg-[#12302a] text-[#c8a96e] px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-[#1e4a3e] transition-colors">
              View All 21 Compounds →
            </button>
            
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (

              <FeaturedProductCard key={p.id} product={p} prices={prices} onAdd={addToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* Science */}
      <section id="science" className="py-24 bg-[#12302a]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[#7aab97] text-xs tracking-widest uppercase mb-4">Our Standards</div>
            <h2 className="font-display text-4xl md:text-5xl text-[#f5f1e8] mb-6">Purity you can<br /><em className="text-[#c8a96e]">verify yourself</em></h2>
            <p className="text-[#f5f1e8]/60 text-base leading-relaxed mb-10">Every batch undergoes HPLC-MS verification by an accredited third-party laboratory. We publish the full Certificate of Analysis — not just a summary — so you can audit our work.</p>
            <div className="space-y-4">
              {[
                { icon: "🔬", title: "HPLC-MS Verification", desc: "High-performance liquid chromatography on every production run" },
                { icon: "❄️", title: "Cold-Chain Shipping", desc: "Lyophilized peptides shipped with dry ice within 48 hours" },
                { icon: "📄", title: "Full COA Published", desc: "QR code on every vial links to the third-party lab report" },
                { icon: "🔐", title: "GMP-Adjacent Synthesis", desc: "Produced in ISO-certified facilities with traceable raw materials" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start border border-[#4a7c6a]/20 p-4 hover:border-[#c8a96e]/30 transition-colors">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-[#f5f1e8] font-medium text-sm mb-1">{item.title}</div>
                    <div className="text-[#f5f1e8]/40 text-xs leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=640&h=720&fit=crop&auto=format" alt="Scientist working in laboratory" className="w-full h-[500px] object-cover opacity-80" />
            <div className="absolute top-6 right-6 bg-[#c8a96e] p-5 w-40 text-center">
              <div className="font-display text-3xl text-[#12302a]">99.2%</div>
              <div className="text-[#12302a]/70 text-[10px] tracking-widest uppercase mt-1">Average Purity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className="py-20 bg-[#ede8da]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-[#4a7c6a] text-xs tracking-widest uppercase mb-3">Checkout Options</div>
            <h2 className="font-display text-4xl text-[#12302a]">Pay your way —<br /><em>including crypto</em></h2>
            <p className="text-[#9e9488] mt-4 text-sm">Crypto payments receive an automatic 5% discount. Maximum privacy with Monero.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PAYMENT_METHODS.map((m) => {
              const isCrypto = ["Bitcoin", "Ethereum", "USDC / USDT", "Monero"].includes(m.name);
              return (
                <div key={m.name} className="bg-white border border-[#ede8da] p-5 text-center hover:border-[#c8a96e]/50 transition-colors">
                  <div className="text-3xl mb-2">{m.icon}</div>
                  <div className="text-[#12302a] font-medium text-sm mb-1">{m.name}</div>
                  <div className="text-[#9e9488] text-[10px] leading-tight">{m.desc}</div>
                  {isCrypto && <div className="mt-2 bg-[#c8a96e]/10 text-[#c8a96e] text-[9px] tracking-wider uppercase px-2 py-0.5">5% off</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-[#f5f1e8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <div className="text-[#4a7c6a] text-xs tracking-widest uppercase mb-3">Verified Reviews</div>
            <h2 className="font-display text-4xl md:text-5xl text-[#12302a]">Trusted by researchers,<br /><em>athletes, and clinicians</em></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white border border-[#ede8da] p-7 flex flex-col">
                <div className="flex text-[#c8a96e] text-lg mb-4">★★★★★</div>
                <p className="text-[#1a1a18]/70 text-sm leading-relaxed flex-1 mb-6 italic font-display">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#ede8da]">
                  <div className="w-10 h-10 bg-[#12302a] text-[#c8a96e] flex items-center justify-center text-sm font-bold">{t.avatar}</div>
                  <div>
                    <div className="text-[#12302a] font-semibold text-sm">{t.name}</div>
                    <div className="text-[#9e9488] text-xs">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#12302a]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[#7aab97] text-xs tracking-widest uppercase mb-3">Common Questions</div>
            <h2 className="font-display text-4xl text-[#f5f1e8]">FAQ</h2>
          </div>
          <div className="space-y-px">
            {[
              { q: "Are your peptides for human use?", a: "PEPTEAS.NG sells peptides strictly for research purposes. All products are labeled 'Not for Human Consumption' in compliance with applicable regulations." },
              { q: "How do I verify product purity?", a: "Every vial includes a QR code linking to the third-party Certificate of Analysis. You can also view all COAs on our lab reports page." },
              { q: "Do you ship internationally?", a: "Yes — we ship to most countries with discreet, cold-chain packaging. Customs compliance is the buyer's responsibility." },
              { q: "What's the crypto payment process?", a: "At checkout, select your preferred cryptocurrency. You'll receive a unique wallet address and a 30-minute payment window. Your 5% discount is applied automatically upon confirmation." },
              { q: "How should peptides be stored?", a: "Lyophilized peptides are stable at room temperature for up to 3 months. Refrigerate at 2–8°C for long-term storage. Once reconstituted, use within 28 days." },
            ].map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#c8a96e] py-14">
        
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-[#12302a] mb-4">Ready to start your<br /><em>research journey?</em></h2>
          <p className="text-[#12302a]/70 text-sm mb-8">Join 12,400+ researchers, athletes, and practitioners who trust PEPTEAS.NG.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => setPage("products")} className="bg-[#12302a] text-[#f5f1e8] px-10 py-4 text-sm tracking-widest uppercase hover:bg-[#1e4a3e] transition-colors">Browse All Products</button>
            {userState?.id ? (
              <button onClick={() => setPage("profile")} className="border border-[#12302a] text-[#12302a] px-10 py-4 text-sm tracking-widest uppercase hover:bg-[#12302a]/10 transition-colors">My Account</button>
            ) : (
              <button onClick={() => router.push('/authentication')} className="border border-[#12302a] text-[#12302a] px-10 py-4 text-sm tracking-widest uppercase hover:bg-[#12302a]/10 transition-colors">Create Account</button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0c2320] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="font-display italic text-[#c8a96e] text-2xl mb-3">PEPTEAS.NG</div>
              <p className="text-[#f5f1e8]/40 text-xs leading-relaxed">Research-grade peptides. Third-party tested. Cold-chain delivered.</p>
            </div>
            {[
              { title: "Products", links: [["Full Catalog", () => setPage("products")], ["BPC-157", () => setPage("products")], ["Tirzepatide", () => setPage("products")], ["Epithalon", () => setPage("products")]] },
              
              { title: "Support", links: [["FAQ", () => scrollTo("faq")], ["Contact", () => {}], ["Shipping Policy", () => {}]] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-[#f5f1e8]/60 text-[10px] tracking-widest uppercase mb-4">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map(([label, action]) => (
                    <li key={label as string}>
                      <button onClick={action as () => void} className="text-[#f5f1e8]/40 text-xs hover:text-[#c8a96e] transition-colors">{label as string}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#4a7c6a]/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#f5f1e8]/25 text-xs">
            <span>© 2026 PEPTEAS.NG. All rights reserved. For research use only.</span>
            <span>BTC · ETH · USDC · XMR · Visa · Mastercard</span>
          </div>
        </div>
      </footer>

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
                  {userState.cart.length === 0 ? (
                    <div className="text-center py-20 text-[#9e9488] text-sm">Your cart is empty</div>
                  ) : userState.cart.map((item:any) => (
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
                {userState.cart.length > 0 && (
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
   {/*          {checkoutStep === "payment" && (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6">
                    <div className="text-[#9e9488] text-xs tracking-widest uppercase mb-3">Select Payment Method</div>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((m) => {
                        const isCrypto = ["Bitcoin", "Ethereum", "USDC / USDT", "Monero"].includes(m.name);
                        const selected = selectedPayment === m.name;
                        return (
                          <button key={m.name} onClick={() => setSelectedPayment(m.name)} className={`w-full flex items-center gap-3 p-3 border text-left transition-colors ${selected ? "border-[#c8a96e] bg-[#c8a96e]/5" : "border-[#ede8da] hover:border-[#c8a96e]/40"}`}>
                            <span className="text-xl">{m.icon}</span>
                            <div className="flex-1">
                              <div className="text-[#12302a] text-sm font-medium">{m.name}</div>
                              <div className="text-[#9e9488] text-[10px]">{m.desc}</div>
                            </div>
                            {isCrypto && <span className="bg-[#c8a96e]/20 text-[#c8a96e] text-[9px] tracking-wider px-2 py-0.5 uppercase">5% off</span>}
                            {selected && <span className="text-[#c8a96e]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {cryptoDiscount && (
                    <div className="bg-[#4a7c6a]/10 border border-[#4a7c6a]/30 p-4 text-[#12302a] text-xs">
                      <strong>Crypto discount applied:</strong> 5% off your order total.
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-[#ede8da]">
                  <div className="flex justify-between text-sm mb-2"><span className="text-[#9e9488]">Subtotal</span><span>{formatNaira(cartTotal)}</span></div>
                  {cryptoDiscount && <div className="flex justify-between text-sm mb-2"><span className="text-[#4a7c6a]">Crypto Discount (5%)</span><span className="text-[#4a7c6a]">−{formatNaira(Math.round(cartTotal * 0.05))}</span></div>}
                  <div className="flex justify-between font-semibold text-base mb-4 pt-2 border-t border-[#ede8da]"><span>Total</span><span>{formatNaira(Math.round(finalTotal))}</span></div>
                  <button onClick={confirmOrder} className="w-full bg-[#c8a96e] text-[#12302a] py-3.5 text-xs tracking-widest uppercase font-semibold hover:bg-[#e2c990] transition-colors">Confirm Order</button>
                  <button onClick={() => setCheckoutStep("cart")} className="w-full text-[#9e9488] text-xs mt-3 hover:text-[#12302a] transition-colors">← Back to Cart</button>
                </div>
              </>
            )} */}

            {/* {checkoutStep === "confirm" && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-[#4a7c6a] flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <h3 className="font-display text-3xl text-[#12302a] mb-3">Order Placed</h3>
                <p className="text-[#9e9488] text-sm mb-8">Confirmation and COA links sent to your email within 24 hours.</p>
                <div className="bg-[#ede8da] p-4 w-full text-left mb-8">
                  <div className="text-[#9e9488] text-[10px] uppercase tracking-wider mb-1">Payment</div>
                  <div className="text-[#12302a] text-sm font-medium">{selectedPayment}</div>
                  <div className="text-[#9e9488] text-[10px] uppercase tracking-wider mt-3 mb-1">Total</div>
                  <div className="text-[#12302a] font-semibold">{formatNaira(Math.round(finalTotal))}</div>
                </div>
                <div className="flex gap-3 w-full">
                  <button onClick={() => { setCartOpen(false);  setCheckoutStep("cart"); }} className="flex-1 bg-[#12302a] text-[#f5f1e8] py-3 text-xs tracking-widest uppercase hover:bg-[#1e4a3e] transition-colors">Continue Shopping</button>
                  <button onClick={() => { setCartOpen(false);  setCheckoutStep("cart"); setPage("history"); }} className="flex-1 border border-[#12302a] text-[#12302a] py-3 text-xs tracking-widest uppercase hover:bg-[#12302a]/5 transition-colors">View Orders</button>
                </div>
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}
