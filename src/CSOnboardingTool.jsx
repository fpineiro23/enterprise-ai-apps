import { useState, useEffect, useRef } from "react";
import { Check, ChevronRight, ChevronLeft, Upload, Plus, X, Zap, FileText, Settings, Pencil, Copy, Eye, EyeOff } from "lucide-react";

const G = {
  sidebar:"#0D2B22",sidebarBorder:"rgba(255,255,255,0.08)",sidebarMuted:"rgba(255,255,255,0.35)",
  sidebarText:"rgba(255,255,255,0.7)",accent:"#2D6A4F",accentLight:"#EBF5EF",
  gold:"#C9952A",page:"#F7F4EF",white:"#FFFFFF",
  text:"#1A1A1A",muted:"#6B6560",border:"#DDD8CF",borderFocus:"#2D6A4F",
  danger:"#B84030",input:"#FDFCF9",amber:"#92620A",amberLight:"#FDF5E4",
};
const iB={width:"100%",padding:"9px 13px",border:`1.5px solid ${G.border}`,borderRadius:8,
  fontSize:14,color:G.text,background:G.input,outline:"none",fontFamily:"inherit",boxSizing:"border-box",transition:"border-color 0.15s"};
const fI=(e)=>(e.target.style.borderColor=G.borderFocus);
const fO=(e)=>(e.target.style.borderColor=G.border);

const FEEDSTOCKS=["Corn","Sorghum","Soybeans","Other"];
const PROGRAMS=["California LCFS","Canada CFR","Oregon CFP","Washington CFR","BC LCFS",
  "ISCC PLUS","ISCC EU","ISCC CORSIA","RSB CORSIA","45Z (plant only)","45Z (plant + ag)","PURO"];
const TENANTS=["Ethanol Plant","Biodiesel Plant","Renewable Diesel Plant","Grain Elevator",
  "Soy Crush Plant","Integrated Plant","Grain Trader","Fuel Trader","Co-Processing Refinery","Transloading Facility","Other"];
const BASE_PRODUCTS=["Denatured Ethanol (190 proof, fuel)","Undenatured Ethanol (200 proof, fuel)",
  "Undenatured Ethanol (200 proof, industrial)","Fiber Ethanol (RFS)","Cellulosic Ethanol (BXP)",
  "WDGS","MDGS","DDGS","Corn/Sorghum Oil","Corn Syrup","CO2 (captured)","Denaturant"];
const INV_PRODUCTS=["Corn (Feedstock)","Sorghum (Feedstock)","Denatured Ethanol","Undenatured Ethanol",
  "Fiber Ethanol","Cellulosic Ethanol","WDGS","MDGS","DDGS","Corn/Sorghum Oil","Corn Syrup","Denaturant"];
const INV_UOM={"Corn (Feedstock)":"bu","Sorghum (Feedstock)":"bu","Denatured Ethanol":"gal",
  "Undenatured Ethanol":"gal","Fiber Ethanol":"gal","Cellulosic Ethanol":"gal",
  "WDGS":"short tons","MDGS":"short tons","DDGS":"short tons","Corn/Sorghum Oil":"lbs","Corn Syrup":"lbs","Denaturant":"gal"};
const STEPS=[
  {id:"pp",label:"P&P Questionnaire",sub:"Scope of Work"},
  {id:"biz",label:"Business Rules",sub:"Account Setup"},
  {id:"brand",label:"Branding",sub:"Logos & Assets"},
  {id:"attest",label:"Attestation",sub:"Compliance Docs"},
  {id:"core",label:"Core Reference Data",sub:"Excel Inputs"},
  {id:"integ",label:"Integration Method",sub:"Data Connections"},
  {id:"pathway",label:"Pathway Data",sub:"Ethanol Codes"},
  {id:"inventory",label:"Beginning Inventory",sub:"Intake Form"},
  {id:"ack",label:"Customer Acknowledgement",sub:"Responsibility"},
];

const ATTEST_CONTENT={
  lcfs_standard:{
    label:"California LCFS",type:"Standard Attestation Verbiage",
    source:"Internal BRD — LCFS Attestation Review",
    items:[
      "The feedstock from the farms and fields listed above is sourced from land that was cleared or cultivated prior to January 1, 2008, and actively managed or fallow since January 1, 2008.",
      "Biomass was cultivated and harvested in accordance with all local, State, and federal rules and permits.",
      "The geographical shapefiles or coordinates of plot boundaries (farm, plantation or forest) accurately represent the source of the feedstock.",
      "By submitting this form, I accept responsibility for the information herein and I certify under penalty of perjury under the laws of the State of California that I have personally examined, and am familiar with, the statements and information submitted in this document.",
      "I certify that the statements and information are true, accurate, and complete.",
    ],
  },
  cfr_standard:{
    label:"Canada CFR",type:"Standard Attestation Verbiage",
    source:"Internal BRD — CFR Attestation Review",
    items:[
      "This feedstock was not harvested from land located in an area that provides a wildlife habitat for any rare, vulnerable, or threatened species.",
      "The feedstock was harvested and transported using measures that monitor, prevent, and control the introduction, spread and establishment of damaging agents, such as pests, invasive species and disease.",
      "The feedstock harvested was produced in a manner that does not create a high risk of an indirect change to land use that adversely affects the environment.",
      "This feedstock was harvested within the United States, and is located in a jurisdiction that is approved under the US EPA RFS2 Aggregate Compliance Program.",
    ],
  },
  cfr_ptd:{
    label:"Canada CFR — Biofuel Producer Declaration",type:"PTD Attestation Verbiage",
    source:"SOR/2022-140 Section 58",
    items:[
      "This quantity of fuel is eligible under the CFR and is supported through mass balance recordkeeping.",
      "This feedstock was not harvested from land located in an area that provides a wildlife habitat for any rare, vulnerable, or threatened species.",
      "The fuel and feedstock used to create it was harvested and transported using measures that monitor, prevent, and control the introduction, spread and establishment of damaging agents, such as pests, invasive species and disease.",
      "The fuel and feedstock harvested was produced in a manner that does not create a high risk of an indirect change to land use that adversely affects the environment.",
      "The fuel and feedstock was harvested within the United States, and is located in a jurisdiction that is approved under the US EPA RFS2 Aggregate Compliance Program. This feedstock is eligible for the excluded land exemption under Section 53 of the CFR.",
      "All delivery records, declarations, contracts and invoices associated with the feedstock are retained.",
      "All sales records, contracts and invoices associated with this fuel are retained.",
      "This biofuel produced from this feedstock has a CFR certification.",
    ],
  },
};

function Inp({value,onChange,placeholder,type="text"}){
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={iB} onFocus={fI} onBlur={fO}/>;
}
function Sel({value,onChange,options,placeholder}){
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{...iB,cursor:"pointer"}} onFocus={fI} onBlur={fO}>
    <option value="">{placeholder}</option>
    {options.map(o=><option key={o}>{o}</option>)}
  </select>;
}
function TA({value,onChange,placeholder,rows=3}){
  return <textarea rows={rows} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{...iB,resize:"vertical",lineHeight:1.6}} onFocus={fI} onBlur={fO}/>;
}
function Field({label,hint,req,children}){
  return <div style={{marginBottom:22}}>
    <label style={{display:"block",fontSize:13,fontWeight:600,color:G.text,marginBottom:5,letterSpacing:"0.01em"}}>
      {label}{req&&<span style={{color:G.danger,marginLeft:3}}>*</span>}
    </label>
    {hint&&<p style={{fontSize:12,color:G.muted,marginBottom:7,marginTop:-2}}>{hint}</p>}
    {children}
  </div>;
}
function SecHead({n,title}){
  return <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28,paddingBottom:16,borderBottom:`1.5px solid ${G.border}`}}>
    <div style={{width:34,height:34,borderRadius:"50%",background:G.accent,display:"flex",alignItems:"center",
      justifyContent:"center",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>{n}</div>
    <h2 style={{margin:0,fontSize:21,fontWeight:700,color:G.sidebar,fontFamily:'"Crimson Pro",Georgia,serif'}}>{title}</h2>
  </div>;
}
function Chips({opts,sel,onChange}){
  const toggle=(o)=>sel.includes(o)?onChange(sel.filter(s=>s!==o)):onChange([...sel,o]);
  return <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
    {opts.map(o=><button key={o} onClick={()=>toggle(o)} style={{padding:"6px 14px",borderRadius:20,fontSize:13,
      fontWeight:500,cursor:"pointer",transition:"all 0.15s",border:`1.5px solid ${sel.includes(o)?G.accent:G.border}`,
      background:sel.includes(o)?G.accent:"transparent",color:sel.includes(o)?"#fff":G.muted}}>{o}</button>)}
  </div>;
}
function Info({children,amber=false}){
  return <div style={{background:amber?G.amberLight:G.accentLight,border:`1.5px solid ${amber?"#D4A030":"#A8D5B8"}`,
    borderRadius:10,padding:"13px 16px",marginBottom:24,fontSize:13,color:amber?G.amber:"#1A5A35"}}>{children}</div>;
}
function AddBtn({onClick,label}){
  return <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",
    background:"none",border:`1.5px dashed ${G.accent}`,borderRadius:8,color:G.accent,
    fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}><Plus size={13}/>{label}</button>;
}
function RadioRow({opts,val,onChange}){
  return <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
    {opts.map(o=><label key={o} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"9px 15px",
      border:`1.5px solid ${val===o?G.accent:G.border}`,borderRadius:8,
      background:val===o?G.accentLight:G.input,fontSize:13,color:G.text}}>
      <input type="radio" checked={val===o} onChange={()=>onChange(o)} style={{accentColor:G.accent}}/>{o}
    </label>)}
  </div>;
}
function DropZone({uploaded,name,onToggle,label="Drop file here or click to upload",dark=false}){
  return <div onClick={onToggle} style={{border:`2px dashed ${dark?"#666":G.border}`,borderRadius:12,
    padding:36,textAlign:"center",background:uploaded?(dark?"#1A1A1A":G.accentLight):(dark?"#222":G.page),
    cursor:"pointer",transition:"all 0.15s"}}>
    {uploaded?<div>
      <div style={{width:48,height:48,background:G.accent,borderRadius:10,display:"flex",alignItems:"center",
        justifyContent:"center",margin:"0 auto 10px"}}><Check size={22} color="#fff"/></div>
      <div style={{fontSize:14,fontWeight:600,color:dark?"#A8D5B8":"#1A5A35"}}>{name}</div>
      <div style={{fontSize:12,color:G.muted,marginTop:4}}>Click to replace</div>
    </div>:<div>
      <Upload size={22} color={dark?"#666":G.muted} style={{margin:"0 auto 10px"}}/>
      <div style={{fontSize:14,fontWeight:500,color:dark?"#999":G.muted}}>{label}</div>
      <div style={{fontSize:12,color:dark?"#555":G.border,marginTop:4}}>PNG, JPEG — max 10 MB</div>
    </div>}
  </div>;
}

function AttestBlock({id,content,state,onAccept,onSetModified,onRevertText}){
  const [showTemplate,setShowTemplate]=useState(false);
  const isAccepted=state?.status==="accepted";
  const isModified=state?.status==="modified";
  const templateText=content.items.map((item,i)=>`${i+1}. ${item}`).join("\n\n");
  return <div style={{border:`1.5px solid ${isAccepted?"#A8D5B8":G.border}`,borderRadius:12,marginBottom:20,overflow:"hidden",background:isAccepted?G.accentLight:G.white}}>
    <div style={{padding:"14px 18px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",
      justifyContent:"space-between",background:isAccepted?"#D4EDDA":G.page}}>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:G.sidebar}}>{content.label}</div>
        <div style={{fontSize:12,color:G.muted,marginTop:2}}>{content.type} · Source: {content.source}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={()=>setShowTemplate(s=>!s)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",
          background:"none",border:`1px solid ${G.border}`,borderRadius:6,fontSize:12,color:G.muted,cursor:"pointer",fontFamily:"inherit"}}>
          {showTemplate?<EyeOff size={12}/>:<Eye size={12}/>}{showTemplate?"Hide":"View"} Template
        </button>
        {isAccepted&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",background:"#D4EDDA",
          border:"1px solid #A8D5B8",borderRadius:20,fontSize:12,fontWeight:600,color:"#1A5A35"}}>
          <Check size={11} strokeWidth={3}/>Accepted
        </div>}
        {isModified&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",background:G.amberLight,
          border:`1px solid #D4A030`,borderRadius:20,fontSize:12,fontWeight:600,color:G.amber}}>
          <Pencil size={11}/>Modified
        </div>}
      </div>
    </div>
    {showTemplate&&<div style={{padding:"16px 18px",background:"#F0F8F4",borderBottom:`1px solid ${G.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.07em"}}>
          Template — Attestation Verbiage Only (No Client Information)
        </div>
        <button onClick={()=>navigator.clipboard?.writeText(templateText)} style={{display:"flex",alignItems:"center",
          gap:5,padding:"4px 10px",background:"none",border:`1px solid #A8D5B8`,borderRadius:6,
          fontSize:11,color:G.accent,cursor:"pointer",fontFamily:"inherit"}}><Copy size={10}/>Copy</button>
      </div>
      <div style={{background:"#fff",border:`1px solid #A8D5B8`,borderRadius:8,padding:"14px 16px"}}>
        {content.items.map((item,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:i<content.items.length-1?10:0}}>
          <span style={{fontSize:13,fontWeight:700,color:G.accent,flexShrink:0,minWidth:18}}>{i+1}.</span>
          <span style={{fontSize:13,color:G.text,lineHeight:1.65}}>{item}</span>
        </div>)}
        <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${G.border}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {["Date of Declaration:","Signature:"].map(f=><div key={f}>
            <div style={{fontSize:11,color:G.muted,marginBottom:4}}>{f}</div>
            <div style={{height:28,borderBottom:`1px solid ${G.border}`}}/>
          </div>)}
        </div>
      </div>
    </div>}
    <div style={{padding:"16px 18px"}}>
      {!isModified?<div>{content.items.map((item,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:i<content.items.length-1?10:0}}>
        <span style={{fontSize:13,fontWeight:700,color:G.accent,flexShrink:0,minWidth:18}}>{i+1}.</span>
        <span style={{fontSize:13,color:G.text,lineHeight:1.65}}>{item}</span>
      </div>)}</div>
      :<div>
        <TA value={state.text} onChange={v=>onSetModified(id,v)} rows={8} placeholder="Edit attestation verbiage…"/>
        <button onClick={()=>onRevertText(id)} style={{marginTop:8,fontSize:12,color:G.muted,background:"none",
          border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"inherit"}}>Revert to original</button>
      </div>}
    </div>
    {!isAccepted&&<div style={{padding:"12px 18px",borderTop:`1px solid ${G.border}`,display:"flex",gap:8,background:G.page}}>
      <button onClick={()=>onAccept(id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",
        background:G.accent,border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
        <Check size={13}/>Accept as-is
      </button>
      {!isModified&&<button onClick={()=>onSetModified(id,null)} style={{display:"flex",alignItems:"center",gap:6,
        padding:"8px 16px",background:"none",border:`1.5px solid ${G.border}`,borderRadius:8,color:G.muted,
        fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}><Pencil size={13}/>Modify</button>}
      {isModified&&<button onClick={()=>onAccept(id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",
        background:"none",border:`1.5px solid ${G.accent}`,borderRadius:8,color:G.accent,
        fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}><Check size={13}/>Accept modified version</button>}
    </div>}
  </div>;
}

// ── REAL MAP COMPONENT (Leaflet + OpenStreetMap) ──
function FieldMap({ pins, onPinsChange, searchLabel, onSearchLabel }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const searchRef = useRef(searchLabel);
  const pinsRef = useRef(pins);

  useEffect(() => { searchRef.current = searchLabel; }, [searchLabel]);
  useEffect(() => { pinsRef.current = pins; }, [pins]);

  const syncMarkers = (map, L, pinList) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    pinList.forEach((pin, i) => {
      const m = L.circleMarker([parseFloat(pin.lat), parseFloat(pin.lng)], {
        radius: 9, fillColor: "#2D6A4F", color: "#fff", weight: 2.5, fillOpacity: 1,
      }).addTo(map);
      m.bindPopup(`<div style="font-family:DM Sans,sans-serif;min-width:140px">
        <div style="font-weight:700;color:#0D2B22;margin-bottom:4px">${i + 1}. ${pin.label}</div>
        <div style="font-size:12px;color:#6B6560">${pin.lat}° N</div>
        <div style="font-size:12px;color:#6B6560">${Math.abs(pin.lng)}° W</div>
      </div>`);
      markersRef.current.push(m);
    });
  };

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (mapRef.current || !containerRef.current) return;
      const L = window.L;
      const map = L.map(containerRef.current, { center: [39.5, -98.35], zoom: 4 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 18,
      }).addTo(map);
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        const label = (searchRef.current || "").trim() || `Pin ${pinsRef.current.length + 1}`;
        const next = [...pinsRef.current, { lat: lat.toFixed(5), lng: lng.toFixed(5), label }];
        onPinsChange(next);
        onSearchLabel("");
        syncMarkers(map, L, next);
      });
      mapRef.current = map;
      syncMarkers(map, L, pinsRef.current);
    };

    if (window.L) { initMap(); }
    else if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      // script already loading — poll
      const poll = setInterval(() => { if (window.L) { clearInterval(poll); initMap(); } }, 100);
    }

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Re-sync markers if pins change externally (e.g. removed from list below)
  useEffect(() => {
    if (mapRef.current && window.L) syncMarkers(mapRef.current, window.L, pins);
  }, [pins]);

  return (
    <div ref={containerRef}
      style={{ width: "100%", height: 320, borderRadius: 12, border: `1.5px solid ${G.border}`, overflow: "hidden" }} />
  );
}

function Step1({d,u}){
  const s=(f)=>(v)=>u({...d,[f]:v});
  const uc=(i,f,v)=>{const a=[...d.contacts];a[i]={...a[i],[f]:v};u({...d,contacts:a});};
  const prevYes=d.prevPart==="Yes — active participant"||d.prevPart==="Yes — lapsed";
  const [customProduct,setCustomProduct]=useState("");
  const addCustom=()=>{
    if(!customProduct.trim())return;
    u({...d,customProducts:[...(d.customProducts||[]),customProduct.trim()]});
    setCustomProduct("");
  };
  return <div>
    <SecHead n="01" title="P&P Questionnaire & Scope of Work"/>
    <div style={{marginBottom:28}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Key Contacts</div>
      <p style={{fontSize:12,color:G.muted,marginBottom:14}}>Include the commercial owner, client champion, and all key contacts involved in the deal.</p>
      {d.contacts.map((c,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:9,marginBottom:9,alignItems:"start"}}>
        <Inp value={c.name} onChange={v=>uc(i,"name",v)} placeholder="Full name"/>
        <Inp value={c.email} onChange={v=>uc(i,"email",v)} placeholder="Email" type="email"/>
        <Inp value={c.role} onChange={v=>uc(i,"role",v)} placeholder="Title / Role"/>
        {i>0?<button onClick={()=>u({...d,contacts:d.contacts.filter((_,j)=>j!==i)})} style={{padding:"9px 10px",background:"none",border:`1.5px solid ${G.border}`,borderRadius:8,cursor:"pointer",color:G.danger}}><X size={13}/></button>:<div/>}
      </div>)}
      <AddBtn onClick={()=>u({...d,contacts:[...d.contacts,{name:"",email:"",role:""}]})} label="Add Contact"/>
    </div>
    <Field label="Tenant Type" req hint="Facility type that best describes this customer">
      <Sel value={d.tenantType} onChange={s("tenantType")} options={TENANTS} placeholder="Select tenant type…"/>
    </Field>
    <Field label="Feedstock(s)" req hint="All feedstocks in scope">
      <Chips opts={FEEDSTOCKS} sel={d.feedstocks} onChange={s("feedstocks")}/>
    </Field>
    <Field label="Program(s) of Interest" req hint="All low-carbon programs this customer participates in or plans to join">
      <Chips opts={PROGRAMS} sel={d.programs} onChange={s("programs")}/>
    </Field>
    <Field label="Products & Co-Products" req hint="Select all outputs this facility produces, or type in a custom product below">
      <Chips opts={BASE_PRODUCTS} sel={d.products} onChange={s("products")}/>
      {(d.customProducts||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
        {(d.customProducts||[]).map((cp,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",
          borderRadius:20,fontSize:13,fontWeight:500,background:G.amberLight,border:`1.5px solid #D4A030`,color:G.amber}}>
          {cp}
          <button onClick={()=>u({...d,customProducts:(d.customProducts||[]).filter((_,j)=>j!==i)})}
            style={{background:"none",border:"none",cursor:"pointer",color:G.amber,padding:0,lineHeight:0}}>
            <X size={11}/></button>
        </div>)}
      </div>}
      <div style={{display:"flex",gap:9,marginTop:12,alignItems:"center"}}>
        <input value={customProduct} onChange={e=>setCustomProduct(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addCustom();}}}
          placeholder="Add custom product or co-product…"
          style={{...iB,flex:1}} onFocus={fI} onBlur={fO}/>
        <button onClick={addCustom} style={{padding:"9px 16px",background:G.accent,border:"none",borderRadius:8,
          color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Add</button>
      </div>
    </Field>
    <Field label="Certified vs. Non-Certified Material" req>
      <RadioRow opts={["Certified only","Non-certified only","Both"]} val={d.certMat} onChange={s("certMat")}/>
    </Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Field label="Program Start Date (Day 1 of Tracking)" req>
        <Inp value={d.startDate} onChange={s("startDate")} type="date"/>
      </Field>
      <Field label="Previous Program Participation" req>
        <Sel value={d.prevPart} onChange={s("prevPart")}
          options={["Yes — active participant","Yes — lapsed","No — first enrollment"]} placeholder="Select…"/>
      </Field>
    </div>
    {prevYes&&(()=>{
      const currentYear=new Date().getFullYear();
      const years=Array.from({length:currentYear-2014},(_,i)=>String(currentYear-i));
      const dates=d.programDates||{};
      return <div style={{marginBottom:22,background:G.accentLight,border:`1.5px solid #A8D5B8`,borderRadius:10,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid #A8D5B8`,background:"#D4EDDA"}}>
          <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>
            Program Participation Start Years
          </div>
          <p style={{fontSize:12,color:"#1A5A35",margin:0}}>
            Select the start year of internal traceability for each program. Leave blank if not applicable.
          </p>
        </div>
        <div style={{padding:"12px 18px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {PROGRAMS.map(prog=>{
              const hasYear=!!dates[prog];
              return <div key={prog} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"9px 12px",background:hasYear?G.white:"rgba(255,255,255,0.5)",
                border:`1px solid ${hasYear?"#A8D5B8":G.border}`,borderRadius:8,gap:10,
                transition:"all 0.15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                  <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
                    background:hasYear?G.accent:"#C8C0B2",transition:"background 0.15s"}}/>
                  <span style={{fontSize:12,fontWeight:hasYear?600:400,color:hasYear?G.sidebar:G.muted,
                    lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{prog}</span>
                </div>
                <select value={dates[prog]||""}
                  onChange={e=>u({...d,programDates:{...(d.programDates||{}),[prog]:e.target.value}})}
                  style={{padding:"5px 8px",border:`1.5px solid ${hasYear?"#A8D5B8":G.border}`,borderRadius:6,
                    fontSize:12,color:hasYear?G.text:G.muted,background:G.input,outline:"none",
                    fontFamily:"inherit",cursor:"pointer",flexShrink:0,minWidth:80}}>
                  <option value="">Year…</option>
                  {years.map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>;
            })}
          </div>
        </div>
      </div>;
    })()}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Field label="Estimated Number of Locations" req>
        <Inp value={d.locCount} onChange={s("locCount")} placeholder="e.g. 1, 3, 12" type="number"/>
      </Field>
      <Field label="Growers Shipping to Multiple Locations?" req hint="Do any growers ship certified feedstock to more than one of this customer's facilities?">
        <RadioRow opts={["Yes","No"]} val={d.growersMultiLoc} onChange={s("growersMultiLoc")}/>
      </Field>
    </div>
    <Field label="Internal Transfers Between Facilities?" req hint="Does this customer transfer certified material between their own facilities?">
      <RadioRow opts={["Yes","No","N/A"]} val={d.internalTransfers} onChange={s("internalTransfers")}/>
    </Field>
    <Field label="Feedstock Origin / Traceability System" req>
      <Sel value={d.traceSys} onChange={s("traceSys")}
        options={["Regrow","Self-Created / Managed Online Form","Paper Declarations","3rd Party Forms"]}
        placeholder="Select primary system…"/>
    </Field>
    <Field label="Do you use 3rd party blanket declarations?" hint="Blanket declarations have no initial feedstock quantities — all quantities filled in at year-end for delivered feedstock">
      <RadioRow opts={["Yes","No"]} val={d.blanketDecl} onChange={s("blanketDecl")}/>
    </Field>
    {d.blanketDecl==="Yes"&&<div style={{marginBottom:22,padding:"16px 18px",border:`1.5px solid ${G.border}`,borderRadius:10,background:G.page}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>
        Suppliers Using Blanket Declarations
      </div>
      <p style={{fontSize:12,color:G.muted,marginBottom:14}}>List all suppliers for which blanket declarations apply.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:9,marginBottom:8,padding:"0 4px"}}>
        {["Supplier Name","Supplier ID",""].map(h=><div key={h} style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</div>)}
      </div>
      {(d.blanketSuppliers||[{name:"",id:""}]).map((row,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:9,marginBottom:9,alignItems:"start"}}>
        <Inp value={row.name||""} onChange={v=>{const a=[...(d.blanketSuppliers||[{name:"",id:""}])];a[i]={...a[i],name:v};u({...d,blanketSuppliers:a});}} placeholder="e.g. John Doe Grain Co."/>
        <Inp value={row.id||""} onChange={v=>{const a=[...(d.blanketSuppliers||[{name:"",id:""}])];a[i]={...a[i],id:v};u({...d,blanketSuppliers:a});}} placeholder="Supplier ID"/>
        {i>0?<button onClick={()=>u({...d,blanketSuppliers:(d.blanketSuppliers||[]).filter((_,j)=>j!==i)})} style={{padding:"9px 10px",background:"none",border:`1.5px solid ${G.border}`,borderRadius:8,cursor:"pointer",color:G.danger}}><X size={13}/></button>:<div style={{width:38}}/>}
      </div>)}
      <AddBtn onClick={()=>u({...d,blanketSuppliers:[...(d.blanketSuppliers||[{name:"",id:""}]),{name:"",id:""}]})} label="Add Supplier"/>
    </div>}
    <Field label="Connections to Existing Network Businesses" hint="List any businesses this account connects to within the existing platform network">
      <TA value={d.netConn} onChange={s("netConn")} placeholder="Business names and relationship type…"/>
    </Field>
    <Field label="Third-Party Validation Platform" req>
      <RadioRow opts={["Yes — integrated","No — not yet connected","Unknown / TBD"]} val={d.cibo} onChange={s("cibo")}/>
    </Field>
  </div>;
}

function Step2({d,u}){
  const s=(f)=>(v)=>u({...d,[f]:v});
  const CHECKS=["Record retention confirmed per program requirements","Carryover volumes policy confirmed (feedstock + fuel)",
    "True-up frequency set (default: monthly)","PTD issuance frequency set (default: per order)","Exception handling rules reviewed (Standards tab)"];
  return <div>
    <SecHead n="02" title="Business Rules — Account Setup"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Field label="Customer Legal Name" req hint="Full legal entity name as it should appear on contracts and PTDs">
        <Inp value={d.legalName||""} onChange={s("legalName")} placeholder="e.g. Heartland Energy Cooperative"/>
      </Field>
      <Field label="Customer Website" hint="Link to the company website">
        <Inp value={d.website||""} onChange={s("website")} placeholder="https://www.example.com" type="url"/>
      </Field>
    </div>
    <Info>Complete all three touchpoints with the customer before advancing to Config &amp; Build.</Info>
    <Field label="Commercial Handoff Status" req hint="Indicates whether Commercial has confirmed the client is aware they need to complete this process and CS is cleared to proceed">
      <RadioRow opts={[
        "Pending — awaiting Commercial handoff",
        "Handoff received — ready to schedule kickoff",
        "Kickoff scheduled",
      ]} val={d.docStatus} onChange={s("docStatus")}/>
    </Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Field label="Client Availability for Tentative Kickoff" hint="List all available dates and times provided by the client — CS will confirm">
        <TA value={d.meetDate} onChange={s("meetDate")} rows={4}
          placeholder={"e.g.\nMon Jan 13, 10:00am–12:00pm CT\nWed Jan 15, 2:00pm–4:00pm CT\nFri Jan 17, any time after 9am CT"}/>
      </Field>
      <Field label="Internal Team Review Status" req>
        <Sel value={d.reviewStatus} onChange={s("reviewStatus")}
          options={["Pending","Scheduled","Completed — approved","Completed — revisions needed"]}
          placeholder="Select status…"/>
      </Field>
    </div>
    <Field label="Key Decisions & Notes" hint="Non-standard configurations, overrides from platform defaults, open items">
      <TA value={d.notes} onChange={s("notes")} rows={4}
        placeholder="e.g. Customer uses 3rd-party blanket declarations for Supplier X. Carryover volumes confirmed for feedstock only. Site-wide totals only — no per-tank breakdowns…"/>
    </Field>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Standard Configuration Confirmations</div>
      {CHECKS.map((c,i)=><label key={c} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
        border:`1.5px solid ${(d.checks||[])[i]?G.accent:G.border}`,borderRadius:8,marginBottom:8,
        background:(d.checks||[])[i]?G.accentLight:G.input,fontSize:13,color:G.text,cursor:"pointer"}}>
        <input type="checkbox" checked={!!(d.checks||[])[i]}
          onChange={()=>{const ch=[...(d.checks||Array(CHECKS.length).fill(false))];ch[i]=!ch[i];u({...d,checks:ch});}}
          style={{accentColor:G.accent,width:15,height:15}}/>{c}
      </label>)}
    </div>
  </div>;
}

function Step3({d,u}){
  const s=(f)=>(v)=>u({...d,[f]:v});
  return <div>
    <SecHead n="03" title="Branding"/>
    <Info>Logos are embedded in system-generated PTDs, audit packages, and customer-facing exports. PNG or JPEG preferred. Minimum 300px wide.</Info>
    <Field label="Primary Company Logo" req hint="PNG or JPEG, transparent background preferred">
      <DropZone uploaded={d.logoUploaded} name={d.logoName||"company_logo.png"}
        onToggle={()=>u({...d,logoUploaded:!d.logoUploaded,logoName:!d.logoUploaded?"company_logo.png":""})}/>
    </Field>
    <Field label="Dark / Reversed Logo Variant" hint="Optional — used on dark backgrounds in reports">
      <DropZone uploaded={d.darkLogoUploaded} name={d.darkLogoName||"company_logo_dark.png"}
        onToggle={()=>u({...d,darkLogoUploaded:!d.darkLogoUploaded,darkLogoName:!d.darkLogoUploaded?"company_logo_dark.png":""})}
        dark label="Upload dark version (optional)"/>
    </Field>
    <Field label="Brand / Usage Notes" hint="Any restrictions or brand guidelines to note">
      <TA value={d.notes||""} onChange={s("notes")} rows={2} placeholder="e.g. Use only on white backgrounds. Do not stretch or alter proportions…"/>
    </Field>
  </div>;
}

function Step4({d,u}){
  const s=(f)=>(v)=>u({...d,[f]:v});
  const tP=(p)=>{const sel=(d.selProgs||[]);u({...d,selProgs:sel.includes(p)?sel.filter(x=>x!==p):[...sel,p]});};
  const ATTEST_PROGS=["California LCFS","Canada CFR","Oregon CFP","Washington CFR","Expanded / Custom","ISCC"];
  const handleAccept=(id)=>{
    const aS={...(d.attestStates||{})};
    aS[id]={status:"accepted",text:(aS[id]?.text||ATTEST_CONTENT[id].items.map((x,i)=>`${i+1}. ${x}`).join("\n\n"))};
    u({...d,attestStates:aS});
  };
  const handleSetModified=(id,text)=>{
    const aS={...(d.attestStates||{})};
    const base=ATTEST_CONTENT[id].items.map((x,i)=>`${i+1}. ${x}`).join("\n\n");
    aS[id]={status:"modified",text:text===null?base:text};
    u({...d,attestStates:aS});
  };
  const handleRevert=(id)=>{
    const aS={...(d.attestStates||{})};
    aS[id]={status:"modified",text:ATTEST_CONTENT[id].items.map((x,i)=>`${i+1}. ${x}`).join("\n\n")};
    u({...d,attestStates:aS});
  };
  return <div>
    <SecHead n="04" title="Attestation & Compliance Documentation"/>
    <Info>Standard attestation verbiage is pre-filled from approved regulatory templates. Review each section and either accept as-is or modify for this customer.</Info>
    <Field label="Program-Specific Attestation Scope" req hint="Select all programs requiring attestation setup">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
        {ATTEST_PROGS.map(p=><div key={p} onClick={()=>tP(p)} style={{padding:"14px 15px",
          border:`1.5px solid ${(d.selProgs||[]).includes(p)?G.accent:G.border}`,borderRadius:10,
          background:(d.selProgs||[]).includes(p)?G.accentLight:G.input,cursor:"pointer",display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:17,height:17,borderRadius:4,border:`2px solid ${(d.selProgs||[]).includes(p)?G.accent:G.border}`,
            background:(d.selProgs||[]).includes(p)?G.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {(d.selProgs||[]).includes(p)&&<Check size={9} color="#fff" strokeWidth={3}/>}
          </div>
          <span style={{fontSize:13,fontWeight:500,color:G.text}}>{p}</span>
        </div>)}
      </div>
    </Field>
    <div style={{marginBottom:8}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Standard Attestation Verbiage</div>
      <AttestBlock id="lcfs_standard" content={ATTEST_CONTENT.lcfs_standard} state={(d.attestStates||{}).lcfs_standard}
        onAccept={handleAccept} onSetModified={handleSetModified} onRevertText={handleRevert}/>
      <AttestBlock id="cfr_standard" content={ATTEST_CONTENT.cfr_standard} state={(d.attestStates||{}).cfr_standard}
        onAccept={handleAccept} onSetModified={handleSetModified} onRevertText={handleRevert}/>
    </div>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>PTD Attestation Verbiage</div>
      <AttestBlock id="cfr_ptd" content={ATTEST_CONTENT.cfr_ptd} state={(d.attestStates||{}).cfr_ptd}
        onAccept={handleAccept} onSetModified={handleSetModified} onRevertText={handleRevert}/>
    </div>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Expanded / Custom Attestation Verbiage</div>
      <Field label="Canada CFR + California LCFS — Expanded / Custom" hint="Additional language required beyond the standard verbiage above, applicable to one or both programs">
        <TA value={d.custVerb||""} onChange={s("custVerb")} rows={5} placeholder="Enter any expanded or custom attestation language for Canada CFR and/or California LCFS…"/>
      </Field>
    </div>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Attestation Excel Files</div>
      {(d.files||[]).map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 14px",border:"1.5px solid #A8D5B8",borderRadius:8,background:G.accentLight,marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#1A5A35",fontWeight:500}}><FileText size={13}/>{f}</div>
        <button onClick={()=>u({...d,files:(d.files||[]).filter((_,j)=>j!==i)})} style={{background:"none",border:"none",cursor:"pointer",color:G.danger,padding:2}}><X size={13}/></button>
      </div>)}
      <div onClick={()=>u({...d,files:[...(d.files||[]),`attestation_${((d.files||[]).length+1)}.xlsx`]})}
        style={{border:`2px dashed ${G.border}`,borderRadius:10,padding:22,textAlign:"center",cursor:"pointer",background:G.page}}>
        <Upload size={18} color={G.muted} style={{margin:"0 auto 7px"}}/>
        <div style={{fontSize:13,color:G.muted}}>Upload attestation Excel files</div>
        <div style={{fontSize:12,color:G.border,marginTop:4}}>XLS, XLSX — multiple files accepted</div>
      </div>
    </div>
    {/* ── GeoJSON / Shapefile Upload ── */}
    <div style={{marginBottom:24}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Field Boundaries — GeoJSON / Shapefiles</div>
      <p style={{fontSize:12,color:G.muted,marginBottom:12}}>Upload field boundary files used in grower declarations. Accepted formats: GeoJSON, .shp, .kml, .gpx.</p>
      {(d.geoFiles||[]).map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 14px",border:"1.5px solid #A8D5B8",borderRadius:8,background:G.accentLight,marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#1A5A35",fontWeight:500}}><FileText size={13}/>{f}</div>
        <button onClick={()=>u({...d,geoFiles:(d.geoFiles||[]).filter((_,j)=>j!==i)})} style={{background:"none",border:"none",cursor:"pointer",color:G.danger,padding:2}}><X size={13}/></button>
      </div>)}
      <div onClick={()=>u({...d,geoFiles:[...(d.geoFiles||[]),`field_boundary_${((d.geoFiles||[]).length+1)}.geojson`]})}
        style={{border:`2px dashed ${G.border}`,borderRadius:10,padding:22,textAlign:"center",cursor:"pointer",background:G.page}}>
        <Upload size={18} color={G.muted} style={{margin:"0 auto 7px"}}/>
        <div style={{fontSize:13,color:G.muted}}>Upload GeoJSON, shapefile, KML, or GPX</div>
        <div style={{fontSize:12,color:G.border,marginTop:4}}>.geojson · .shp · .kml · .gpx — multiple files accepted</div>
      </div>
    </div>
    {/* ── Interactive Field Map ── */}
    <div style={{marginBottom:24}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>
        Field Location Map
      </div>
      <p style={{fontSize:12,color:G.muted,marginBottom:12}}>
        Click anywhere on the map to drop a pin and capture coordinates. Each pin is added to the Field List below — type in the field name after placing the pin. Required for California LCFS compliance.
      </p>
      <FieldMap
        pins={d.mapPins||[]}
        onPinsChange={newPins=>u({...d,mapPins:newPins})}
        searchLabel=""
        onSearchLabel={()=>{}}
      />
      {/* Field List — auto-populates as pins are dropped */}
      <div style={{marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.07em"}}>
            Field List {(d.mapPins||[]).length>0&&<span style={{fontWeight:400,color:G.muted,textTransform:"none",letterSpacing:0}}>— {(d.mapPins||[]).length} field{(d.mapPins||[]).length!==1?"s":""}</span>}
          </div>
          {(d.mapPins||[]).length===0&&<span style={{fontSize:12,color:G.muted,fontStyle:"italic"}}>No pins dropped yet — click on the map above</span>}
        </div>
        {(d.mapPins||[]).length>0&&<>
          <div style={{display:"grid",gridTemplateColumns:"28px 1fr 120px 120px auto",gap:9,padding:"7px 12px",
            background:"#EAE5DC",borderRadius:"8px 8px 0 0"}}>
            {["#","Field Name","Latitude","Longitude",""].map(h=><div key={h} style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</div>)}
          </div>
          {(d.mapPins||[]).map((pin,i)=>{
            const updPin=(f,v)=>{const a=[...(d.mapPins||[])];a[i]={...a[i],[f]:v};u({...d,mapPins:a});};
            return <div key={i} style={{display:"grid",gridTemplateColumns:"28px 1fr 120px 120px auto",gap:9,
              padding:"8px 12px",background:i%2===0?G.white:G.page,border:`1px solid ${G.border}`,borderTop:"none",alignItems:"center"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:G.accent,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
              <input value={pin.label||""} onChange={e=>updPin("label",e.target.value)}
                placeholder="Enter field name…"
                style={{...iB,fontSize:13,padding:"7px 10px"}} onFocus={fI} onBlur={fO}/>
              <div style={{fontSize:12,fontFamily:"monospace",color:G.muted,padding:"0 4px"}}>{pin.lat}° N</div>
              <div style={{fontSize:12,fontFamily:"monospace",color:G.muted,padding:"0 4px"}}>{Math.abs(pin.lng)}° W</div>
              <button onClick={()=>u({...d,mapPins:(d.mapPins||[]).filter((_,j)=>j!==i)})}
                style={{background:"none",border:"none",cursor:"pointer",color:G.danger,padding:2,flexShrink:0}}><X size={13}/></button>
            </div>;
          })}
          <div style={{padding:"8px 12px",background:G.accentLight,border:`1px solid ${G.border}`,borderTop:"none",
            borderRadius:"0 0 8px 8px",fontSize:11,color:"#1A5A35",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>✓ {(d.mapPins||[]).length} coordinate{(d.mapPins||[]).length!==1?"s":""} recorded — lat/lng to 5 decimal places</span>
            <span style={{color:G.muted}}>Click the map to add more fields</span>
          </div>
        </>}
      </div>
    </div>
  </div>;
}

function Step5({d,u}){
  const s=(f)=>(v)=>u({...d,[f]:v});
  const uFac=(i,f,v)=>{const a=[...d.facilities];a[i]={...a[i],[f]:v};u({...d,facilities:a});};
  const uSig=(i,f,v)=>{const a=[...d.signatories];a[i]={...a[i],[f]:v};u({...d,signatories:a});};
  return <div>
    <SecHead n="05" title="Core Reference Data"/>
    <div style={{marginBottom:30}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Facility Address List</div>
      {d.facilities.map((f,i)=><div key={i} style={{padding:16,border:`1.5px solid ${G.border}`,borderRadius:10,marginBottom:10,background:G.page}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:13,fontWeight:600,color:G.muted}}>Facility {i+1}</span>
          {i>0&&<button onClick={()=>u({...d,facilities:d.facilities.filter((_,j)=>j!==i)})} style={{background:"none",border:"none",cursor:"pointer",color:G.danger,fontSize:12}}>Remove</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:9,marginBottom:9}}>
          <Inp value={f.name} onChange={v=>uFac(i,"name",v)} placeholder="Facility name"/>
          <Inp value={f.addr} onChange={v=>uFac(i,"addr",v)} placeholder="Street address"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:9}}>
          <Inp value={f.city} onChange={v=>uFac(i,"city",v)} placeholder="City"/>
          <Inp value={f.state} onChange={v=>uFac(i,"state",v)} placeholder="State"/>
          <Inp value={f.zip} onChange={v=>uFac(i,"zip",v)} placeholder="ZIP"/>
        </div>
      </div>)}
      <AddBtn onClick={()=>u({...d,facilities:[...d.facilities,{name:"",addr:"",city:"",state:"",zip:""}]})} label="Add Facility"/>
    </div>
    <div style={{marginBottom:30}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Authorized Signatories</div>
      {d.signatories.map((sig,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:9,marginBottom:9,alignItems:"start"}}>
        <Inp value={sig.name} onChange={v=>uSig(i,"name",v)} placeholder="Full name"/>
        <Inp value={sig.title} onChange={v=>uSig(i,"title",v)} placeholder="Title / Role"/>
        <Inp value={sig.email} onChange={v=>uSig(i,"email",v)} placeholder="Email" type="email"/>
        {i>0?<button onClick={()=>u({...d,signatories:d.signatories.filter((_,j)=>j!==i)})} style={{padding:"9px 10px",background:"none",border:`1.5px solid ${G.border}`,borderRadius:8,cursor:"pointer",color:G.danger}}><X size={13}/></button>:<div/>}
      </div>)}
      <AddBtn onClick={()=>u({...d,signatories:[...d.signatories,{name:"",title:"",email:""}]})} label="Add Signatory"/>
    </div>
    <div style={{marginBottom:22}}>
      <label style={{display:"block",fontSize:13,fontWeight:600,color:G.text,marginBottom:5}}>Grower List</label>
      <p style={{fontSize:12,color:G.muted,marginBottom:10}}>Upload a CSV or Excel file containing your grower organizations.</p>
      <div style={{background:G.amberLight,border:`1.5px solid #D4A030`,borderRadius:10,padding:"13px 16px",marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:G.amber,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>
          Minimum Requirements for Onboarding Grower Organizations
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 24px"}}>
          {[
            {field:"Name"},
            {field:"Customer ID"},
            {field:"Email"},
            {field:"Phone"},
            {field:"Farm Physical Address",note:"Street, City, State, ZIP — cannot be a PO Box"},
            {field:"Mailing Address",note:"Street, City, State, ZIP"},
          ].map(r=><div key={r.field} style={{display:"flex",gap:7,alignItems:"baseline",padding:"4px 0"}}>
            <span style={{fontSize:11,color:G.amber,flexShrink:0}}>▸</span>
            <span style={{fontSize:13,color:G.text,fontWeight:600}}>{r.field}
              {r.note&&<span style={{fontWeight:400,color:G.muted}}> — {r.note}</span>}
            </span>
          </div>)}
        </div>
      </div>
      <div onClick={()=>u({...d,growerFileUploaded:!d.growerFileUploaded,growerFileName:!d.growerFileUploaded?"grower_list.csv":""})}
        style={{border:`2px dashed ${d.growerFileUploaded?"#A8D5B8":G.border}`,borderRadius:12,padding:32,textAlign:"center",
        background:d.growerFileUploaded?G.accentLight:G.page,cursor:"pointer",transition:"all 0.15s"}}>
        {d.growerFileUploaded?<div>
          <div style={{width:48,height:48,background:G.accent,borderRadius:10,display:"flex",alignItems:"center",
            justifyContent:"center",margin:"0 auto 10px"}}><Check size={22} color="#fff"/></div>
          <div style={{fontSize:14,fontWeight:600,color:"#1A5A35"}}>{d.growerFileName}</div>
          <div style={{fontSize:12,color:G.muted,marginTop:4}}>Click to replace</div>
        </div>:<div>
          <Upload size={22} color={G.muted} style={{margin:"0 auto 10px"}}/>
          <div style={{fontSize:14,fontWeight:500,color:G.muted}}>Drop grower list here or click to upload</div>
          <div style={{fontSize:12,color:G.border,marginTop:4}}>CSV or XLSX — max 25 MB</div>
        </div>}
      </div>
    </div>
    <Field label="Transaction Data — Scale Ticket Method" hint="How will scale ticket / transaction data be delivered to the platform?">
      <Sel value={d.scaleMethod} onChange={s("scaleMethod")}
        options={["Direct ERP integration","CSV upload (manual)","CSV upload (automated)","API push from scale system","Manual entry by customer","TBD"]}
        placeholder="Select method…"/>
    </Field>
  </div>;
}

function Step6({d,u}){
  const s=(f)=>(v)=>u({...d,[f]:v});
  const opts=[{id:"api",label:"API Integration",sub:"Preferred method",badge:"PREFERRED"},
    {id:"csv",label:"CSV Upload Template",sub:"Fallback / manual method",badge:null},
    {id:"custom",label:"Custom Integration",sub:"Requires custom scope",badge:"CUSTOM WORK"}];
  return <div>
    <SecHead n="06" title="Integration Method"/>
    <Field label="Primary Data Integration Method" req>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        {opts.map(o=><div key={o.id} onClick={()=>s("method")(o.id)} style={{padding:20,
          border:`2px solid ${d.method===o.id?G.accent:G.border}`,borderRadius:12,
          background:d.method===o.id?G.accentLight:G.input,cursor:"pointer",position:"relative",transition:"all 0.15s"}}>
          {o.badge&&<span style={{position:"absolute",top:11,right:11,fontSize:10,fontWeight:700,padding:"2px 8px",
            borderRadius:10,background:o.id==="api"?G.accent:G.danger,color:"#fff",letterSpacing:"0.04em"}}>{o.badge}</span>}
          <div style={{width:34,height:34,borderRadius:8,background:d.method===o.id?G.accent:"#EAE5DC",
            display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
            {o.id==="api"?<Zap size={15} color={d.method===o.id?"#fff":G.muted}/>
              :o.id==="csv"?<FileText size={15} color={d.method===o.id?"#fff":G.muted}/>
              :<Settings size={15} color={d.method===o.id?"#fff":G.muted}/>}
          </div>
          <div style={{fontSize:15,fontWeight:600,color:G.text,marginBottom:4}}>{o.label}</div>
          <div style={{fontSize:12,color:G.muted}}>{o.sub}</div>
        </div>)}
      </div>
    </Field>
    {d.method==="api"&&<Field label="API Integration Notes" hint="Credentials, environment setup, test vs. production, key contacts">
      <TA value={d.apiNotes||""} onChange={s("apiNotes")} rows={3} placeholder="e.g. Customer IT contact: Jane Smith (jane@acme.com). Sandbox credentials to be issued by Engineering. Go-live API switch post-UAT…"/>
    </Field>}
    {d.method==="csv"&&<Field label="CSV Template Notes" hint="Format, upload frequency, and who manages uploads">
      <TA value={d.csvNotes||""} onChange={s("csvNotes")} rows={3} placeholder="e.g. Weekly uploads by ops team. Standard CSV template. Two files: inbound lots and outbound orders…"/>
    </Field>}
    {d.method==="custom"&&<>
      <Field label="Custom Integration Scope" req hint="Define what custom work is required — this will be scoped by Engineering">
        <TA value={d.custScope||""} onChange={s("custScope")} rows={4} placeholder="Source systems, data types, transformation requirements, authentication, and known constraints…"/>
      </Field>
      <Field label="Custom Work Rates / Agreement Reference" hint="Reference the applicable rate schedule or SOW addendum">
        <Inp value={d.custRates||""} onChange={s("custRates")} placeholder="e.g. Per standard custom dev rate schedule, Addendum 2 to SOW"/>
      </Field>
    </>}
  </div>;
}

function Step7({d,u}){
  const uc=(i,f,v)=>{const a=[...d.codes];a[i]={...a[i],[f]:v};u({...d,codes:a});};
  return <div>
    <SecHead n="07" title="Pathway Data"/>
    <Info>Pathway codes determine carbon intensity values assigned to certified fuel in each program. Codes are typically provided by the regulatory agency or lifecycle analysis model (e.g. GREET).</Info>
    <div style={{marginBottom:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 2fr auto",gap:9,marginBottom:8,padding:"0 4px"}}>
        {["Program","Pathway Code","Description / Notes",""].map(h=><div key={h} style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</div>)}
      </div>
      {d.codes.map((c,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 2fr auto",gap:9,marginBottom:9,alignItems:"start"}}>
        <Sel value={c.prog||""} onChange={v=>uc(i,"prog",v)}
          options={["California LCFS","Canada CFR","Oregon CFP","Washington CFR","BC LCFS","45Z"]} placeholder="Program…"/>
        <Inp value={c.code||""} onChange={v=>uc(i,"code",v)} placeholder="e.g. ETHC001"/>
        <Inp value={c.desc||""} onChange={v=>uc(i,"desc",v)} placeholder="e.g. Corn ethanol, GREET, CI 45.3"/>
        {i>0?<button onClick={()=>u({...d,codes:d.codes.filter((_,j)=>j!==i)})} style={{padding:"9px 10px",background:"none",border:`1.5px solid ${G.border}`,borderRadius:8,cursor:"pointer",color:G.danger}}><X size={13}/></button>:<div/>}
      </div>)}
    </div>
    <AddBtn onClick={()=>u({...d,codes:[...d.codes,{prog:"",code:"",desc:""}]})} label="Add Pathway Code"/>
  </div>;
}

function Step8({d,u}){
  const s=(f)=>(v)=>u({...d,[f]:v});
  const ub=(p,f,v)=>u({...d,balances:{...(d.balances||{}),[p]:{...(d.balances||{})[p],[f]:v}}});
  return <div>
    <SecHead n="08" title="Beginning Inventory Intake"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Field label="Snapshot As-Of Date" req><Inp value={d.snapDate||""} onChange={s("snapDate")} type="date"/></Field>
      <Field label="Inventory Basis" req>
        <Sel value={d.basis||""} onChange={s("basis")}
          options={["Physical count","Book / ERP","Both — physical authoritative","Both — ERP authoritative"]} placeholder="Select basis…"/>
      </Field>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Field label="Sign-Off Owner" req><Inp value={d.signName||""} onChange={s("signName")} placeholder="Full name"/></Field>
      <Field label="Sign-Off Owner Email" req><Inp value={d.signEmail||""} onChange={s("signEmail")} placeholder="Email address" type="email"/></Field>
    </div>
    <Field label="Products in Scope" req hint="Select all products for which a starting balance is needed">
      <Chips opts={INV_PRODUCTS} sel={d.products||[]} onChange={(prods)=>{
        const bal={...(d.balances||{})};
        (d.products||[]).filter(p=>!prods.includes(p)).forEach(p=>delete bal[p]);
        prods.filter(p=>!bal[p]).forEach(p=>{bal[p]={cert:"",uncert:"",src:""};});
        u({...d,products:prods,balances:bal});
      }}/>
    </Field>
    {(d.products||[]).length>0&&<div style={{marginTop:24}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Starting Inventory Balances</div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr 0.7fr 1.2fr",gap:9,padding:"8px 12px",background:"#EAE5DC",borderRadius:"8px 8px 0 0",marginBottom:2}}>
        {["Product","Qty Certified","Qty Uncertified","UOM","Source Report"].map(h=><div key={h} style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</div>)}
      </div>
      {(d.products||[]).map((p,i)=><div key={p} style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr 0.7fr 1.2fr",gap:9,padding:"9px 12px",background:i%2===0?G.white:G.page,border:`1px solid ${G.border}`,borderTop:"none"}}>
        <div style={{fontSize:13,fontWeight:600,color:G.text,display:"flex",alignItems:"center"}}>{p}</div>
        <input value={(d.balances||{})[p]?.cert||""} onChange={e=>ub(p,"cert",e.target.value)} placeholder="0" style={{...iB,fontSize:13,padding:"7px 10px"}} onFocus={fI} onBlur={fO}/>
        <input value={(d.balances||{})[p]?.uncert||""} onChange={e=>ub(p,"uncert",e.target.value)} placeholder="0" style={{...iB,fontSize:13,padding:"7px 10px"}} onFocus={fI} onBlur={fO}/>
        <div style={{fontSize:13,color:G.muted,fontStyle:"italic",display:"flex",alignItems:"center"}}>{INV_UOM[p]||"—"}</div>
        <input value={(d.balances||{})[p]?.src||""} onChange={e=>ub(p,"src",e.target.value)} placeholder="Report name" style={{...iB,fontSize:13,padding:"7px 10px"}} onFocus={fI} onBlur={fO}/>
      </div>)}
      <div style={{padding:"9px 12px",background:G.accentLight,border:`1px solid ${G.border}`,borderTop:"none",borderRadius:"0 0 8px 8px",fontSize:12,color:"#1A5A35"}}>
        ✓ Consistency check: Certified + Uncertified should equal the site-wide total per product
      </div>
    </div>}
    <div style={{marginTop:22}}>
      <Field label="Quarter-End Cutoff Rules" hint="How were in-transit, staged, off-site, WIP, and line-fill quantities handled?">
        <TA value={d.cutoff||""} onChange={s("cutoff")} rows={3} placeholder="e.g. In-transit excluded. Off-site storage included at ERP book value. WIP treated as feedstock at process entry…"/>
      </Field>
    </div>
  </div>;
}

function Step9({d,u}){
  const s=(f)=>(v)=>u({...d,[f]:v});
  const opts=["Confirmed","Not Yet Discussed","Pending Legal Review"];
  const colors={
    "Confirmed":{bg:G.accentLight,border:"#A8D5B8",text:"#1A5A35"},
    "Not Yet Discussed":{bg:G.amberLight,border:"#D4A030",text:G.amber},
    "Pending Legal Review":{bg:"#FDF0F0",border:"#D4887A",text:"#8B2E20"},
  };
  const sel=d.status;
  return <div>
    <SecHead n="09" title="Customer Responsibility Acknowledgement"/>
    <div style={{background:G.amberLight,border:`1.5px solid #D4A030`,borderRadius:10,padding:"14px 18px",marginBottom:28}}>
      <div style={{fontSize:13,color:G.amber,lineHeight:1.7}}>
        Confirm the customer understands and accepts responsibility for the accuracy of any data passed to the mass balance platform from a third-party traceability system. Non-compliant or incomplete data remains the customer's responsibility.
      </div>
    </div>
    <Field label="Acknowledgement Status" req>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {opts.map(opt=>{
          const active=sel===opt;
          const c=colors[opt];
          return <label key={opt} style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",padding:"14px 18px",
            border:`1.5px solid ${active?c.border:G.border}`,borderRadius:10,
            background:active?c.bg:G.input,transition:"all 0.15s"}}>
            <input type="radio" checked={active} onChange={()=>s("status")(opt)}
              style={{accentColor:G.accent,marginTop:2,flexShrink:0}}/>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:active?c.text:G.text}}>{opt}</div>
              <div style={{fontSize:12,color:G.muted,marginTop:3}}>
                {opt==="Confirmed"&&"Customer has reviewed and accepted responsibility for third-party data accuracy."}
                {opt==="Not Yet Discussed"&&"This has not been raised with the customer yet — schedule a conversation before go-live."}
                {opt==="Pending Legal Review"&&"Customer's legal team is reviewing the terms — follow up before proceeding to production."}
              </div>
            </div>
          </label>;
        })}
      </div>
    </Field>
    {sel==="Confirmed"&&<div style={{marginTop:8,padding:"16px 18px",background:G.accentLight,border:`1.5px solid #A8D5B8`,borderRadius:10}}>
      <div style={{fontSize:12,fontWeight:700,color:G.accent,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>Confirmation Details</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Field label="Confirmed By (Name)">
          <Inp value={d.confirmedBy||""} onChange={s("confirmedBy")} placeholder="Full name of customer contact"/>
        </Field>
        <Field label="Date Confirmed">
          <Inp value={d.confirmedDate||""} onChange={s("confirmedDate")} type="date"/>
        </Field>
      </div>
      <Field label="Notes">
        <TA value={d.notes||""} onChange={s("notes")} rows={2} placeholder="Any additional context about how this was confirmed (call, email, signed doc, etc.)…"/>
      </Field>
    </div>}
    {sel&&sel!=="Confirmed"&&<div style={{marginTop:8}}>
      <Field label="Notes / Follow-Up Actions">
        <TA value={d.notes||""} onChange={s("notes")} rows={3} placeholder="Describe what needs to happen before this can be confirmed…"/>
      </Field>
    </div>}
  </div>;
}

const INIT={
  pp:{contacts:[{name:"",email:"",role:""}],feedstocks:[],programs:[],products:[],customProducts:[],certMat:"",startDate:"",prevPart:"",locCount:"",growersMultiLoc:"",internalTransfers:"",tenantType:"",traceSys:"",blanketDecl:"",blanketSuppliers:[{name:"",id:""}],netConn:"",cibo:"",programDates:{}},
  biz:{legalName:"",website:"",docStatus:"",meetDate:"",reviewStatus:"",notes:"",checks:Array(5).fill(false)},
  brand:{logoUploaded:false,logoName:"",darkLogoUploaded:false,darkLogoName:"",notes:""},
  attest:{selProgs:[],custVerb:"",files:[],attestStates:{},geoFiles:[],mapPins:[],mapSearch:""},
  core:{facilities:[{name:"",addr:"",city:"",state:"",zip:""}],signatories:[{name:"",title:"",email:""}],growerFileUploaded:false,growerFileName:"",scaleMethod:""},
  integ:{method:""},
  pathway:{codes:[{prog:"",code:"",desc:""}]},
  inventory:{snapDate:"",basis:"",signName:"",signEmail:"",products:[],balances:{}},
  ack:{status:"",confirmedBy:"",confirmedDate:"",notes:""},
};

export default function CSOnboardingTool(){
  const [step,setStep]=useState(0);
  const [done,setDone]=useState(new Set());
  const [customer,setCustomer]=useState("");
  const [data,setData]=useState(INIT);
  const update=(k)=>(v)=>setData(p=>({...p,[k]:v}));
  const pct=Math.round((done.size/STEPS.length)*100);
  const isLast=step===STEPS.length-1;
  const saveNext=()=>{setDone(prev=>new Set([...prev,step]));if(!isLast)setStep(step+1);};
  const steps=[
    <Step1 d={data.pp} u={update("pp")}/>,
    <Step2 d={data.biz} u={update("biz")}/>,
    <Step3 d={data.brand} u={update("brand")}/>,
    <Step4 d={data.attest} u={update("attest")}/>,
    <Step5 d={data.core} u={update("core")}/>,
    <Step6 d={data.integ} u={update("integ")}/>,
    <Step7 d={data.pathway} u={update("pathway")}/>,
    <Step8 d={data.inventory} u={update("inventory")}/>,
    <Step9 d={data.ack} u={update("ack")}/>,
  ];
  return <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#C8C0B2;border-radius:3px}`}</style>
    <div style={{display:"flex",height:"100vh",background:G.page,fontFamily:"'DM Sans',sans-serif",overflow:"hidden"}}>
      <div style={{width:272,background:G.sidebar,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"24px 22px 18px",borderBottom:`1px solid ${G.sidebarBorder}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{width:30,height:30,background:G.gold,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:11,fontWeight:800,color:G.sidebar}}>CS</span>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#fff",letterSpacing:"0.02em"}}>CS Onboarding Tool</div>
            </div>
          </div>
          <input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Customer name…"
            style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:8,padding:"8px 11px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none"}}/>
        </div>
        <div style={{padding:"14px 22px",borderBottom:`1px solid ${G.sidebarBorder}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
            <span style={{fontSize:11,color:G.sidebarMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Progress</span>
            <span style={{fontSize:11,color:G.gold,fontWeight:600}}>{pct}%</span>
          </div>
          <div style={{height:3,background:"rgba(255,255,255,0.1)",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:G.gold,borderRadius:2,transition:"width 0.4s ease"}}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 0"}}>
          {STEPS.map((s,i)=>{
            const active=step===i,complete=done.has(i);
            return <div key={s.id} onClick={()=>setStep(i)} style={{display:"flex",alignItems:"center",gap:11,
              padding:"10px 22px",cursor:"pointer",background:active?"rgba(201,149,42,0.1)":"transparent",
              borderLeft:`3px solid ${active?G.gold:"transparent"}`,transition:"all 0.12s",marginBottom:2}}>
              <div style={{width:25,height:25,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:11,fontWeight:700,
                background:complete?G.accent:active?G.gold:"rgba(255,255,255,0.07)",
                color:complete?"#fff":active?G.sidebar:G.sidebarMuted}}>
                {complete?<Check size={11} strokeWidth={3}/>:String(i+1).padStart(2,"0")}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:active?600:500,color:active?"#fff":complete?G.sidebarText:G.sidebarMuted,lineHeight:1.3}}>{s.label}</div>
                <div style={{fontSize:11,color:active?"rgba(255,255,255,0.45)":"rgba(255,255,255,0.2)",marginTop:2}}>{s.sub}</div>
              </div>
            </div>;
          })}
        </div>
        <div style={{padding:"14px 22px",borderTop:`1px solid ${G.sidebarBorder}`}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",textAlign:"center"}}>{done.size} of {STEPS.length} sections complete</div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:G.white,borderBottom:`1.5px solid ${G.border}`,padding:"14px 38px",
          display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:12,color:G.muted,marginBottom:2}}>Step {step+1} of {STEPS.length}</div>
            <div style={{fontSize:20,fontWeight:700,color:G.sidebar,fontFamily:'"Crimson Pro",Georgia,serif'}}>{STEPS[step].label}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {done.has(step)&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",background:G.accentLight,borderRadius:20,fontSize:12,fontWeight:600,color:"#1A5A35"}}><Check size={11} strokeWidth={3}/>Saved</div>}
            <div style={{fontSize:12,color:G.muted,padding:"5px 12px",background:G.page,borderRadius:20}}>{customer||"No customer set"}</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"34px 38px"}}>
          <div style={{maxWidth:820}}>{steps[step]}</div>
        </div>
        <div style={{background:G.white,borderTop:`1.5px solid ${G.border}`,padding:"14px 38px",
          display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <button onClick={()=>step>0&&setStep(step-1)} disabled={step===0}
            style={{display:"flex",alignItems:"center",gap:7,padding:"9px 20px",background:"none",
            border:`1.5px solid ${G.border}`,borderRadius:8,color:step===0?G.border:G.muted,
            fontSize:14,fontWeight:600,cursor:step===0?"not-allowed":"pointer",fontFamily:"inherit"}}>
            <ChevronLeft size={15}/>Previous
          </button>
          {done.size===STEPS.length&&isLast
            ?<div style={{display:"flex",alignItems:"center",gap:7,padding:"9px 24px",background:G.gold,borderRadius:8,color:G.sidebar,fontSize:14,fontWeight:700}}>
              <Check size={15}/>Onboarding Complete — All Steps Saved
            </div>
            :<button onClick={saveNext} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 24px",
              background:G.accent,border:"none",borderRadius:8,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              {isLast?"Complete Onboarding":"Save & Continue"}<ChevronRight size={15}/>
            </button>}
        </div>
      </div>
    </div>
  </>;
}
