import { useState } from "react";
import type { UserProfile, Page } from "./types";
import { useAuth } from "app/_components/AuthListener";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "firebase/firebase";

interface Props {
  onBack: () => void;
  cartCount: number;
  checkoutStep:string;
  removeFromCart:(item:any,key:any) => void;
  cart:any[],
  cartTotal:number,
  setCheckoutStep:(step:string) => void;
  //onCartOpen: () => void;
  onNavigate: (page: Page) => void;
}
function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function NavBar({ onBack, cartCount, onNavigate,setCartOpen}: { onBack: () => void; cartCount: number; setCartOpen: (value:boolean) => void; onNavigate: (p: Page) => void }) {
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#12302a]/95 backdrop-blur-md border-b border-[#4a7c6a]/20">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[#f5f1e8]/50 hover:text-[#c8a96e] transition-colors text-sm flex items-center gap-1.5">← <span className="hidden sm:inline">Home</span></button>
          <span className="text-[#4a7c6a]/40">|</span>
          <button onClick={onBack} className="text-[#c8a96e] text-2xl font-display italic">PEPTEAS.NG</button>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("history")} className="text-[#f5f1e8]/60 hover:text-[#c8a96e] text-xs hidden md:block tracking-wide transition-colors">Order History</button>
          <button onClick={() => onNavigate("products")} className="text-[#f5f1e8]/60 hover:text-[#c8a96e] text-xs hidden md:block tracking-wide transition-colors">Catalog</button>
          <button onClick={()=>setCartOpen(true)} className="relative text-[#f5f1e8]/80 hover:text-[#c8a96e] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.886-7.145a60.548 60.548 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#c8a96e] text-[#12302a] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
      </div>
         
    </nav>
  );
}

export default function ProfilePage({ onBack, cartCount, onNavigate,checkoutStep,setCheckoutStep, removeFromCart,cart,cartTotal }: Props) {
  const {userState} = useAuth()

   const [form, setForm] = useState<UserProfile>({
    firstName: userState?.firstName ||"", lastName: userState?.lastName ||"", phoneNumber: userState?.phoneNumber ||"",
    address: userState?.address ||"", city: userState?.city ||"", state: userState?.state ||"", country: userState?.country ||"",
    dateOfBirth: userState?.dateOfBirth ||"",
  });
  const [cartOpen,setCartOpen] = useState(false)
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  
  

  function handleChange(field: keyof UserProfile, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const userRef = doc(db,"users",userState.id)
      await updateDoc(userRef,form).then(()=>{
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 3000);

      })
    } catch (error) {
      alert("Error updating profile")
    }    
  }

  const initials = userState?.firstName && userState?.lastName ? `${userState?.firstName[0]}${userState?.lastName[0]}`.toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-[#f5f1e8] font-sans text-[#1a1a18]">
      <NavBar onBack={onBack} setCartOpen={setCartOpen}  cartCount={cartCount} onNavigate={onNavigate} />

      <div className="pt-16">
        {/* Header */}
        <div className="bg-[#12302a] py-12 px-6">
          <div className="max-w-5xl mx-auto flex items-center gap-6">
            <div className="w-20 h-20 bg-[#c8a96e] flex items-center justify-center font-display text-3xl text-[#12302a]">
              {initials}
            </div>
            <div>
              
              <div className="text-[#7aab97] text-xs tracking-widest uppercase mb-1">Account</div>
              <h1 className="font-display text-3xl text-[#f5f1e8]">
                {userState?.id ? `${userState?.firstName} ${userState?.lastName}` : "Your Profile"}
              </h1>
              <div className="text-[#f5f1e8]/50 text-sm mt-1">{userState?.email}</div>
              
              <div className="text-[#7aab97] text-xs mt-1">
                Member since {new Date(userState?.registeredAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
              </div>
              
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-[#ede8da]">
            {["Personal Info", "Quick Links"].map((tab, i) => (
              <div key={tab} className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${i === 0 ? "border-[#c8a96e] text-[#12302a] font-medium" : "border-transparent text-[#9e9488]"}`}>{tab}</div>
            ))}
          </div>

          {saved && (
            <div className="mb-6 bg-[#4a7c6a]/10 border border-[#4a7c6a]/30 p-4 flex items-center gap-3">
              <span className="text-[#4a7c6a]">✓</span>
              <span className="text-[#12302a] text-sm">Profile updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-white border border-[#ede8da] p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-[#12302a]">Personal Information</h2>
                {!editing  && (
                  <button type="button" onClick={() => setEditing(true)} className="text-xs text-[#4a7c6a] border border-[#4a7c6a]/30 px-3 py-1.5 hover:border-[#4a7c6a] transition-colors">
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {([
                  { label: "First Name", field: "firstName", type: "text", placeholder: "Adaeze", required: true },
                  { label: "Last Name", field: "lastName", type: "text", placeholder: "Okafor", required: true },
                  { label: "Phone Number", field: "phoneNumber", type: "tel", placeholder: "+234 800 000 0000" },
                  { label: "Date of Birth", field: "dateOfBirth", type: "date", placeholder: "" },
                ] as Array<{ label: string; field: keyof UserProfile; type: string; placeholder: string; required?: boolean }>).map(({ label, field, type, placeholder, required }) => (
                  <div key={field}>
                    <label className="text-[#9e9488] text-xs tracking-widest uppercase mb-1.5 block">{label} {required && <span className="text-[#c8a96e]">*</span>}</label>
                    {editing ? (
                      <input
                        type={type}
                        value={form[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        className="w-full border border-[#ede8da] px-4 py-2.5 text-sm text-[#12302a] focus:outline-none focus:border-[#c8a96e] bg-[#faf8f4]"
                      />
                    ) : (
                      <div className="text-[#12302a] text-sm py-2.5 border-b border-[#ede8da]">
                        {form[field] || <span className="text-[#9e9488] italic">Not provided</span>}
                      </div>
                    )}
                  </div>
                ))}
                
              </div>
            </div>

            <div className="bg-white border border-[#ede8da] p-6 mb-6">
              <h2 className="font-display text-xl text-[#12302a] mb-6">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {([
                  { label: "Street Address", field: "address", placeholder: "14 Bourdillon Road, Ikoyi", span: true },
                  { label: "City", field: "city", placeholder: "Lagos" },
                  { label: "State", field: "state", placeholder: "Lagos" },
                  { label: "Country", field: "country", placeholder: "Nigeria" },
                ] as Array<{ label: string; field: keyof UserProfile; placeholder: string; span?: boolean }>).map(({ label, field, placeholder, span }) => (
                  <div key={field} className={span ? "md:col-span-2" : ""}>
                    <label className="text-[#9e9488] text-xs tracking-widest uppercase mb-1.5 block">{label}</label>
                    {editing ? (
                      <input
                        type="text"
                        value={form[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full border border-[#ede8da] px-4 py-2.5 text-sm text-[#12302a] focus:outline-none focus:border-[#c8a96e] bg-[#faf8f4]"
                      />
                    ) : (
                      <div className="text-[#12302a] text-sm py-2.5 border-b border-[#ede8da]">
                        {form[field] || <span className="text-[#9e9488] italic">Not provided</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {editing && (
              <div className="flex gap-3">
                <button type="submit" className="bg-[#12302a] text-[#f5f1e8] px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#1e4a3e] transition-colors">
                  Save
                </button>
                
                <button type="button" onClick={() => { setForm({firstName: userState?.firstName ||"", lastName: userState?.lastName ||"", phoneNumber: userState?.phoneNumber ||"", address: userState?.address ||"", city: userState?.city ||"", state: userState?.state ||"", country: userState?.country ||"",dateOfBirth: userState?.dateOfBirth ||""}); setEditing(false); }} className="border border-[#ede8da] text-[#9e9488] px-6 py-3 text-xs tracking-widest uppercase hover:border-[#9e9488] transition-colors">
                  Cancel
                </button>
                
              </div>
            )}
          </form>

          {/* Quick links */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <button onClick={() => onNavigate("history")} className="bg-white border border-[#ede8da] p-5 text-left hover:border-[#c8a96e]/40 transition-colors group">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-[#12302a] font-medium text-sm group-hover:text-[#4a7c6a] transition-colors">Order History</div>
              <div className="text-[#9e9488] text-xs mt-0.5">View past transactions</div>
            </button>
            <button onClick={() => onNavigate("products")} className="bg-white border border-[#ede8da] p-5 text-left hover:border-[#c8a96e]/40 transition-colors group">
              <div className="text-2xl mb-2">🔬</div>
              <div className="text-[#12302a] font-medium text-sm group-hover:text-[#4a7c6a] transition-colors">Full Catalog</div>
              <div className="text-[#9e9488] text-xs mt-0.5">Browse all peptides</div>
            </button>
            {userState?.admin && (
              <button onClick={() => onNavigate("admin")} className="bg-white border border-[#ede8da] p-5 text-left hover:border-[#c8a96e]/40 transition-colors group">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-[#12302a] font-medium text-sm group-hover:text-[#4a7c6a] transition-colors">Admin Panel</div>
                <div className="text-[#9e9488] text-xs mt-0.5">Manage platform</div>
             </button>
            )}
          </div>

          {/* drawer */}
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
                    ) : cart.map((item) => (
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
              )
              
              }
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
        </div>
      </div>
    </div>
  );
}
