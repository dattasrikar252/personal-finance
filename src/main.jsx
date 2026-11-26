import React, {useEffect,useMemo,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Wallet,ArrowDownLeft,ArrowUpRight,History,Plus,Search,Download,Upload,CheckCircle2,Clock,ShieldCheck,ChevronRight,Trash2,X,IndianRupee,Settings,Menu,Smartphone,LockKeyhole} from 'lucide-react'
import './style.css'

const seed={
 people:[
  {id:'p1',name:'Pranav',balance:7888,details:'₹7,195 Hero VIDA balance + ₹693 from Splitwise'},
  {id:'p2',name:'Vamshi',balance:7500,details:''},
  {id:'p3',name:'Yashwant',balance:2192,details:''},
  {id:'p4',name:'Ragamayi',balance:1000,details:"Kishore's wedding gift"}
 ],
 bills:[
  {id:'b1',name:'Kotak',balance:5517,details:''},
  {id:'b2',name:'Navneet',balance:15000,details:'₹30,000 original; ₹17,000 paid; ₹3,000 taken; ₹1,000 given back'},
  {id:'b3',name:'Anusri',balance:10000,details:'₹15,000 original; ₹5,000 paid via GPay'}
 ],
 history:[
  {id:'h1',date:'18/11/26',title:'Navneet payment',amount:10000,method:'Payment received'},
  {id:'h2',date:'18/11/26',title:'Navneet payment',amount:7000,method:'GPay'},
  {id:'h3',date:'24/11/26',title:'Navneet additional amount',amount:3000,method:'Taken / added to balance'},
  {id:'h4',date:'24/11/26',title:'Navneet amount given back',amount:500,method:'GPay'},
  {id:'h5',date:'24/11/26',title:'Navneet amount given back',amount:500,method:'Amazon Pay'},
  {id:'h6',date:'18/11/26',title:'Anusri payment',amount:5000,method:'GPay'},
  {id:'h7',date:'26/11/26',title:'Cheq bill paid',amount:550,method:'Paid'},
  {id:'h8',date:'26/11/26',title:'IDFC bill paid',amount:300,method:'Paid'},
  {id:'h9',date:'26/11/26',title:'Pranav additional receivable',amount:693,method:'Splitwise'}
 ],
 paidBills:[{name:'Cheq',amount:550,date:'26/11/26'},{name:'IDFC',amount:300,date:'26/11/26'}]
}
const money=n=>'₹'+Number(n||0).toLocaleString('en-IN')
const today=()=>new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit'})
function App(){
 const [data,setData]=useState(seed),[tab,setTab]=useState('Overview'),[modal,setModal]=useState(null),[query,setQuery]=useState(''),[toast,setToast]=useState(''),[installPrompt,setInstallPrompt]=useState(null),[locked,setLocked]=useState(false),[bioEnabled,setBioEnabled]=useState(localStorage.getItem('pf-bio')==='yes')
 useEffect(()=>{const saved=localStorage.getItem('pf-data');if(saved){try{setData(JSON.parse(saved))}catch{}} if('serviceWorker'in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{}); const h=e=>{e.preventDefault();setInstallPrompt(e)};window.addEventListener('beforeinstallprompt',h);return()=>window.removeEventListener('beforeinstallprompt',h)},[])
 useEffect(()=>{localStorage.setItem('pf-data',JSON.stringify(data))},[data])
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(t)}},[toast])
 const received=useMemo(()=>data.people.reduce((s,x)=>s+x.balance,0),[data])
 const payable=useMemo(()=>data.bills.reduce((s,x)=>s+x.balance,0),[data])
 const net=payable-received
 const addHistory=(title,amount,method)=>({id:crypto.randomUUID(),date:today(),title,amount:Number(amount),method})
 function saveNew(kind,form){
  const amount=Number(form.amount);if(!form.name.trim()||!amount||amount<0){setToast('Enter a name and valid amount');return}
  if(kind==='person')setData(d=>({...d,people:[...d.people,{id:crypto.randomUUID(),name:form.name.trim(),balance:amount,details:form.note||''}],history:[addHistory('Receivable added: '+form.name,amount,form.note||'Opening balance'),...d.history]}))
  else setData(d=>({...d,bills:[...d.bills,{id:crypto.randomUUID(),name:form.name.trim(),balance:amount,details:form.note||''}],history:[addHistory('Bill added: '+form.name,amount,form.note||'New bill'),...d.history]}))
  setModal(null);setToast('Saved successfully')
 }
 function adjust(kind,item,amount,method){
  const n=Number(amount);if(!n||n<=0){setToast('Enter a valid amount');return}
  if(kind==='receive')setData(d=>({...d,people:d.people.map(x=>x.id===item.id?{...x,balance:Math.max(0,x.balance-n)}:x),history:[addHistory('Received from '+item.name,n,method),...d.history]}))
  else setData(d=>({...d,bills:d.bills.map(x=>x.id===item.id?{...x,balance:Math.max(0,x.balance-n)}:x),history:[addHistory('Paid '+item.name,n,method),...d.history]}))
  setModal(null);setToast('Transaction recorded')
 }
 function exportData(){const blob=new Blob([JSON.stringify({...data,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='personal-finances-backup.json';a.click();URL.revokeObjectURL(a.href);setToast('Backup downloaded')}
 function importData(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x.people)||!Array.isArray(x.bills)||!Array.isArray(x.history))throw Error();setData(x);setToast('Backup restored')}catch{setToast('Invalid backup file')}};r.readAsText(f);e.target.value=''}
 async function setupBiometric(){
  if(!window.PublicKeyCredential||!navigator.credentials){setToast('Device biometric sign-in is not supported in this browser');return}
  if(!window.isSecureContext){setToast('Biometric setup requires a secure HTTPS website');return}
  try{
   const challenge=crypto.getRandomValues(new Uint8Array(32)), userId=crypto.getRandomValues(new Uint8Array(16))
   const cred=await navigator.credentials.create({publicKey:{challenge,rp:{name:'personal finances'},user:{id:userId,name:'local-user',displayName:'personal finances'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required'},timeout:60000,attestation:'none'}})
   if(cred){localStorage.setItem('pf-bio','yes');localStorage.setItem('pf-credential',btoa(String.fromCharCode(...new Uint8Array(cred.rawId))));setBioEnabled(true);setToast('Device biometric credential registered')}
  }catch(e){setToast(e.name==='NotAllowedError'?'Biometric setup cancelled or unavailable':'Could not set up biometrics on this device')}
 }
 async function lockWithBiometric(){
  try{
   const id=localStorage.getItem('pf-credential');if(!id){setToast('Set up biometrics first in Settings');return}
   const challenge=crypto.getRandomValues(new Uint8Array(32)),raw=Uint8Array.from(atob(id),c=>c.charCodeAt(0))
   await navigator.credentials.get({publicKey:{challenge,allowCredentials:[{type:'public-key',id:raw}],userVerification:'required',timeout:60000}})
   setToast('Biometric check passed')
  }catch{setToast('Biometric check failed')}
 }
 const nav=[['Overview',Wallet],['To receive',ArrowDownLeft],['Bills',ArrowUpRight],['History',History]]
 return <div className="app">
  <header className="topbar"><div className="brand"><div className="brand-icon"><Wallet size={21}/></div><div><strong>personal finances</strong><small>Private money tracker</small></div></div><button className="icon-btn" onClick={()=>setTab('Settings')} aria-label="Settings"><Settings size={20}/></button></header>
  <main>
   {tab==='Overview'&&<section>
    <div className="hello"><div><p className="eyebrow">YOUR MONEY, IN ONE PLACE</p><h1>Financial overview</h1><p className="muted">Everything is saved on this device.</p></div><span className="date-pill">{today()}</span></div>
    <div className="metrics"><div className="metric green"><span>Money to receive</span><strong>{money(received)}</strong><small>{data.people.length} people</small></div><div className="metric red"><span>Bills to pay</span><strong>{money(payable)}</strong><small>{data.bills.length} pending bills</small></div></div>
    <div className="net-card"><div><span>Net amount to arrange</span><strong>{money(net)}</strong><small>{net>=0?'Bills pending minus receivables':'You have more receivables than bills'}</small></div><div className="net-icon"><IndianRupee/></div></div>
    <div className="section-head"><h2>Receivables</h2><button className="text-btn" onClick={()=>setTab('To receive')}>View all <ChevronRight size={15}/></button></div>
    <div className="list-card">{data.people.slice(0,4).map(p=><PersonRow key={p.id} item={p} onClick={()=>setModal({type:'receive',item:p})}/>)}</div>
    <div className="section-head"><h2>Pending bills</h2><button className="text-btn" onClick={()=>setTab('Bills')}>View all <ChevronRight size={15}/></button></div>
    <div className="list-card">{data.bills.slice(0,4).map(b=><BillRow key={b.id} item={b} onClick={()=>setModal({type:'pay',item:b})}/>)}</div>
    <div className="note-strip"><ShieldCheck size={17}/><span>Offline-first · Your records stay in this browser on this phone</span></div>
   </section>}
   {tab==='To receive'&&<section><PageTitle title="Money to receive" desc="Track amounts people owe you." action={()=>setModal({type:'addPerson'})}/><SearchBox value={query} onChange={setQuery}/><div className="list-card">{data.people.filter(x=>x.name.toLowerCase().includes(query.toLowerCase())).map(p=><PersonRow key={p.id} item={p} onClick={()=>setModal({type:'receive',item:p})}/>)}</div><button className="primary full" onClick={()=>setModal({type:'addPerson'})}><Plus size={17}/> Add receivable</button></section>}
   {tab==='Bills'&&<section><PageTitle title="Bills to pay" desc="Keep track of pending and settled bills." action={()=>setModal({type:'addBill'})}/><SearchBox value={query} onChange={setQuery}/><div className="list-card">{data.bills.filter(x=>x.name.toLowerCase().includes(query.toLowerCase())).map(b=><BillRow key={b.id} item={b} onClick={()=>setModal({type:'pay',item:b})}/>)}</div><button className="primary full" onClick={()=>setModal({type:'addBill'})}><Plus size={17}/> Add bill</button><h3 className="subhead">Already paid</h3><div className="list-card">{data.paidBills.map((b,i)=><div className="row-item" key={i}><div className="avatar paid"><CheckCircle2/></div><div className="row-main"><b>{b.name}</b><small>Paid · {b.date}</small></div><strong>{money(b.amount)}</strong></div>)}</div></section>}
   {tab==='History'&&<section><PageTitle title="Transaction history" desc="A record of money received and bills paid."/><div className="list-card">{data.history.length?data.history.map(x=><div className="history-row" key={x.id}><div className="history-dot"><Clock size={16}/></div><div className="row-main"><b>{x.title}</b><small>{x.date} · {x.method}</small></div><strong>{money(x.amount)}</strong></div>):<Empty text="No transactions yet"/>}</div></section>}
   {tab==='Settings'&&<section><PageTitle title="Settings & backup" desc="Manage privacy and protect your records."/><div className="settings-card"><div className="setting-row"><div className="setting-icon"><LockKeyhole/></div><div className="row-main"><b>Device biometrics</b><small>{bioEnabled?'A device credential is registered':'Set up fingerprint / face unlock where supported'}</small></div><button className="outline small" onClick={setupBiometric}>{bioEnabled?'Set up again':'Set up'}</button></div><p className="fineprint">Biometric prompts require HTTPS and browser/platform support. This is a convenience gate, not a substitute for encrypted financial storage.</p></div><div className="settings-card"><h3>Backup & restore</h3><p className="muted">Download a copy of your records or restore from a previous backup.</p><button className="outline full" onClick={exportData}><Download size={17}/> Download backup</button><label className="outline full upload"><Upload size={17}/> Restore backup<input type="file" accept="application/json" onChange={importData}/></label></div><div className="settings-card"><h3>Data summary</h3><div className="summary-line"><span>People owing you</span><b>{data.people.length}</b></div><div className="summary-line"><span>Pending bills</span><b>{data.bills.length}</b></div><div className="summary-line"><span>Transactions</span><b>{data.history.length}</b></div><button className="danger-btn" onClick={()=>{if(confirm('Reset all data to the original starting records?')){setData(seed);setToast('Data reset')}}}><Trash2 size={16}/> Reset to initial records</button></div></section>}
  </main>
  <nav className="bottom-nav">{nav.map(([label,Icon])=><button key={label} className={tab===label?'active':''} onClick={()=>{setTab(label);setQuery('')}}><Icon size={20}/><span>{label}</span></button>)}</nav>
  {toast&&<div className="toast">{toast}</div>}
  {modal&&<Modal modal={modal} onClose={()=>setModal(null)} onSave={saveNew} onAdjust={adjust}/>}
 </div>
}
function PersonRow({item,onClick}){return <button className="row-item clickable" onClick={onClick}><div className="avatar green-avatar">{item.name.slice(0,1).toUpperCase()}</div><div className="row-main"><b>{item.name}</b><small>{item.details||'Amount to receive'}</small></div><div className="row-value"><strong>{money(item.balance)}</strong><small>{item.balance===0?'Settled':'Tap to update'}</small></div><ChevronRight size={17} className="chev"/></button>}
function BillRow({item,onClick}){return <button className="row-item clickable" onClick={onClick}><div className="avatar red-avatar"><IndianRupee size={17}/></div><div className="row-main"><b>{item.name}</b><small>{item.details||'Pending bill'}</small></div><div className="row-value"><strong>{money(item.balance)}</strong><small>{item.balance===0?'Paid':'Tap to pay'}</small></div><ChevronRight size={17} className="chev"/></button>}
function PageTitle({title,desc,action}){return <div className="page-title"><div><h1>{title}</h1><p className="muted">{desc}</p></div>{action&&<button className="round-add" onClick={action}><Plus/></button>}</div>}
function SearchBox({value,onChange}){return <div className="search"><Search size={18}/><input placeholder="Search by name..." value={value} onChange={e=>onChange(e.target.value)}/>{value&&<button onClick={()=>onChange('')}><X size={16}/></button>}</div>}
function Empty({text}){return <div className="empty">{text}</div>}
function Modal({modal,onClose,onSave,onAdjust}){
 const [name,setName]=useState(''),[amount,setAmount]=useState(''),[note,setNote]=useState(''),[method,setMethod]=useState('UPI / GPay')
 const isAdd=modal.type==='addPerson'||modal.type==='addBill',isReceive=modal.type==='receive',isPay=modal.type==='pay'
 const title=isAdd?(modal.type==='addPerson'?'Add receivable':'Add bill'):(isReceive?'Record money received':'Record bill payment')
 return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><X/></button></div>{isAdd?<><label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter name"/></label><label>Amount (₹)<input type="number" min="1" inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0"/></label><label>Note (optional)<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Details"/></label><button className="primary full" onClick={()=>onSave(modal.type==='addPerson'?'person':'bill',{name,amount,note})}>Save</button></>:<><div className="modal-account"><span>{modal.item.name}</span><strong>{money(modal.item.balance)}</strong><small>Current balance</small></div><label>Amount (₹)<input type="number" min="1" max={modal.item.balance} inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"/></label><label>Payment method<select value={method} onChange={e=>setMethod(e.target.value)}><option>UPI / GPay</option><option>Amazon Pay</option><option>Cash</option><option>Bank transfer</option><option>Splitwise</option><option>Other</option></select></label><button className="primary full" onClick={()=>onAdjust(isReceive?'receive':'pay',modal.item,amount,method)}>{isReceive?'Record received':'Record payment'}</button></>}</div></div>
}
createRoot(document.getElementById('root')).render(<App/>)
