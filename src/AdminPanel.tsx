import { useEffect, useState } from "react";
import type { Product, Page } from "./types";
import { CATEGORIES } from "./data";
import PeptideModal from "app/_components/PeptideModal";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "firebase/firebase";

//PipsDm@n85


function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}

interface Props {
  products: Product[];
  prices: Record<string, number>;
  onUpdatePrice: (key: string, value: number) => void;
  
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

type AdminTab = "overview" | "products" | "users" | "carts";

export default function AdminPanel({ products, onUpdatePrice, onBack, onNavigate }: Props) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  
  const totalCartItems =0// mockUsers.reduce((s, u) => s + u.cart.reduce((ss, i) => ss + i.qty, 0), 0);
  const totalCartValue =0// mockUsers.reduce((s, u) => s + u.cart.reduce((ss, i) => ss + i.price * i.qty, 0), 0);
  const totalTransactions =0// mockUsers.reduce((s, u) => s + u.transactions.length, 0);

  const filteredProducts = products
    .filter((p) => catFilter === "All" || p.category === catFilter)
    .filter((p) => search === "" || p.name.toLowerCase().includes(search.toLowerCase()));

  function startEdit(key: string, current: number) {
    setEditingKey(key);
    setEditValue(String(current));
  }

  function saveEdit(key: string) {
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val > 0) {
      onUpdatePrice(key, val);
      setSaveFeedback(key);
      setTimeout(() => setSaveFeedback(null), 2000);
    }
    setEditingKey(null);
  }

  const TABS: { id: AdminTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "products", label: "Product Prices", icon: "₦" },
    { id: "users", label: "Users", icon: "◉" },
    { id: "carts", label: "Active Carts", icon: "⊕" },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users,setUsers] = useState([]);
  
  const getUsers = async()=>{
    const collectionRef = collection(db,"users")
    const data :any= []
    await getDocs(collectionRef).then((result)=>{
      result.forEach((item)=>{
        data.push(item.data())
      })
      setUsers(data)
  
       
    }).catch(err=>console.log(err))
  }
  
  const deleteProduct = async (id:string) =>{
    const confirmed = window.confirm("Are you sure you want to delete this product?")
    if(confirmed){
      const docRef = doc(db,"products",id)
      await deleteDoc(docRef).then(()=>{
        alert("product deleted")
      })
      .catch((err)=>{
        alert("Error deleting product")
        console.error(err)
      })
    }
    else{
      return;
    }
  }

  useEffect(()=>{
    getUsers()
    
    
  },[])


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
            <div className="bg-[#c8a96e]/20 border border-[#c8a96e]/40 text-[#c8a96e] text-[10px] tracking-widest uppercase px-3 py-1">Admin Panel</div>
            <button onClick={() => onNavigate("profile")} className="text-[#f5f1e8]/60 hover:text-[#c8a96e] text-xs hidden md:block transition-colors">Profile</button>
          </div>
        </div>
      </nav>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="fixed top-16 left-0 bottom-0 w-56 bg-[#12302a] border-r border-[#4a7c6a]/20 flex flex-col z-30 hidden md:flex">
          <div className="p-6 border-b border-[#4a7c6a]/20">
            <div className="text-[#7aab97] text-[10px] tracking-widest uppercase mb-1">Admin</div>
            <div className="font-display text-[#f5f1e8] text-lg">Dashboard</div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${tab === t.id ? "bg-[#c8a96e]/15 text-[#c8a96e] border-l-2 border-[#c8a96e]" : "text-[#f5f1e8]/50 hover:text-[#f5f1e8] hover:bg-[#1e4a3e]/50"}`}
              >
                <span className="text-base">{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-[#4a7c6a]/20">
            <button onClick={onBack} className="w-full text-[#f5f1e8]/40 text-xs hover:text-[#f5f1e8]/70 transition-colors text-left">← Back to Store</button>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-20 bg-[#12302a] border-b border-[#4a7c6a]/20 flex overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-shrink-0 px-4 py-3 text-xs transition-colors ${tab === t.id ? "text-[#c8a96e] border-b-2 border-[#c8a96e]" : "text-[#f5f1e8]/50"}`}>{t.label}</button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 md:ml-56 min-h-screen">
          <div className="max-w-5xl mx-auto px-6 py-8 mt-10 md:mt-0">

            {/* Overview */}
            {tab === "overview" && (
              <div>
                <h1 className="font-display text-3xl text-[#12302a] mb-8">Platform Overview</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  {[
                    { label: "Total Users", value: users.length, icon: "◉", color: "text-[#4a7c6a]" },
                    { label: "Active Cart Items", value: totalCartItems, icon: "⊕", color: "text-[#c8a96e]" },
                    { label: "Cart Value", value: formatNaira(totalCartValue), icon: "₦", color: "text-[#12302a]" },
                    { label: "Total Transactions", value: totalTransactions, icon: "◈", color: "text-[#4a7c6a]" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white border border-[#ede8da] p-5">
                      <div className={`text-2xl mb-2 ${s.color}`}>{s.icon}</div>
                      <div className="font-display text-2xl text-[#12302a]">{s.value}</div>
                      <div className="text-[#9e9488] text-xs mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-[#ede8da] p-6">
                    <h2 className="font-display text-xl text-[#12302a] mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                      {/* {mockUsers.flatMap((u) => u.transactions.map((t) => ({ user: u, tx: t }))).sort((a, b) => new Date(b.tx.date).getTime() - new Date(a.tx.date).getTime()).slice(0, 5).map(({ user, tx }) => (
                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[#ede8da] last:border-0">
                          <div>
                            <div className="text-[#12302a] text-sm font-medium">{user.profile.firstName} {user.profile.lastName}</div>
                            <div className="text-[#9e9488] text-xs">{tx.id} · {formatDate(tx.date)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#12302a] font-medium text-sm">{formatNaira(tx.total)}</div>
                            <div className="text-[#9e9488] text-xs">{tx.paymentMethod}</div>
                          </div>
                        </div>
                      ))} */}


                    </div>
                  </div>
                  <div className="bg-white border border-[#ede8da] p-6">
                    <h2 className="font-display text-xl text-[#12302a] mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                      {[
                        { label: "Edit Product Prices", action: () => setTab("products"), desc: "Update pricing for all compounds" },
                        { label: "View All Users", action: () => setTab("users"), desc: "User accounts and profiles" },
                        { label: "Review Active Carts", action: () => setTab("carts"), desc: "What users currently have in cart" },
                      ].map((a) => (
                        <button key={a.label} onClick={a.action} className="w-full text-left p-4 border border-[#ede8da] hover:border-[#c8a96e]/40 transition-colors group">
                          <div className="text-[#12302a] text-sm font-medium group-hover:text-[#4a7c6a] transition-colors">{a.label} →</div>
                          <div className="text-[#9e9488] text-xs mt-0.5">{a.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            {tab === "products" && (
              <div>
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                  <h1 className="font-display text-3xl text-[#12302a]">Product Prices</h1>
                  
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9488]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 bg-white border border-[#ede8da] text-sm text-[#12302a] focus:outline-none focus:border-[#c8a96e] w-48" />
                  </div>

                  <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="border border-[#ede8da] bg-white text-sm text-[#12302a] px-3 py-2 focus:outline-none focus:border-[#c8a96e]">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button onClick={()=>setIsModalOpen(true)} className="w-50 py-2.5 px-2.5 text-xs  uppercase bg-[#12302a] text-[#f5f1e8] hover:bg-[#1e4a3e] ">New Product</button>
                </div>


                <div className="bg-white border border-[#ede8da] overflow-hidden">
                  <div className="grid grid-cols-5 bg-[#12302a] px-5 py-3 text-[9px] tracking-widest uppercase text-[#7aab97]">
                    <div className="col-span-2">Product</div>
                    <div>Category</div>
                    <div className="text-right">Base Price (₦)</div>
                    {/* <div>Dose</div> */}
                  </div>
                  {
                  filteredProducts.map((p:any,index:any):any=>{
                     return (
                        <div key={p.id} style={{overflowX:"scroll"}} className={`grid grid-cols-5 px-5 py-3.5 border-b border-[#ede8da] last:border-0 items-center hover:bg-[#faf8f4] transition-colors ${true ? "bg-[#4a7c6a]/5" : ""}`}>
                          <div className="col-span-2 text-[#12302a] font-medium text-sm">{p.name}</div>
                          <div className="text-[#9e9488] text-xs">{p.category}</div>
                          <div className="text-right">{formatNaira(p.variants[0].price)}</div>
                          <button onClick={()=>deleteProduct(p.id)}  className="uppercase" style={{backgroundColor:"#f41e1e",height:30,color:'white',width:60,marginLeft:20,fontSize:13}}>Delete</button>

                        </div>
                      );
                     
                  })
                  }
                </div>
                <PeptideModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                />
              </div>
            )}

            {/* Users */}
            {tab === "users" && (
              <div>
                <h1 className="font-display text-3xl text-[#12302a] mb-8">Platform Users</h1>
                <div className="space-y-3">
                  {users.map((user:any) => (
                    <div key={user?.email} className="bg-white border border-[#ede8da] hover:border-[#c8a96e]/30 transition-colors">
                      <button
                        onClick={() => setSelectedUser(selectedUser?.email === user.email ? null : user)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#12302a] text-[#c8a96e] flex items-center justify-center text-sm font-bold">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <div className="text-[#12302a] font-medium text-sm">{user.firstName} {user.lastName}</div>
                            <div className="text-[#9e9488] text-xs">{user.email} · {user.city}, {user.state}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <div className="hidden md:block">
                            <div className="text-[#12302a] text-sm font-medium">{user.orders.length} orders</div>
                            <div className="text-[#9e9488] text-xs">{user.cart.length} items in cart</div>
                          </div>
                          <div>
                            <div className="text-[#9e9488] text-xs">Registered</div>
                            <div className="text-[#12302a] text-xs">{formatDate(user.registeredAt)}</div>
                          </div>
                          <svg className={`w-4 h-4 text-[#9e9488] transition-transform ${selectedUser?.email === user.email ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </div>
                      </button>

                      {selectedUser?.email === user.email && (
                        <div className="border-t border-[#ede8da] px-5 pb-5 pt-4 grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-[#9e9488] text-[10px] tracking-widest uppercase mb-3">Registration Data</div>
                            {[
                              ["Full Name", `${user.firstName} ${user.lastName}`],
                              ["Email", user.email],
                              ["Phone", user.phone],
                              ["Address", user.address],
                              ["City / State", `${user.city}, ${user.state}`],
                              ["Date of Birth", user.dateOfBirth],
                              ["Registered", formatDate(user.registeredAt)],
                            ].map(([label, value]) => (
                              <div key={label} className="flex gap-4 py-1.5 border-b border-[#ede8da] last:border-0">
                                <div className="text-[#9e9488] text-xs w-28 flex-shrink-0">{label}</div>
                                <div className="text-[#12302a] text-xs">{value}</div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div className="text-[#9e9488] text-[10px] tracking-widest uppercase mb-3">Transaction History ({user.orders.length})</div>
                            {user.orders.length === 0 ? (
                              <div className="text-[#9e9488] text-xs italic">No transactions yet</div>
                            ) : (
                              <div className="space-y-2">
                                {user.orders.map((tx:any) => (
                                  <div key={tx.id} className="border border-[#ede8da] p-3">
                                    <div className="flex justify-between mb-1">
                                      <span className="text-[#12302a] text-xs font-medium">{tx.id}</span>
                                      <span className="text-[#4a7c6a] text-[10px]">{tx.status}</span>
                                    </div>
                                    <div className="text-[#9e9488] text-[10px]">{formatDate(tx.date)} · {tx.paymentMethod}</div>
                                    <div className="text-[#12302a] font-semibold text-sm mt-1">{formatNaira(tx.total)}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Carts */}
            {tab === "carts" && (
              <div>
                <h1 className="font-display text-3xl text-[#12302a] mb-2">Active Carts</h1>
                <p className="text-[#9e9488] text-sm mb-8">What each user currently has in their cart.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {users.map((user:any) => {
                    const cartTotal = user.cart.reduce((s:any, i:any) => s + i.price * i.qty, 0);
                    return (
                      <div key={user.id} className="bg-white border border-[#ede8da]">
                        <div className="bg-[#12302a] px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#c8a96e] text-[#12302a] flex items-center justify-center text-xs font-bold">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <div className="text-[#f5f1e8] text-sm font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-[#7aab97] text-[10px]">{user.email}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#c8a96e] font-semibold text-sm">{formatNaira(cartTotal)}</div>
                            <div className="text-[#f5f1e8]/40 text-[10px]">{user.cart.length} item{user.cart.length !== 1 ? "s" : ""}</div>
                          </div>
                        </div>
                        <div className="p-4">
                          {user.cart.length === 0 ? (
                            <div className="text-[#9e9488] text-xs italic py-2">Cart is empty</div>
                          ) : (
                            <div className="space-y-2">
                              {user.cart.map((item:any) => (
                                <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#ede8da] last:border-0">
                                  <div>
                                    <div className="text-[#12302a] text-sm font-medium">{item.name}</div>
                                    <div className="text-[#9e9488] text-xs">{item.dose} · {item.qty} vial{item.qty > 1 ? "s" : ""}</div>
                                  </div>
                                  <div className="text-[#12302a] font-medium text-sm">{formatNaira(item.price * item.qty)}</div>
                                </div>
                              ))}
                              <div className="flex justify-between pt-2 font-semibold">
                                <span className="text-[#9e9488] text-xs">Cart Total</span>
                                <span className="text-[#12302a] text-sm">{formatNaira(cartTotal)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
