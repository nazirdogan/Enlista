"use strict";(()=>{var e={};e.id=360,e.ids=[360],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7174:e=>{e.exports=import("@anthropic-ai/sdk")},1442:(e,r,t)=>{t.a(e,async(e,a)=>{try{t.r(r),t.d(r,{originalPathname:()=>h,patchFetch:()=>u,requestAsyncStorage:()=>d,routeModule:()=>p,serverHooks:()=>m,staticGenerationAsyncStorage:()=>c});var o=t(9303),n=t(8716),i=t(670),s=t(1656),l=e([s]);s=(l.then?(await l)():l)[0];let p=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/parse-voice/route",pathname:"/api/parse-voice",filename:"route",bundlePath:"app/api/parse-voice/route"},resolvedPagePath:"/Users/nazir/Documents/ListingLaunch/app/api/parse-voice/route.ts",nextConfigOutput:"standalone",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:c,serverHooks:m}=p,h="/api/parse-voice/route";function u(){return(0,i.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:c})}a()}catch(e){a(e)}})},1656:(e,r,t)=>{t.a(e,async(e,a)=>{try{t.r(r),t.d(r,{POST:()=>i});var o=t(7174),n=e([o]);o=(n.then?(await n)():n)[0];let s=["Burj View","Sea View","City View","Golf View","Pool View","Marina View","Private Pool","Shared Pool","Private Garden","Balcony","Terrace","Gym","Spa","Concierge","Security","Smart Home","Fully Furnished","Semi-Furnished","Unfurnished","Maid's Room","Study Room","Storage","Near Metro","Near Mall","Near Beach","Near School","Freehold","PHPP Available","Post-Handover Payment"],l=["Dubai Marina","Downtown Dubai","Palm Jumeirah","JVC","JBR","DIFC","Business Bay","Arabian Ranches","Meydan","Jumeirah","Al Barsha","Dubai Hills","Creek Harbour","Emaar Beachfront","MBR City","Dubai South","Damac Hills","Town Square","Sobha Hartland","Al Furjan","Silicon Oasis","International City","Sports City","Motor City","Jumeirah Lake Towers"];async function i(e){let{transcript:r}=await e.json();if(!r?.trim())return Response.json({error:"No transcript provided"},{status:400});let t=new o.default,a=(await t.messages.create({model:"claude-sonnet-4-6",max_tokens:1024,messages:[{role:"user",content:`You are a UAE real estate data parser. Extract property listing details from the following spoken description and return structured JSON.

Spoken description: "${r}"

Return a JSON object with ONLY these fields (use null for anything not mentioned):
{
  "property_type": one of [villa, apartment, townhouse, penthouse, office, retail, warehouse] or null,
  "listing_type": "sale" or "rent" (default "sale" if unclear),
  "bedrooms": integer or null,
  "bathrooms": integer or null,
  "parking": integer or null,
  "floor_number": string or null,
  "size_sqft": number or null,
  "price_aed": number or null (convert "2.5 million" to 2500000, "850K" to 850000, "1.2M" to 1200000),
  "community": best match from [${l.join(", ")}] or null,
  "building_name": string or null,
  "developer": string or null (e.g. Emaar, DAMAC, Nakheel, Sobha, Meraas),
  "handover_date": string or null (e.g. "Q4 2026"),
  "features": array of matching items from [${s.join(", ")}] — match loosely (e.g. "sea view" → "Sea View", "furnished" → "Fully Furnished", "pool" → "Shared Pool" unless "private pool" is mentioned),
  "tone": "professional" or "luxury" or "investment" (infer: luxury language/high-end area = luxury, ROI/yield/investor = investment, otherwise professional),
  "additional_notes": any extra detail mentioned that doesn't fit other fields, or null
}

Rules:
- For community: match to the closest known Dubai community (e.g. "the Marina" = "Dubai Marina", "downtown" = "Downtown Dubai", "JVC" = "JVC")
- For price: handle millions (M, mil, million), thousands (K, k, thousand), and plain numbers
- Be generous with feature matching from natural speech
- Return ONLY valid JSON, no markdown, no explanation`}]})).content[0];if("text"!==a.type)return Response.json({error:"Unexpected response"},{status:500});try{let e=JSON.parse(a.text);return Response.json({parsed:e})}catch{return Response.json({error:"Failed to parse AI response"},{status:500})}}a()}catch(e){a(e)}})},9303:(e,r,t)=>{e.exports=t(517)}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[948],()=>t(1442));module.exports=a})();