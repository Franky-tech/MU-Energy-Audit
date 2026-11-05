const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database('./mu_eams_2026.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const checklistLabels = [
  'Main LV switchboard, power factor & harmonic distortion',
  'LED retrofit coverage & daylight harvesting sensors',
  'Plug loads, laboratory benches & phantom standby draw',
  'Steam boilers, electric cookers & thermal insulation',
  'Solar thermal collectors & heat pump water heaters',
  'Three-phase induction motors, VFDs & pump efficiency',
  'Server room precision cooling & HVAC airflow balance',
  'Building envelope, fenestration & thermal bridging',
  'Smart submeter CT ratios & RS-485 Modbus telemetry',
  'Peak tariff demand management & load shedding schedule'
];

const facilitySeed = [
  {id:'tec-eng',name:'Technology & Engineering Complex (TEC)',type:'Laboratory & Teaching',group:'School of Engineering',status:'Audited',annualKwh:348400,cost:9894560,co2:146676.4,daily:954.52,areaSqFt:42500,occupants:1450,yearBuilt:1991,source:'2026 Smart Submeter Baseline · Kesses',note:'Houses High Voltage, Machines, Power Electronics, and Telecommunication labs.'},
  {id:'mt-lib',name:'Margaret Thatcher Library',type:'Library',group:'Academic Services',status:'Audited',annualKwh:412850,cost:11724940,co2:173809.85,daily:1131.10,areaSqFt:68000,occupants:2800,yearBuilt:1994,source:'2026 Smart Submeter Baseline · Kesses',note:'24-hour reading zones, central ICT server wing, and HVAC air handling units.'},
  {id:'ngeria-cluster',name:'Ngeria Hostels Cluster (Halls 1–5)',type:'Student Residence',group:'Student Affairs',status:'Audited',annualKwh:964200,cost:27383280,co2:405928.2,daily:2641.64,areaSqFt:28800,occupants:1280,yearBuilt:1988,source:'2026 Smart Submeter Baseline · Ngeria',note:'High evening peak demand driven by student room plug loads and water heating.'},
  {id:'central-mess',name:'Central Catering & Student Mess',type:'Kitchen & Dining',group:'Catering Services',status:'Audited',annualKwh:389600,cost:11064640,co2:164021.6,daily:1067.40,areaSqFt:14200,occupants:3500,yearBuilt:1988,source:'2026 Smart Submeter Baseline · Catering',note:'Industrial electric ranges, cold storage rooms, and hybrid LPG/biomass steam boilers.'},
  {id:'elimu-mills',name:'Elimu Unga Millers Plant',type:'Industrial / Process',group:'Commercial Enterprises',status:'Audited',annualKwh:524900,cost:14907160,co2:220982.9,daily:1438.08,areaSqFt:19500,occupants:85,yearBuilt:1996,source:'2026 Industrial Feeder Log',note:'Heavy 3-phase hammer mills, pneumatic conveyors, and packaging automation.'},
  {id:'admin-senate',name:'Main Administration & Senate Block',type:'Administration',group:'Central Administration',status:'Audited',annualKwh:198450,cost:5635980,co2:83547.45,daily:543.70,areaSqFt:34000,occupants:420,yearBuilt:1986,source:'2026 Smart Submeter Baseline',note:'Executive offices, finance servers, and perimeter security lighting.'},
  {id:'ict-datacentre',name:'Campus ICT & Cloud Data Centre',type:'ICT Facility',group:'Digital Infrastructure',status:'Audited',annualKwh:276300,cost:7846920,co2:116322.3,daily:756.99,areaSqFt:8400,occupants:65,yearBuilt:2012,source:'2026 PDU Telemetry Log',note:'Redundant online double-conversion UPS banks, rack servers, and precision CRAC units.'},
  {id:'water-works',name:'Kesses Borehole & Water Treatment',type:'Water Infrastructure',group:'Campus Estates',status:'Audited',annualKwh:231500,cost:6574600,co2:97461.5,daily:634.25,areaSqFt:4600,occupants:18,yearBuilt:1990,source:'2026 Pump Station Submeter',note:'Four 45kW multistage centrifugal pumps operating on star-delta starters.'},
  {id:'student-centre',name:'Student Centre & Amphitheatre',type:'Student Services',group:'Student Affairs',status:'Candidate',note:'Scheduled for Q4 2026 submeter installation; mixed commercial retail and recreation loads.'},
  {id:'health-dispensary',name:'University Health Centre & Labs',type:'Healthcare',group:'Medical Services',status:'Candidate',note:'Vaccine cold-chain refrigeration, autoclave sterilizers, and 50kVA backup diesel generator.'},
  {id:'agri-greenhouse',name:'School of Agriculture Research Farm',type:'Agriculture',group:'Academic Facilities',status:'Candidate',note:'Drip irrigation pumps, grain driers, and controlled-environment greenhouses.'}
];

const meterSeed = [
  {id:'MTR-TEC-01',facilityId:'tec-eng',commodity:'Electricity',kind:'Smart 3-Phase Modbus Meter',unit:'kWh',status:'Reading entered',latest:148920.5,updated:'2026-10-28',latestDelta:28450.5,notes:'CT Ratio 400/5A · Main Engineering Feeder'},
  {id:'MTR-LIB-01',facilityId:'mt-lib',commodity:'Electricity',kind:'Smart 3-Phase Modbus Meter',unit:'kWh',status:'Reading entered',latest:219400.0,updated:'2026-10-28',latestDelta:34120.0,notes:'Includes HVAC Chiller sub-panel'},
  {id:'MTR-NGR-01',facilityId:'ngeria-cluster',commodity:'Electricity',kind:'Feeder Pillar Smart Meter',unit:'kWh',status:'Reading entered',latest:582110.8,updated:'2026-10-28',latestDelta:79810.8,notes:'Aggregates Halls 1 to 5 LV boards'},
  {id:'MTR-MESS-01',facilityId:'central-mess',commodity:'Electricity',kind:'Main Kitchen Check Meter',unit:'kWh',status:'Reading entered',latest:194320.0,updated:'2026-10-28',latestDelta:31900.0,notes:'Dedicated feeder for heavy kitchen cookers'},
  {id:'MTR-MILL-01',facilityId:'elimu-mills',commodity:'Electricity',kind:'Industrial Tariff Meter (CI2)',unit:'kWh',status:'Reading entered',latest:410880.2,updated:'2026-10-28',latestDelta:43750.2,notes:'Power factor penalty monitored monthly'},
  {id:'MTR-ICT-01',facilityId:'ict-datacentre',commodity:'Electricity',kind:'UPS Input Analyzer',unit:'kWh',status:'Reading entered',latest:98450.0,updated:'2026-10-28',latestDelta:22910.0,notes:'Monitors PUE ratio continuously'},
  {id:'MTR-WTR-01',facilityId:'water-works',commodity:'Electricity',kind:'Pump House Feeder Meter',unit:'kWh',status:'Awaiting readings',latest:null,updated:null,latestDelta:null,notes:'Pending GSM telemetry gateway configuration'}
];

const readingSeed = [
  {id:'RDG-901',meterId:'MTR-TEC-01',facilityId:'tec-eng',date:'2026-09-28',value:120470.0,unit:'kWh',cost:761120,delta:null,source:'KPLC Smart Portal Export'},
  {id:'RDG-902',meterId:'MTR-TEC-01',facilityId:'tec-eng',date:'2026-10-28',value:148920.5,unit:'kWh',cost:807994,delta:28450.5,source:'KPLC Smart Portal Export'},
  {id:'RDG-903',meterId:'MTR-LIB-01',facilityId:'mt-lib',date:'2026-09-28',value:185280.0,unit:'kWh',cost:915400,delta:null,source:'Modbus TCP Gateway'},
  {id:'RDG-904',meterId:'MTR-LIB-01',facilityId:'mt-lib',date:'2026-10-28',value:219400.0,unit:'kWh',cost:969008,delta:34120.0,source:'Modbus TCP Gateway'},
  {id:'RDG-905',meterId:'MTR-NGR-01',facilityId:'ngeria-cluster',date:'2026-09-28',value:502300.0,unit:'kWh',cost:2180000,delta:null,source:'Estates Field Log'},
  {id:'RDG-906',meterId:'MTR-NGR-01',facilityId:'ngeria-cluster',date:'2026-10-28',value:582110.8,unit:'kWh',cost:2266626,delta:79810.8,source:'Estates Field Log'},
  {id:'RDG-907',meterId:'MTR-MILL-01',facilityId:'elimu-mills',date:'2026-09-28',value:367130.0,unit:'kWh',cost:1190000,delta:null,source:'KPLC CI2 Bill #88412'},
  {id:'RDG-908',meterId:'MTR-MILL-01',facilityId:'elimu-mills',date:'2026-10-28',value:410880.2,unit:'kWh',cost:1242505,delta:43750.2,source:'KPLC CI2 Bill #91044'}
];

const assetSeed = [
  {facilityId:'tec-eng',name:'3-Phase Synchronous & Induction Lab Rigs',category:'Laboratory equipment',fuel:'Electricity',ratingW:15000,quantity:6,hours:4,dailyKwh:360.0,status:'Working',source:'2026 Lab Inventory · Power Systems Lab'},
  {facilityId:'tec-eng',name:'T8 Magnetic Ballast Fluorescent Tubes',category:'Lighting',fuel:'Electricity',ratingW:58,quantity:420,hours:9,dailyKwh:219.24,status:'Needs maintenance',source:'2026 Walk-through · Replace with 18W LED'},
  {facilityId:'mt-lib',name:'Centrifugal HVAC Air Handling Units (AHUs)',category:'HVAC / cooling',fuel:'Electricity',ratingW:22000,quantity:3,hours:14,dailyKwh:924.0,status:'Working',source:'2026 Mechanical Plant Schedule'},
  {facilityId:'mt-lib',name:'24-Hour Reading Wing LED Luminaires',category:'Lighting',fuel:'Electricity',ratingW:24,quantity:650,hours:18,dailyKwh:280.8,status:'Working',source:'2026 Lighting Audit'},
  {facilityId:'ngeria-cluster',name:'Student Room Resistance Cooking Coils',category:'Cooking & process heat',fuel:'Electricity',ratingW:1800,quantity:280,hours:3.5,dailyKwh:1764.0,status:'Working',source:'2026 Load Clamp Survey · Unregulated'},
  {facilityId:'ngeria-cluster',name:'Electric Instant Shower Heads',category:'Water heating',fuel:'Electricity',ratingW:4500,quantity:75,hours:1.8,dailyKwh:607.5,status:'Working',source:'2026 Washroom Inspection'},
  {facilityId:'central-mess',name:'Industrial Tilting Boiling Pans',category:'Cooking & process heat',fuel:'Electricity',ratingW:18500,quantity:4,hours:8,dailyKwh:592.0,status:'Working',source:'2026 Catering Asset Register'},
  {facilityId:'central-mess',name:'Walk-in Cold Room Compressors',category:'Refrigeration',fuel:'Electricity',ratingW:5500,quantity:3,hours:16,dailyKwh:264.0,status:'Needs maintenance',source:'2026 Catering Asset Register · Door seals worn'},
  {facilityId:'elimu-mills',name:'75kW Hammer Mill Drive Motors',category:'Motors / pumps / fans',fuel:'Electricity',ratingW:75000,quantity:2,hours:8,dailyKwh:1200.0,status:'Working',source:'2026 Mill Plant Audit'},
  {facilityId:'water-works',name:'45kW Borehole Submersible & Booster Pumps',category:'Motors / pumps / fans',fuel:'Electricity',ratingW:45000,quantity:3,hours:4.7,dailyKwh:634.5,status:'Working',source:'2026 Estates Pumping Log'},
  {facilityId:'ict-datacentre',name:'Precision CRAC Server Cooling Units',category:'HVAC / cooling',fuel:'Electricity',ratingW:14500,quantity:2,hours:24,dailyKwh:696.0,status:'Working',source:'2026 Data Centre Audit'}
];

const conditionSeed = [
  {id:'OBS-201',facilityId:'tec-eng',metric:'Power Factor & Harmonics (Fluke 435)',date:'2026-10-25',timeSlot:'Noon',value:'0.81 lagging (THD-I 14.2%)',unit:'PF / %',notes:'Inductive motor rigs operating without capacitor bank compensation.'},
  {id:'OBS-202',facilityId:'ngeria-cluster',metric:'Peak Feeder Current (ACS712 / Clamp)',date:'2026-10-26',timeSlot:'Evening',value:'384.5',unit:'Amperes (A)',notes:'Recorded at 19:30 EAT during student supper preparation peak.'},
  {id:'OBS-203',facilityId:'mt-lib',metric:'Indoor Ambient Temperature (LM35)',date:'2026-10-27',timeSlot:'Noon',value:'23.6',unit:'°C',notes:'2nd Floor West Wing; solar heat gain through unshaded glazing.'},
  {id:'OBS-204',facilityId:'ngeria-cluster',metric:'Hostel Occupancy',date:'2026-10-15',timeSlot:'Beginning of semester',value:'1264 / 1280',unit:'Students',notes:'98.7% bed capacity for Semester 1, 2026/2027 Academic Year.'}
];

const opportunitySeed = [
  {id:'ecm-solar-grid',name:'250 kWp Rooftop Grid-Tied Solar PV Plant',facility:'Technology & Engineering Complex (TEC)',kwh:382500,saving:10863000,capex:32500000,sourcePayback:'2.99 years',fuel:'Solar PV',status:'Approved',detail:'Offset daytime academic and lab loads using bifacial monocrystalline arrays with string inverters.'},
  {id:'ecm-vfd-pumps',name:'Retrofit VFDs on Borehole & Booster Pumps',facility:'Kesses Borehole & Water Treatment',kwh:78400,saving:2226560,capex:1850000,sourcePayback:'10 months',fuel:'Electricity',status:'In progress',detail:'Implement closed-loop PID pressure control using Variable Frequency Drives to eliminate throttling losses.'},
  {id:'ecm-led-campus',name:'Campus-Wide Smart LED & PIR Occupancy Retrofit',facility:'Margaret Thatcher Library & TEC',kwh:142000,saving:4032800,capex:3400000,sourcePayback:'10 months',fuel:'Electricity',status:'Verification pending',detail:'Replace 1,800 legacy 58W fluorescent tubes with 18W high-efficacy LED tubes and ultrasonic motion sensors.'},
  {id:'ecm-solar-thermal',name:'Evacuated Tube Solar Water Heating Arrays',facility:'Ngeria Hostels Cluster (Halls 1–5)',kwh:215000,saving:6106000,capex:14200000,sourcePayback:'2.33 years',fuel:'Solar Thermal',status:'Proposed',detail:'Displace 4.5kW resistive instant shower heads with centralized roof-mounted pressurized solar thermal collectors.'},
  {id:'ecm-pfc-mills',name:'Automatic Power Factor Correction (APFC) Bank',facility:'Elimu Unga Millers Plant',kwh:64200,saving:2890000,capex:1650000,sourcePayback:'7 months',fuel:'Electricity',status:'Verified',detail:'150 kVAr detuned capacitor bank installed to raise PF from 0.79 to 0.98 and eliminate KPLC kVArh surcharges.',verifiedKwh:66100,verificationEvidence:'KPLC Bill Oct 2026 · 0% PF Surcharge',verifiedOn:'2026-10-29'},
  {id:'ecm-biogas-mess',name:'Anaerobic Kitchen Waste Biogas Digester Revival',facility:'Central Catering & Student Mess',kwh:128000,saving:3635200,capex:6800000,sourcePayback:'1.87 years',fuel:'Biomass / Biogas',status:'Proposed',detail:'Process organic cafeteria waste and farm manure to fuel institutional steam boilers and displace electric boiling pans.'}
];

async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    tariff REAL DEFAULT 28.40,
    emissionFactor REAL DEFAULT 0.421,
    baseYear INTEGER DEFAULT 2025,
    reportingYear INTEGER DEFAULT 2026,
    academicYearDays INTEGER DEFAULT 365,
    currency TEXT DEFAULT 'KES'
  )`);

  await run(`CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    facility_group TEXT,
    status TEXT DEFAULT 'Candidate',
    annualKwh REAL,
    cost REAL,
    co2 REAL,
    daily REAL,
    areaSqFt REAL,
    occupants INTEGER,
    yearBuilt INTEGER,
    source TEXT,
    note TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS meters (
    id TEXT PRIMARY KEY,
    facilityId TEXT NOT NULL,
    commodity TEXT NOT NULL,
    kind TEXT,
    unit TEXT DEFAULT 'kWh',
    status TEXT DEFAULT 'Awaiting readings',
    latest REAL,
    updated TEXT,
    latestDelta REAL,
    notes TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY,
    meterId TEXT NOT NULL,
    facilityId TEXT NOT NULL,
    date TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT DEFAULT 'kWh',
    cost REAL,
    delta REAL,
    source TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facilityId TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    fuel TEXT,
    ratingW REAL,
    quantity INTEGER DEFAULT 1,
    hours REAL,
    dailyKwh REAL,
    status TEXT,
    source TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS conditions (
    id TEXT PRIMARY KEY,
    facilityId TEXT NOT NULL,
    metric TEXT NOT NULL,
    date TEXT NOT NULL,
    timeSlot TEXT,
    value TEXT,
    unit TEXT,
    notes TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    facility TEXT NOT NULL,
    kwh REAL DEFAULT 0,
    saving REAL NOT NULL,
    capex REAL DEFAULT 0,
    sourcePayback TEXT,
    fuel TEXT,
    status TEXT DEFAULT 'Proposed',
    detail TEXT,
    verifiedKwh REAL,
    verificationEvidence TEXT,
    verifiedOn TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS audits (
    id TEXT PRIMARY KEY,
    facilityId TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT,
    lead TEXT,
    date TEXT,
    status TEXT DEFAULT 'In progress',
    checks_json TEXT,
    note TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    detail TEXT,
    status TEXT DEFAULT 'Planned'
  )`);

  const existingSettings = await get('SELECT * FROM settings WHERE id = 1');
  if (!existingSettings) {
    await run(`INSERT INTO settings (id, tariff, emissionFactor, baseYear, reportingYear, academicYearDays, currency)
               VALUES (1, 28.40, 0.421, 2025, 2026, 365, 'KES')`);
  }

  const facCount = await get('SELECT COUNT(*) as cnt FROM facilities');
  if (facCount.cnt === 0) {
    for (const f of facilitySeed) {
      await run(
        `INSERT INTO facilities (id, name, type, facility_group, status, annualKwh, cost, co2, daily, areaSqFt, occupants, yearBuilt, source, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [f.id, f.name, f.type, f.group || null, f.status, f.annualKwh || null, f.cost || null, f.co2 || null, f.daily || null, f.areaSqFt || null, f.occupants || null, f.yearBuilt || null, f.source || null, f.note || null]
      );
    }
    for (const m of meterSeed) {
      await run(
        `INSERT INTO meters (id, facilityId, commodity, kind, unit, status, latest, updated, latestDelta, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.id, m.facilityId, m.commodity, m.kind, m.unit, m.status, m.latest, m.updated, m.latestDelta, m.notes]
      );
    }
    for (const r of readingSeed) {
      await run(
        `INSERT INTO readings (id, meterId, facilityId, date, value, unit, cost, delta, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.id, r.meterId, r.facilityId, r.date, r.value, r.unit, r.cost, r.delta, r.source]
      );
    }
    for (const a of assetSeed) {
      await run(
        `INSERT INTO assets (facilityId, name, category, fuel, ratingW, quantity, hours, dailyKwh, status, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.facilityId, a.name, a.category, a.fuel, a.ratingW, a.quantity, a.hours, a.dailyKwh, a.status, a.source]
      );
    }
    for (const c of conditionSeed) {
      await run(
        `INSERT INTO conditions (id, facilityId, metric, date, timeSlot, value, unit, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.facilityId, c.metric, c.date, c.timeSlot, c.value, c.unit, c.notes]
      );
    }
    for (const o of opportunitySeed) {
      await run(
        `INSERT INTO opportunities (id, name, facility, kwh, saving, capex, sourcePayback, fuel, status, detail, verifiedKwh, verificationEvidence, verifiedOn)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [o.id, o.name, o.facility, o.kwh, o.saving, o.capex, o.sourcePayback, o.fuel, o.status, o.detail, o.verifiedKwh || null, o.verificationEvidence || null, o.verifiedOn || null]
      );
    }

    const checks1 = JSON.stringify(checklistLabels.map((label, i) => ({ label, done: i < 8 })));
    const checks2 = JSON.stringify(checklistLabels.map((label, i) => ({ label, done: i < 5 })));
    await run(
      `INSERT INTO audits (id, facilityId, title, type, lead, date, status, checks_json, note)
       VALUES ('AUD-2026-TEC', 'tec-eng', '2026 Engineering Complex Investment-Grade Audit', 'Detailed energy audit', 'Eng. K. Kiprop · Senior Auditor', '2026-10-12', 'In progress', ?, 'Harmonic analysis completed on Heavy Machines lab feeder. Rooftop structural assessment approved for 250kWp Solar PV.')`,
      [checks1]
    );
    await run(
      `INSERT INTO audits (id, facilityId, title, type, lead, date, status, checks_json, note)
       VALUES ('AUD-2026-NGR', 'ngeria-cluster', 'Ngeria Hostels Peak Load & Thermal Survey', 'Targeted system audit', 'Moi Estates Energy Team', '2026-10-20', 'In progress', ?, 'Evening thermal imaging of LV feeder pillars shows phase imbalance on Hall 3 distribution board.')`,
      [checks2]
    );
  }
}

app.get('/api/state', async (req, res) => {
  try {
    const settings = await get('SELECT tariff, emissionFactor, baseYear, reportingYear, academicYearDays, currency FROM settings WHERE id = 1');
    const rawFacilities = await all('SELECT * FROM facilities');
    const facilities = rawFacilities.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      group: f.facility_group,
      status: f.status,
      baseline: f.annualKwh != null ? { annualKwh: f.annualKwh, cost: f.cost, co2: f.co2, daily: f.daily } : null,
      areaSqFt: f.areaSqFt,
      occupants: f.occupants,
      yearBuilt: f.yearBuilt,
      source: f.source,
      note: f.note
    }));
    const meters = await all('SELECT * FROM meters');
    const readings = await all('SELECT * FROM readings');
    const assets = await all('SELECT * FROM assets');
    const conditions = await all('SELECT * FROM conditions');
    const opportunities = await all('SELECT * FROM opportunities');
    const rawAudits = await all('SELECT * FROM audits');
    const audits = rawAudits.map(a => ({
      ...a,
      checks: a.checks_json ? JSON.parse(a.checks_json) : []
    }));
    const projects = await all('SELECT * FROM projects');

    res.json({ settings, facilities, meters, readings, assets, conditions, opportunities, audits, projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/facilities', async (req, res) => {
  try {
    const { id, name, type, group, areaSqFt, occupants, yearBuilt, annualKwh, note } = req.body;
    const settings = await get('SELECT tariff, emissionFactor FROM settings WHERE id = 1');
    const kwh = annualKwh ? Number(annualKwh) : null;
    const cost = kwh ? kwh * settings.tariff : null;
    const co2 = kwh ? kwh * settings.emissionFactor : null;
    const daily = kwh ? kwh / 365 : null;
    const status = kwh ? 'Audited' : 'Candidate';

    await run(
      `INSERT INTO facilities (id, name, type, facility_group, status, annualKwh, cost, co2, daily, areaSqFt, occupants, yearBuilt, source, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, type, group, status, kwh, cost, co2, daily, areaSqFt, occupants || null, yearBuilt, kwh ? '2026 User Baseline Entry' : null, note]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assets', async (req, res) => {
  try {
    const { facilityId, name, category, fuel, ratingW, quantity, hours, dailyKwh, status, source } = req.body;
    await run(
      `INSERT INTO assets (facilityId, name, category, fuel, ratingW, quantity, hours, dailyKwh, status, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [facilityId, name, category, fuel, ratingW, quantity, hours, dailyKwh, status, source]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/meters', async (req, res) => {
  try {
    const { id, facilityId, commodity, kind, unit, notes } = req.body;
    const exists = await get('SELECT id FROM meters WHERE LOWER(id) = LOWER(?)', [id]);
    if (exists) return res.status(400).json({ error: 'Meter ID already exists' });

    await run(
      `INSERT INTO meters (id, facilityId, commodity, kind, unit, status, notes)
       VALUES (?, ?, ?, ?, ?, 'Awaiting readings', ?)`,
      [id, facilityId, commodity, kind, unit, notes]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/readings', async (req, res) => {
  try {
    const { id, meterId, date, value, cost, source } = req.body;
    const meter = await get('SELECT * FROM meters WHERE id = ?', [meterId]);
    if (!meter) return res.status(400).json({ error: 'Invalid meter selected' });

    const priorReadings = await all('SELECT * FROM readings WHERE meterId = ? ORDER BY date ASC', [meterId]);
    const prior = priorReadings.at(-1);

    if (prior && date < prior.date) {
      return res.status(400).json({ error: `Reading date cannot be earlier than ${prior.date}` });
    }
    if (prior && value < prior.value) {
      return res.status(400).json({ error: `Cumulative reading cannot be less than previous reading (${prior.value})` });
    }

    const delta = prior ? value - prior.value : null;
    await run(
      `INSERT INTO readings (id, meterId, facilityId, date, value, unit, cost, delta, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, meter.id, meter.facilityId, date, value, meter.unit || 'kWh', cost, delta, source]
    );

    await run(
      `UPDATE meters SET latest = ?, updated = ?, latestDelta = ?, status = 'Reading entered' WHERE id = ?`,
      [value, date, delta, meter.id]
    );

    res.status(201).json({ delta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/conditions', async (req, res) => {
  try {
    const { id, facilityId, metric, date, timeSlot, value, unit, notes } = req.body;
    await run(
      `INSERT INTO conditions (id, facilityId, metric, date, timeSlot, value, unit, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, facilityId, metric, date, timeSlot, value, unit, notes]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audits', async (req, res) => {
  try {
    const { id, facilityId, title, type, date, lead, note } = req.body;
    const checks = checklistLabels.map(label => ({ label, done: false }));
    await run(
      `INSERT INTO audits (id, facilityId, title, type, lead, date, status, checks_json, note)
       VALUES (?, ?, ?, ?, ?, ?, 'In progress', ?, ?)`,
      [id, facilityId, title, type, lead, date, JSON.stringify(checks), note]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/audits/:id', async (req, res) => {
  try {
    const { status, checks, note } = req.body;
    const existing = await get('SELECT * FROM audits WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Audit not found' });

    await run(
      `UPDATE audits SET status = ?, checks_json = ?, note = ? WHERE id = ?`,
      [status ?? existing.status, checks ? JSON.stringify(checks) : existing.checks_json, note !== undefined ? note : existing.note, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/opportunities', async (req, res) => {
  try {
    const { id, name, facility, kwh, saving, capex, fuel, detail } = req.body;
    const pb = saving > 0 ? (capex / saving).toFixed(2) + ' years' : 'Not stated';
    await run(
      `INSERT INTO opportunities (id, name, facility, kwh, saving, capex, fuel, status, detail, sourcePayback)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Proposed', ?, ?)`,
      [id, name, facility, kwh, saving, capex, fuel, detail, pb]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/opportunities/:id', async (req, res) => {
  try {
    const { status, verifiedKwh, verificationEvidence, verifiedOn } = req.body;
    await run(
      `UPDATE opportunities SET status = ?, verifiedKwh = COALESCE(?, verifiedKwh), verificationEvidence = COALESCE(?, verificationEvidence), verifiedOn = COALESCE(?, verifiedOn) WHERE id = ?`,
      [status, verifiedKwh ?? null, verificationEvidence ?? null, verifiedOn ?? null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { tariff, emissionFactor, reportingYear } = req.body;
    await run(
      `UPDATE settings SET tariff = ?, emissionFactor = ?, reportingYear = ? WHERE id = 1`,
      [tariff, emissionFactor, reportingYear]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`MU-EAMS 2026 Server running at http://localhost:${PORT}`));
});