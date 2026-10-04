/* ============ 1. EDIT THESE ============ */
 
// WhatsApp numbers: 234 + number without the first 0, no "+" and no spaces
const WHATSAPP = ["2348035655290", "2349065005443"];
 
/* ============ 2. YOUR CLIENT'S PICTURES ============
   Save photos in the images folder. Name = make-version-year.jpg
     images/lexus-rx-350-2015.jpg   -> shows only on the 2015 RX 350
     images/lexus-rx-350.jpg        -> shows on every RX 350 year with no photo of its own
     images/toyota-camry-2019.jpg   -> the 2019 Camry
   (lowercase, hyphens instead of spaces, .jpg)
   No photo yet? A brown placeholder with the name is shown.
   MORE THAN ONE PHOTO per car: add -2, -3, -4 ... (up to 10)
     images/toyota-camry-2019.jpg      (first photo)
     images/toyota-camry-2019-2.jpg    (second photo)
     images/toyota-camry-2019-3.jpg    (third photo)
   Different file names? Add a line here, e.g.
     "toyota-camry-2019": "images/camry-front.jpg",
   or with several photos:
     "toyota-camry-2019": ["images/front.jpg", "images/back.jpg", "images/inside.jpg"],
*/
const IMAGES = {
};
 
/* ============ 3. CAR DATA ============
   ["model family", "full version name", "body", first year, last year]
   Every year from first to last is listed automatically. */
const L = (make, rows) => rows.map(r => ({ make, model: r[0], ver: r[1], body: r[2], from: r[3], to: r[4] }));
 
const CARS = [
...L("Toyota", [
  ["Camry","Camry","XSE",2024],
  ["Camry","Camry","4plug",2012,2014],
  ["Camry","Camry","v6",2019,2020],
  ["Camry","Camry Hybrid","v6",2023,2024],
  ["Corolla","Corolla","4plug",2006,2012],
  ["Avalon","Avalon Hybrid","Sedan",2013,2015],
  ["RAV4","RAV4","4plug",2010,2022],
  ["Highlander","Highlander","SUV",2009,2012],
  ["Land Cruiser","Land Cruiser","SUV",2010,2012],
  ["Venza","Venza","SUV",2011,2015],
  ["Sienna","Sienna","Van",2009,2010],
]),
...L("Lexus", [
  ["IS","IS 250","v6",2008,2015],
  ["IS","IS 350","newly/convertible",2008,2010],
  ["ES","ES 350","Sedan",2013,2014],
  ["ES","ES 350","Sedan",2008,2010],
  ["RX","RX 350","SUV",2013,2022],
  ["RX","RX 350","SUV",2008,2009],
  ["GX","GX 470","SUV",2013,2015],
])
];
 
/* ============ 4. SITE CODE (no need to edit) ============ */
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// If an element is missing from index.html, use a dummy so the script never crashes
const $ = id => document.getElementById(id) || document.createElement("div");
 
const all = [];
CARS.forEach(c => {
  for (let y = c.to; y >= c.from; y--) {
    const base = slug(c.make + " " + c.ver);
    all.push({ ...c, year: y, base, id: base + "-" + y });
  }
});
const byId = Object.fromEntries(all.map(c => [c.id, c]));
 
let make = "All", shown = 48;
 
const EXT = ["jpg", "jpeg", "png", "webp"];
function imgTag(c) {
  // tries: your IMAGES line, then images/<name>-<year>.jpg / .jpeg / .png / .webp, then the same without the year
  const o = k => [].concat(IMAGES[k] || [])[0];
  const tries = [o(c.id), ...EXT.map(e => `images/${c.id}.${e}`), o(c.base), ...EXT.map(e => `images/${c.base}.${e}`)].filter(Boolean);
  const first = tries.shift();
  return `<img src="${first}" data-try="${tries.join("|")}" alt="${c.year} ${c.make} ${c.ver}" loading="lazy" onerror="imgFail(this)">`;
}
function imgFail(i) {
  const next = (i.dataset.try || "").split("|").filter(Boolean);
  if (next.length) { i.dataset.try = next.slice(1).join("|"); i.src = next[0]; } else i.remove();
}
 
function fillModels() {
  const list = [...new Set(all.filter(c => make === "All" || c.make === make).map(c => c.model))];
  $("model").innerHTML = `<option value="">All models</option>` + list.map(m => `<option>${m}</option>`).join("");
}
function fillYears() {
  let o = `<option value="">All years</option>`;
  for (let y = 2024; y >= 2008; y--) o += `<option>${y}</option>`;
  $("year").innerHTML = o;
}
 
function filtered() {
  const q = $("search").value.toLowerCase().trim();
  return all.filter(c =>
    (make === "All" || c.make === make) &&
    (!$("model").value || c.model === $("model").value) &&
    (!$("year").value || c.year == $("year").value) &&
    (c.make + " " + c.ver + " " + c.year + " " + c.body).toLowerCase().includes(q));
}
 
function render() {
  const list = filtered();
  $("grid").innerHTML = list.slice(0, shown).map(c => `
    <article class="card" data-id="${c.id}">
      <div class="ph"><span>${c.ver}</span>${imgTag(c)}</div>
      <p class="yr">${c.year}</p>
      <h3>${c.make} ${c.ver}</h3>
      <p>${c.body}</p>
      <button type="button" class="view" data-id="${c.id}">View this car</button>
    </article>`).join("") || `<p class="none">No car matches that search. Try a shorter name or clear the filters.</p>`;
  $("count").textContent = list.length + (list.length === 1 ? " car" : " cars");
  $("more").hidden = shown >= list.length;
}
const refresh = () => { shown = 48; render(); };
 
const probe = src => new Promise(r => { const i = new Image(); i.onload = () => r(src); i.onerror = () => r(null); i.src = src; });
 
let missed = [];   // paths from the IMAGES block that could not be found
 
async function photosFor(key) {
  if (IMAGES[key]) {
    const list = [].concat(IMAGES[key]);
    const ok = (await Promise.all(list.map(probe))).filter(Boolean);
    missed.push(...list.filter(p => !ok.includes(p)));
    if (ok.length) return ok;
  }
  const found = [];
  for (let n = 1; n <= 10; n++) {
    let hit = null;
    for (const e of EXT) {
      const names = n === 1 ? [`images/${key}.${e}`, `images/${key}-1.${e}`] : [`images/${key}-${n}.${e}`];
      for (const src of names) { hit = await probe(src); if (hit) break; }
      if (hit) break;
    }
    if (!hit) break;
    found.push(hit);
  }
  return found;
}
async function findPhotos(c) {
  missed = [];
  const own = await photosFor(c.id);
  return own.length ? own : photosFor(c.base);
}
 
let gal = [], gi = 0, token = 0;
 
function drawGallery() {
  const many = gal.length > 1;
  $("mImg").innerHTML = `<img class="main" src="${gal[gi]}" alt="Photo ${gi + 1}">` + (many
    ? `<button type="button" class="nav prev" data-nav="-1" aria-label="Previous photo">&#8249;</button>
       <button type="button" class="nav next" data-nav="1" aria-label="Next photo">&#8250;</button>
       <span class="pcount">${gi + 1} / ${gal.length}</span>` : "") + `<span class="zoomhint">Click photo to zoom</span>`;
  $("mThumbs").innerHTML = many
    ? gal.map((src, i) => `<img class="thumb${i === gi ? " on" : ""}" data-th="${i}" src="${src}" alt="Show photo ${i + 1}">`).join("") : "";
}
function go(n) {
  gi = (n + gal.length) % gal.length;
  drawGallery();
  if (!$("lightbox").hidden) showLightbox();
}
 
/* ---- zoom (full-screen photo) ---- */
let zoomed = false;
function showLightbox() {
  zoomed = false;
  const im = $("lbImg");
  im.classList.remove("zoom");
  im.style.transformOrigin = "50% 50%";
  im.src = gal[gi];
  $("lbNav").innerHTML = gal.length > 1
    ? `<button type="button" class="nav prev" data-nav="-1" aria-label="Previous photo">&#8249;</button>
       <button type="button" class="nav next" data-nav="1" aria-label="Next photo">&#8250;</button>` : "";
  $("lightbox").hidden = false;
}
function hideLightbox() { $("lightbox").hidden = true; }
function pan(e) {
  $("lbImg").style.transformOrigin = (e.clientX / innerWidth * 100) + "% " + (e.clientY / innerHeight * 100) + "%";
}
 
async function openCar(id) {
  const c = byId[id];
  if (!c) return;
  const my = ++token;
  const name = `${c.year} ${c.make} ${c.ver}`;
  $("mTitle").textContent = name;
  $("mYears").textContent = c.body;
  $("mImg").innerHTML = `<p class="nophoto">Looking for photos...</p>`;
  $("mThumbs").innerHTML = "";
  const msg = encodeURIComponent(`Hello Nonso, I'm interested in a ${name}. Is one available?`);
  $("mBtn").href = `https://wa.me/${WHATSAPP[0]}?text=${msg}`;
  $("mBtn2").href = `https://wa.me/${WHATSAPP[1]}?text=${msg}`;
  const m = $("modal");
  if (m.showModal) { if (!m.open) m.showModal(); } else m.setAttribute("open", "");
 
  const photos = await findPhotos(c);
  if (my !== token) return;
  gal = photos; gi = 0;
  if (photos.length) drawGallery();
  else $("mImg").innerHTML = missed.length
    ? `<p class="nophoto">Your IMAGES line points to files that do not exist:<br><b>${missed.join("<br>")}</b><br>Check the spelling and that the files are inside the images folder.</p>`
    : `<p class="nophoto">No photo found yet.<br>Save one in the images folder as<br><b>${c.id}.jpg</b><br>(more photos: ${c.id}-2.jpg, ${c.id}-3.jpg ...)</p>`;
}
function closeCar() {
  token++;
  hideLightbox();
  const m = $("modal");
  if (m.close) m.close(); else m.removeAttribute("open");
}
 
/* One click listener for the whole page: every button and card is handled here */
document.addEventListener("click", e => {
  const t = e.target;
 
  const mk = t.closest("#makes button");
  if (mk) {
    make = mk.dataset.make;
    document.querySelectorAll("#makes button").forEach(b => b.classList.toggle("on", b === mk));
    fillModels();
    refresh();
    return;
  }
  if (t.closest("#more")) { shown += 48; render(); return; }
  if (t.closest("#close") || t === $("modal")) { closeCar(); return; }
 
  if (t.closest("#lbClose") || t === $("lightbox")) { hideLightbox(); return; }
  if (t === $("lbImg")) {
    zoomed = !zoomed;
    if (zoomed) pan(e);
    t.classList.toggle("zoom", zoomed);
    return;
  }
  if (t.matches("#mImg img.main")) { showLightbox(); return; }
 
  const nav = t.closest("[data-nav]");
  if (nav) { go(gi + Number(nav.dataset.nav)); return; }
  const th = t.closest("[data-th]");
  if (th) { go(Number(th.dataset.th)); return; }
 
  const card = t.closest("#grid [data-id]");
  if (card) openCar(card.dataset.id);
});
 
document.addEventListener("keydown", e => {
  if (!$("lightbox").hidden && e.key === "Escape") { e.preventDefault(); hideLightbox(); return; }
  if ($("modal").open && gal.length > 1) {
    if (e.key === "ArrowRight") go(gi + 1);
    if (e.key === "ArrowLeft") go(gi - 1);
  }
  const card = e.target.closest && e.target.closest("#grid .card");
  if (card && e.target === card && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openCar(card.dataset.id);
  }
});
 
document.addEventListener("input", e => { if (e.target.id === "search") refresh(); });
document.addEventListener("change", e => { if (e.target.id === "model" || e.target.id === "year") refresh(); });
 
/* Start the page */
fillModels();
fillYears();
render();
document.querySelectorAll(".yr-now").forEach(s => s.textContent = new Date().getFullYear());
 
/* Your portrait next to "About me": save it as images/nonso.jpg (.jpeg, .png and .webp also work) */
const portrait = document.querySelector(".portrait img");
if (portrait) {
  portrait.dataset.try = "images/nonso.jpeg|images/nonso.png|images/nonso.webp";
  portrait.onerror = () => imgFail(portrait);
  if (portrait.complete && !portrait.naturalWidth) imgFail(portrait);
}
 
/* keep Esc from closing the whole popup while a photo is zoomed; follow the pointer while zoomed */
$("modal").addEventListener("cancel", e => { if (!$("lightbox").hidden) { e.preventDefault(); hideLightbox(); } });
$("lbImg").addEventListener("pointermove", e => { if (zoomed) pan(e); });
 