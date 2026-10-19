// Database Principles has no screenshot, so it gets a diagram of two real
// tables from the coursework schema. Drawn in SVG so it is sharp at any size.

const tables = [
  { x: 70, y: 86, name: "customers", rows: [["PK", "cust_id"], ["", "cust_fname"], ["", "cust_email"]] },
  { x: 370, y: 150, name: "vehicles", rows: [["PK", "vec_id"], ["FK", "cust_id"], ["", "vec_model"]] },
];

export function SchemaArt({ label }: { label?: string }) {
  return <svg viewBox="0 0 640 360" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} style={{ display: "block", width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
    <rect width="640" height="360" fill="#0f1d36" />
    {Array.from({ length: 16 }, (_, i) => <path key={`v${i}`} d={`M${i * 40} 0v360`} stroke="#1a2c4d" strokeWidth="1" />)}
    {Array.from({ length: 9 }, (_, i) => <path key={`h${i}`} d={`M0 ${i * 40}h640`} stroke="#1a2c4d" strokeWidth="1" />)}
    <path d="M270 140 C320 140 320 204 370 204" fill="none" stroke="#7fb4ff" strokeWidth="2.5" />
    <path d="M278 132v16M286 132v16" stroke="#7fb4ff" strokeWidth="2.5" />
    <path d="M370 204l-12 -9M370 204l-12 9M370 204h-14" stroke="#7fb4ff" strokeWidth="2.5" />
    {tables.map(t => <g key={t.name} fontFamily="-apple-system, BlinkMacSystemFont, Geist, sans-serif">
      <rect x={t.x} y={t.y} width="200" height="132" rx="12" fill="#f4f7fc" />
      <path d={`M${t.x} ${t.y + 12}a12 12 0 0 1 12 -12h176a12 12 0 0 1 12 12v24h-200z`} fill="#2f6fe0" />
      <text x={t.x + 16} y={t.y + 24} fill="#fff" fontSize="16" fontWeight="700">{t.name}</text>
      {t.rows.map(([key, column], i) => <g key={column}>
        {i > 0 && <path d={`M${t.x + 12} ${t.y + 36 + i * 32}h176`} stroke="#dbe3f0" />}
        {key && <text x={t.x + 16} y={t.y + 57 + i * 32} fill="#2f6fe0" fontSize="11" fontWeight="800">{key}</text>}
        <text x={t.x + 44} y={t.y + 57 + i * 32} fill="#1d2a40" fontSize="14">{column}</text>
      </g>)}
    </g>)}
    <text x="70" y="318" fill="#7fb4ff" fontFamily="-apple-system, BlinkMacSystemFont, Geist, sans-serif" fontSize="13" fontWeight="600" letterSpacing="1.5">ONE CUSTOMER, MANY VEHICLES</text>
  </svg>;
}
