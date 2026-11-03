"use client"
import { useState } from "react";
import type { UserProfile } from "../../src/types";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "firebase/firebase";
import axios from "axios";
import { useRouter } from "next/navigation";


interface LoginProps {
  setPage:(page:string) => void;
}

interface RegisterProps {
  setPage:(page:string)=>void;
}

function Logo({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} className="flex items-center gap-2 mb-10">
      <span className="font-display italic text-[#c8a96e] text-2xl">PEPTEAS.NG</span>
    </button>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const bars = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-[#4a7c6a]"];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? bars[score - 1] : "bg-[#ede8da]"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map((c) => (
          <span key={c.label} className={`text-[10px] flex items-center gap-1 ${c.pass ? "text-[#4a7c6a]" : "text-[#9e9488]"}`}>
            <span>{c.pass ? "✓" : "○"}</span>{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function InputField({
  label, id, type = "text", value, onChange, placeholder, required, autoComplete, hint,
}: {
  label: string; id: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; autoComplete?: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label htmlFor={id} className="block text-[#9e9488] text-[10px] tracking-widest uppercase mb-1.5">
        {label}{required && <span className="text-[#c8a96e] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full border border-[#ede8da] bg-white px-4 py-3 text-sm text-[#12302a] placeholder-[#c5bfb5] focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/20 transition-colors"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9488] hover:text-[#12302a] transition-colors text-xs">
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {hint && <div className="text-[#9e9488] text-[10px] mt-1">{hint}</div>}
    </div>
  );
}

export function LoginPage({setPage }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
   
    await signInWithEmailAndPassword(auth,email,password).then(async (userData)=>{
      setLoading(true);
      setTimeout(() => {
         setLoading(false);
         localStorage.setItem("auth","true")
         router.push('/')
      }, 900);
          
    })
    .catch((err)=>{
      alert(err)
      console.log(err)
    });

  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] font-sans flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#12302a] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=900&h=1100&fit=crop&auto=format)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#12302a]/60 to-[#12302a]" />
        <div className="relative">
          <button onClick={()=>router.back()} className="font-display italic text-[#c8a96e] text-3xl">PEPTEAS.NG</button>
          <p className="text-[#7aab97] text-xs tracking-widest uppercase mt-1">Science. Purity. Wellness.</p>
        </div>
        <div className="relative">
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { value: "99.2%", label: "Avg. Purity" },
              { value: "48hr", label: "Cold-Chain Ship" },
              { value: "COA", label: "Every Batch" },
              { value: "12k+", label: "Customers" },
            ].map((s) => (
              <div key={s.label} className="border border-[#4a7c6a]/30 p-4">
                <div className="font-display text-2xl text-[#c8a96e]">{s.value}</div>
                <div className="text-[#f5f1e8]/40 text-[10px] uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <blockquote className="border-l-2 border-[#c8a96e] pl-4">
            <p className="text-[#f5f1e8]/60 text-sm italic font-display leading-relaxed">
              "The only peptide supplier I trust for verified purity and reliable cold-chain delivery."
            </p>
            <cite className="text-[#7aab97] text-xs mt-2 block not-italic">— Dr. Mara Levenson, Functional Medicine</cite>
          </blockquote>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo onBack={()=>router.back()} />
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl text-[#12302a] mb-2">Welcome back</h1>
            <p className="text-[#9e9488] text-sm">Sign in to your PEPTEAS.NG account</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm flex items-center gap-2">
              <span>⚠</span>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField label="Email Address" id="email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required autoComplete="email" />
            <InputField label="Password" id="password" type="password" value={password} onChange={setPassword} placeholder="Your password" required autoComplete="current-password" />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 border flex items-center justify-center transition-colors ${rememberMe ? "bg-[#12302a] border-[#12302a]" : "border-[#ede8da]"}`}
                >
                  {rememberMe && <span className="text-[#c8a96e] text-[10px] leading-none">✓</span>}
                </button>
                <span className="text-[#9e9488] text-xs">Remember me</span>
              </label>
              <button type="button" className="text-xs text-[#4a7c6a] hover:text-[#12302a] transition-colors">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 text-sm tracking-widest uppercase font-semibold transition-all duration-200 ${loading ? "bg-[#4a7c6a] text-white cursor-wait" : "bg-[#12302a] text-[#f5f1e8] hover:bg-[#1e4a3e]"}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#ede8da]" /></div>
            <div className="relative flex justify-center"><span className="bg-[#f5f1e8] px-3 text-[#9e9488] text-xs">or continue with</span></div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[{ icon: "🔑", label: "Google" }, { icon: "₿", label: "Web3 Wallet" }].map((p) => (
              <button key={p.label} type="button" className="flex items-center justify-center gap-2 border border-[#ede8da] py-2.5 text-sm text-[#12302a] hover:border-[#c8a96e]/40 hover:bg-white transition-colors">
                <span>{p.icon}</span>{p.label}
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-[#9e9488] text-sm">
            Don't have an account?{" "}
            <button onClick={()=>setPage('register')} className="text-[#4a7c6a] font-medium hover:text-[#12302a] transition-colors">Create one →</button>
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 text-[#9e9488] text-[10px]">
            <span className="flex items-center gap-1">🔒 256-bit SSL</span>
            <span>·</span>
            <span className="flex items-center gap-1">✦ COA Verified</span>
            <span>·</span>
            <span className="flex items-center gap-1">❄️ Cold-Chain</span>
          </div>
        </div>
      </div>
    </div>
  );
}



export function RegisterPage({setPage }: RegisterProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "",
    address: "", city: "", state: "", country: "Nigeria", dateOfBirth: "",
    agreeTerms: false, agreeResearch: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!form.agreeTerms) e.agreeTerms = "You must accept the terms";
    if (!form.agreeResearch) e.agreeResearch = "You must acknowledge research use";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2()) return;
    

    await createUserWithEmailAndPassword(auth,form.email.trim(),form.password.trim()).then(async (res)=>{
  
      const docRef = doc(db,'users',res.user.uid);
      await setDoc(docRef,{firstName:form.firstName.trim(),lastName:form.lastName.trim(),email:form.email.trim(),dateOfBirth:form.dateOfBirth,phoneNumber:form.phone,country:form.country,city:form.city,state:form.state,cart:[],address:form.address,registeredAt:new Date().toISOString(),orders:[]})
      .then(async ()=>{
        
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          localStorage.setItem("auth","true")
          router.push('/')
        }, 900);

      })

    }).catch((err)=>{
        alert(err)
      })



   
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] font-sans flex">
      {/* Left panel */}
      
      <div className="hidden lg:flex lg:w-5/12 bg-[#12302a] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=1100&fit=crop&auto=format)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#12302a]/50 to-[#12302a]" />
        <div className="relative">
          <button onClick={()=>router.back()} className="font-display italic text-[#c8a96e] text-3xl">PEPTEAS.NG</button>
          <p className="text-[#7aab97] text-xs tracking-widest uppercase mt-1">Science. Purity. Wellness.</p>
          
        </div>
        <div className="relative space-y-4">
          <div className="text-[#7aab97] text-[10px] tracking-widest uppercase mb-2">Why join PEPTEAS.NG?</div>
          {[
            { icon: "📄", title: "COA on Every Order", desc: "QR-linked third-party lab reports included with every vial" },
            { icon: "❄️", title: "Cold-Chain Guarantee", desc: "Lyophilized peptides delivered with dry ice in 48 hours" },
            { icon: "₿", title: "Crypto Payments Welcome", desc: "Pay with BTC, ETH, USDC or XMR — 5% discount applied" },
            { icon: "🔬", title: "21 Research Compounds", desc: "The widest verified peptide catalog in Nigeria" },
          ].map((b) => (
            <div key={b.title} className="flex gap-3 items-start">
              <span className="text-xl flex-shrink-0 mt-0.5">{b.icon}</span>
              <div>
                <div className="text-[#f5f1e8] text-sm font-medium">{b.title}</div>
                <div className="text-[#f5f1e8]/40 text-xs leading-relaxed">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="lg:hidden mb-8">
            <Logo onBack={()=>router.back()} />
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl text-[#12302a] mb-2">Create your account</h1>
            <p className="text-[#9e9488] text-sm">Join PEPTEAS.NG — Nigeria's premier research peptide platform</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 flex items-center justify-center text-xs font-semibold transition-colors ${step >= s ? "bg-[#12302a] text-[#c8a96e]" : "bg-[#ede8da] text-[#9e9488]"}`}>
                  {step > s ? "✓" : s}
                </div>
                <span className={`text-xs ${step === s ? "text-[#12302a] font-medium" : "text-[#9e9488]"}`}>
                  {s === 1 ? "Account Details" : "Address & Confirm"}
                </span>
                {s < 2 && <div className={`h-px w-8 transition-colors ${step > s ? "bg-[#12302a]" : "bg-[#ede8da]"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputField label="First Name" id="firstName" value={form.firstName} onChange={(v) => set("firstName", v)} placeholder="Adaeze" required />
                  {errors.firstName && <div className="text-red-500 text-[10px] mt-1">{errors.firstName}</div>}
                </div>
                <div>
                  <InputField label="Last Name" id="lastName" value={form.lastName} onChange={(v) => set("lastName", v)} placeholder="Okafor" required />
                  {errors.lastName && <div className="text-red-500 text-[10px] mt-1">{errors.lastName}</div>}
                </div>
              </div>
              <div>
                <InputField label="Email Address" id="reg-email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="you@example.com" required autoComplete="email" />
                {errors.email && <div className="text-red-500 text-[10px] mt-1">{errors.email}</div>}
              </div>
              <InputField label="Phone Number" id="phone" type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+234 800 000 0000" />
              <InputField label="Date of Birth" id="dob" type="date" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} />
              <div>
                <InputField label="Password" id="reg-password" type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="Create a strong password" required autoComplete="new-password" />
                <PasswordStrength password={form.password} />
                {errors.password && <div className="text-red-500 text-[10px] mt-1">{errors.password}</div>}
              </div>
              <div>
                <InputField label="Confirm Password" id="confirmPassword" type="password" value={form.confirmPassword} onChange={(v) => set("confirmPassword", v)} placeholder="Repeat your password" required autoComplete="new-password" />
                {errors.confirmPassword && <div className="text-red-500 text-[10px] mt-1">{errors.confirmPassword}</div>}
              </div>
              <button type="submit" className="w-full bg-[#12302a] text-[#f5f1e8] py-3.5 text-sm tracking-widest uppercase hover:bg-[#1e4a3e] transition-colors">
                Continue →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-[#ede8da] border border-[#d9d2c3] p-4 flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#12302a] text-[#c8a96e] flex items-center justify-center text-sm font-bold">
                  {form.firstName[0]}{form.lastName[0]}
                </div>
                <div>
                  <div className="text-[#12302a] text-sm font-medium">{form.firstName} {form.lastName}</div>
                  <div className="text-[#9e9488] text-xs">{form.email}</div>
                </div>
                <button type="button" onClick={() => setStep(1)} className="ml-auto text-[#4a7c6a] text-xs hover:text-[#12302a] transition-colors">Edit</button>
              </div>

              <InputField label="Street Address" id="address" value={form.address} onChange={(v) => set("address", v)} placeholder="14 Bourdillon Road, Ikoyi" />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="City" id="city" value={form.city} onChange={(v) => set("city", v)} placeholder="Lagos" />
                <InputField label="State" id="state" value={form.state} onChange={(v) => set("state", v)} placeholder="Lagos" />
              </div>
              <InputField label="Country" id="country" value={form.country} onChange={(v) => set("country", v)} placeholder="Nigeria" />

              <div className="border-t border-[#ede8da] pt-5 space-y-4">
                <div className="text-[#9e9488] text-[10px] uppercase tracking-widest mb-2">Acknowledgements</div>
                {[
                  { key: "agreeTerms", label: "I agree to the Terms of Service and Privacy Policy", err: errors.agreeTerms },
                  { key: "agreeResearch", label: "I acknowledge that all products are for research purposes only and not for human consumption", err: errors.agreeResearch },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => set(item.key, !form[item.key as keyof typeof form])}
                        className={`w-4 h-4 mt-0.5 border flex-shrink-0 flex items-center justify-center transition-colors ${form[item.key as keyof typeof form] ? "bg-[#12302a] border-[#12302a]" : "border-[#d9d2c3]"}`}
                      >
                        {form[item.key as keyof typeof form] && <span className="text-[#c8a96e] text-[10px] leading-none">✓</span>}
                      </button>
                      <span className="text-[#12302a] text-xs leading-relaxed">{item.label}</span>
                    </label>
                    {item.err && <div className="text-red-500 text-[10px] mt-1 ml-7">{item.err}</div>}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="border border-[#ede8da] text-[#9e9488] px-5 py-3 text-xs tracking-widest uppercase hover:border-[#9e9488] transition-colors">← Back</button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3.5 text-sm tracking-widest uppercase font-semibold transition-all duration-200 ${loading ? "bg-[#4a7c6a] text-white cursor-wait" : "bg-[#c8a96e] text-[#12302a] hover:bg-[#e2c990]"}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      Creating account…
                    </span>
                  ) : "Create Account"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-[#9e9488] text-sm">
            Already have an account?{" "}
            <button onClick={()=>setPage('login')} className="text-[#4a7c6a] font-medium hover:text-[#12302a] transition-colors">Sign in →</button>
          </p>
        </div>
      </div>
    </div>
  );
}


export default function Authentication({}){
  const [page,setPage] = useState('login')
  return page ==='login'?<LoginPage setPage={setPage}/>:<RegisterPage setPage={setPage}/>
}