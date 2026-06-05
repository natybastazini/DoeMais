// =============================================
// DOE+ — Mapa de Hemocentros com Leaflet.js
// Gratuito, sem API key — usa OpenStreetMap
// Funcionalidades: CEP → clínicas próximas + rota
// =============================================

const hemocentros = [
  {
    nome: "Hemocentro Santa Cruz",
    endereco: "Rua Santa Cruz, 150 – Vila Mariana, São Paulo",
    horario: "Seg–Sex: 7h–17h | Sáb: 7h–12h",
    telefone: "(11) 3456-7890",
    lat: -23.5937,
    lng: -46.6397,
  },
  {
    nome: "Fundação Pró-Sangue – Unidade Central",
    endereco: "Av. Dr. Enéas Carvalho de Aguiar, 155 – Cerqueira César",
    horario: "Seg–Sex: 7h–18h | Sáb: 7h–13h",
    telefone: "(11) 3061-7700",
    lat: -23.5565,
    lng: -46.6693,
  },
  {
    nome: "Hemocentro Paulistano",
    endereco: "Rua Augusta, 1223 – Consolação, São Paulo",
    horario: "Seg–Sex: 8h–17h",
    telefone: "(11) 3218-5500",
    lat: -23.5553,
    lng: -46.6531,
  },
  {
    nome: "Centro de Doação Tatuapé",
    endereco: "Rua Serra de Jairé, 550 – Tatuapé, São Paulo",
    horario: "Seg–Sex: 7h30–16h30",
    telefone: "(11) 2091-3344",
    lat: -23.5418,
    lng: -46.5769,
  },
  {
    nome: "Hemocentro Santo André",
    endereco: "Av. Industrial, 600 – Santo André",
    horario: "Seg–Sex: 8h–16h",
    telefone: "(11) 4433-2211",
    lat: -23.6617,
    lng: -46.5322,
  },
  {
    nome: "Banco de Sangue Lapa",
    endereco: "Rua Catão, 90 – Lapa, São Paulo",
    horario: "Seg–Sáb: 7h–15h",
    telefone: "(11) 3675-9900",
    lat: -23.5234,
    lng: -46.7072,
  },
  {
    nome: "Hemocentro Santana",
    endereco: "Av. Braz Leme, 1717 – Santana, São Paulo",
    horario: "Seg–Sex: 7h–17h | Sáb: 7h–12h",
    telefone: "(11) 2244-8800",
    lat: -23.4991,
    lng: -46.6275,
  },
  {
    nome: "Clínica Doação Vida – Moema",
    endereco: "Alameda dos Arapanés, 820 – Moema, São Paulo",
    horario: "Seg–Sex: 8h–18h",
    telefone: "(11) 5051-3300",
    lat: -23.6022,
    lng: -46.6631,
  },
];

// ── Utilitários ──────────────────────────────

function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function criarIconeClinica() {
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
      <path d="M17 0C7.61 0 0 7.61 0 17c0 12.75 17 25 17 25S34 29.75 34 17C34 7.61 26.39 0 17 0z"
        fill="#c0392b" stroke="#fff" stroke-width="2"/>
      <text x="17" y="22" text-anchor="middle" fill="white"
        font-size="15" font-family="Arial" font-weight="bold">+</text>
    </svg>`,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -44],
  });
}

function criarIconeUsuario() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:#2563eb;border:3px solid #fff;
      box-shadow:0 0 0 3px rgba(37,99,235,0.35), 0 2px 8px rgba(0,0,0,.35);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

// ── Estado global ─────────────────────────────
let mapa, rotaLayer, pinUsuario, marcadores;
let painelLateral = null;

// ── Painel lateral de resultados ─────────────

function criarPainel() {
  const painel = document.createElement("div");
  painel.id = "painel-clinicas";
  painel.style.cssText = `
    position:absolute; top:0; right:0; width:300px; height:100%;
    background:#fff; box-shadow:-4px 0 16px rgba(0,0,0,.12);
    z-index:1000; overflow-y:auto; font-family:Inter,sans-serif;
    border-radius:0 12px 12px 0; display:none; flex-direction:column;
  `;
  document.getElementById("map").style.position = "relative";
  document.getElementById("map").appendChild(painel);
  return painel;
}

function renderizarPainel(clinicasOrdenadas, userLat, userLng) {
  if (!painelLateral) painelLateral = criarPainel();

  painelLateral.style.display = "flex";
  painelLateral.innerHTML = `
    <div style="padding:14px 16px 10px; border-bottom:1px solid #f0f0f0; position:sticky; top:0; background:#fff; z-index:1;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; color:#c0392b; font-size:14px; font-weight:700;">
          🩸 ${clinicasOrdenadas.length} hemocentros próximos
        </h3>
        <button id="fechar-painel" style="background:none;border:none;cursor:pointer;font-size:18px;color:#999;padding:0 2px;">✕</button>
      </div>
      <p style="margin:4px 0 0; font-size:11px; color:#888;">Clique em "Ver rota" para traçar o caminho</p>
    </div>
    <div id="lista-clinicas" style="padding:8px 0;"></div>
  `;

  document.getElementById("fechar-painel").onclick = () => {
    painelLateral.style.display = "none";
    if (rotaLayer) {
      mapa.removeLayer(rotaLayer);
      rotaLayer = null;
    }
  };

  const lista = document.getElementById("lista-clinicas");

  clinicasOrdenadas.forEach((item, idx) => {
    const card = document.createElement("div");
    card.style.cssText = `
      padding:12px 16px; border-bottom:1px solid #f5f5f5; cursor:pointer;
      transition:background .15s;
    `;
    card.onmouseenter = () => (card.style.background = "#fef2f2");
    card.onmouseleave = () => (card.style.background = "transparent");

    card.innerHTML = `
      <div style="display:flex; gap:10px; align-items:flex-start;">
        <div style="
          min-width:26px; height:26px; border-radius:50%;
          background:#c0392b; color:#fff; font-size:11px; font-weight:700;
          display:flex; align-items:center; justify-content:center; margin-top:1px;
        ">${idx + 1}</div>
        <div style="flex:1;">
          <p style="margin:0 0 3px; font-size:13px; font-weight:600; color:#1a1a1a; line-height:1.3;">
            ${item.data.nome}
          </p>
          <p style="margin:0 0 2px; font-size:11px; color:#666;">${item.data.endereco}</p>
          <p style="margin:0 0 2px; font-size:11px; color:#888;">🕐 ${item.data.horario}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-size:11px; color:#c0392b; font-weight:600;">
              📍 ${item.dist.toFixed(1)} km
            </span>
            <button data-idx="${idx}" class="btn-rota" style="
              background:#c0392b; color:#fff; border:none; border-radius:20px;
              padding:4px 12px; font-size:11px; font-weight:600; cursor:pointer;
              font-family:Inter,sans-serif; transition:background .15s;
            ">Ver rota</button>
          </div>
        </div>
      </div>
    `;

    // Clique no card → centraliza marcador
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-rota")) return;
      mapa.setView([item.data.lat, item.data.lng], 15, { animate: true });
      item.marker.openPopup();
    });

    lista.appendChild(card);
  });

  // Botões de rota
  lista.querySelectorAll(".btn-rota").forEach((btn) => {
    btn.addEventListener(
      "mouseenter",
      () => (btn.style.background = "#a93226"),
    );
    btn.addEventListener(
      "mouseleave",
      () => (btn.style.background = "#c0392b"),
    );
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      tracarRota(userLat, userLng, clinicasOrdenadas[idx]);
    });
  });
}

// ── Rota via OSRM (gratuito, sem API key) ────

async function tracarRota(userLat, userLng, clinicaItem) {
  if (rotaLayer) {
    mapa.removeLayer(rotaLayer);
    rotaLayer = null;
  }

  const { lat, lng, nome } = clinicaItem.data;
  const url = `https://router.project-osrm.org/route/v1/foot/${userLng},${userLat};${lng},${lat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.code !== "Ok" || !json.routes.length) {
      alert("Não foi possível calcular a rota. Tente novamente.");
      return;
    }

    const rota = json.routes[0];
    const coords = rota.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const distKm = (rota.distance / 1000).toFixed(1);
    const minutos = Math.round(rota.duration / 60);

    rotaLayer = L.polyline(coords, {
      color: "#c0392b",
      weight: 4,
      opacity: 0.85,
      dashArray: "8,4",
      lineJoin: "round",
    }).addTo(mapa);

    mapa.fitBounds(rotaLayer.getBounds(), {
      padding: [40, painelLateral ? 320 : 40],
    });

    clinicaItem.marker
      .bindPopup(
        `
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <h3 style="color:#c0392b; margin:0 0 6px; font-size:14px; font-weight:700;">🩸 ${nome}</h3>
        <p style="margin:0 0 4px; font-size:12px; color:#555;">📍 ${clinicaItem.data.endereco}</p>
        <p style="margin:0 0 4px; font-size:12px; color:#555;">🕐 ${clinicaItem.data.horario}</p>
        <hr style="border:none; border-top:1px solid #eee; margin:6px 0;">
        <p style="margin:0; font-size:12px; font-weight:600; color:#c0392b;">
          🚶 ${distKm} km · ~${minutos} min a pé
        </p>
      </div>
    `,
      )
      .openPopup();
  } catch (err) {
    alert("Erro ao calcular rota. Verifique sua conexão.");
  }
}

// ── Geocodifica com fallbacks progressivos ────

async function geocodificarNominatim(queries) {
  for (const q of queries) {
    if (!q || !q.trim()) continue;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=br&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
      const data = await res.json();
      if (data.length) return data[0];
    } catch (_) {}
  }
  return null;
}

// ── Busca por CEP ─────────────────────────────

async function buscarPorCep(cep) {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    mostrarErroInput("CEP inválido. Digite 8 dígitos.");
    return;
  }

  setLoadingInput(true);

  try {
    // 1. Tenta ViaCEP
    let dadosCep = null;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const json = await res.json();
      if (!json.erro) dadosCep = json;
    } catch (_) {}

    // Fallback: OpenCEP
    if (!dadosCep) {
      try {
        const res = await fetch(`https://opencep.com/v1/${cepLimpo}`);
        const json = await res.json();
        if (json && json.cep) dadosCep = json;
      } catch (_) {}
    }

    if (!dadosCep) {
      mostrarErroInput("CEP não encontrado. Verifique e tente novamente.");
      setLoadingInput(false);
      return;
    }

    // 2. Monta queries progressivas para o Nominatim (do mais específico ao mais geral)
    const rua = dadosCep.logradouro || "";
    const bairro = dadosCep.bairro || "";
    const cidade = dadosCep.localidade || dadosCep.cidade || "";
    const uf = dadosCep.uf || dadosCep.estado || "";

    const queries = [
      // CEP direto (o Nominatim às vezes indexa)
      `${cepLimpo}, Brasil`,
      // Rua + bairro + cidade
      rua && bairro ? `${rua}, ${bairro}, ${cidade}, ${uf}` : null,
      // Só rua + cidade
      rua ? `${rua}, ${cidade}, ${uf}` : null,
      // Bairro + cidade
      bairro ? `${bairro}, ${cidade}, ${uf}` : null,
      // Só cidade
      cidade ? `${cidade}, ${uf}, Brasil` : null,
    ];

    const resultado = await geocodificarNominatim(queries);

    if (!resultado) {
      mostrarErroInput(
        "Não foi possível localizar no mapa. Tente outro CEP próximo.",
      );
      setLoadingInput(false);
      return;
    }

    const userLat = parseFloat(resultado.lat);
    const userLng = parseFloat(resultado.lon);

    // Label amigável para o pin
    const labelPin = bairro || cidade || "Seu local";

    // 3. Remove pin anterior do usuário
    if (pinUsuario) mapa.removeLayer(pinUsuario);
    if (rotaLayer) {
      mapa.removeLayer(rotaLayer);
      rotaLayer = null;
    }

    pinUsuario = L.marker([userLat, userLng], { icon: criarIconeUsuario() })
      .addTo(mapa)
      .bindPopup(
        `<b style="font-family:Inter,sans-serif;font-size:12px;">📌 Você está em: ${labelPin}</b>`,
      )
      .openPopup();

    // 4. Ordena clínicas por distância e mostra as 5 mais próximas
    const comDistancia = marcadores.map((m) => ({
      ...m,
      dist: distanciaKm(userLat, userLng, m.data.lat, m.data.lng),
    }));
    comDistancia.sort((a, b) => a.dist - b.dist);
    const proximas = comDistancia.slice(0, 5);

    // 5. Centraliza mapa no usuário
    mapa.setView([userLat, userLng], 13, { animate: true });

    // 6. Abre painel lateral
    renderizarPainel(proximas, userLat, userLng);

    // Destaca os 5 mais próximos no mapa com número
    marcadores.forEach((m) => m.marker.setIcon(criarIconeClinica()));
    proximas.forEach((item, idx) => {
      item.marker.setIcon(
        L.divIcon({
          className: "",
          html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
            <path d="M17 0C7.61 0 0 7.61 0 17c0 12.75 17 25 17 25S34 29.75 34 17C34 7.61 26.39 0 17 0z"
              fill="#c0392b" stroke="#fff" stroke-width="2"/>
            <text x="17" y="22" text-anchor="middle" fill="white"
              font-size="13" font-family="Arial" font-weight="700">${idx + 1}</text>
          </svg>`,
          iconSize: [34, 42],
          iconAnchor: [17, 42],
          popupAnchor: [0, -44],
        }),
      );
    });
  } catch (err) {
    mostrarErroInput("Erro de conexão. Tente novamente.");
  }

  setLoadingInput(false);
}

// ── Feedback no input ─────────────────────────

function setLoadingInput(loading) {
  const btn = document.getElementById("btn-buscar");
  const input = document.getElementById("search-input");
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? "Buscando..." : "Buscar";
  if (input) input.disabled = loading;
}

function mostrarErroInput(msg) {
  let erroEl = document.getElementById("input-erro");
  if (!erroEl) {
    erroEl = document.createElement("p");
    erroEl.id = "input-erro";
    erroEl.style.cssText =
      "color:#c0392b;font-size:12px;margin:4px 0 0 8px;font-family:Inter,sans-serif;";
    document.getElementById("search-input")?.parentNode?.appendChild(erroEl);
  }
  erroEl.textContent = msg;
  setTimeout(() => {
    if (erroEl) erroEl.textContent = "";
  }, 4000);
}

// ── Inicialização do mapa ─────────────────────

function initMap() {
  mapa = L.map("map", {
    center: [-23.5505, -46.6333],
    zoom: 12,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapa);

  // Adiciona marcadores de todos os hemocentros
  marcadores = hemocentros.map((h) => {
    const marker = L.marker([h.lat, h.lng], {
      icon: criarIconeClinica(),
    }).addTo(mapa);
    marker.bindPopup(`
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <h3 style="color:#c0392b; margin:0 0 6px; font-size:14px; font-weight:700;">🩸 ${h.nome}</h3>
        <p style="margin:0 0 4px; font-size:12px; color:#555;">📍 ${h.endereco}</p>
        <p style="margin:0 0 4px; font-size:12px; color:#555;">🕐 ${h.horario}</p>
        <p style="margin:0; font-size:12px; color:#555;">📞 ${h.telefone}</p>
      </div>
    `);
    return { marker, data: h };
  });

  // ── Configura input de CEP ──
  const input = document.getElementById("search-input");
  const wrapper = input?.parentNode;

  if (input) {
    // Mascara o CEP enquanto digita
    input.placeholder = "Digite seu CEP (ex: 01310-100)";
    input.maxLength = 9;
    input.addEventListener("input", () => {
      let v = input.value.replace(/\D/g, "").slice(0, 8);
      if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
      input.value = v;
    });

    // Adiciona botão de buscar ao lado do input
    const btn = document.createElement("button");
    btn.id = "btn-buscar";
    btn.textContent = "Buscar";
    btn.style.cssText = `
      margin-left:8px; background:#c0392b; color:#fff; border:none;
      border-radius:999px; padding:0 22px; height:48px; font-size:14px;
      font-weight:600; font-family:Inter,sans-serif; cursor:pointer;
      transition:background .15s; white-space:nowrap; flex-shrink:0;
    `;
    btn.onmouseenter = () => (btn.style.background = "#a93226");
    btn.onmouseleave = () => (btn.style.background = "#c0392b");

    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.appendChild(btn);

    const executarBusca = () => buscarPorCep(input.value);
    btn.addEventListener("click", executarBusca);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") executarBusca();
    });
  }

  // Altura controlada pelo CSS — apenas força o Leaflet a recalcular o tamanho
  mapa.invalidateSize();
  window.addEventListener("resize", () => mapa.invalidateSize());
}

// ── Carrega Leaflet dinamicamente ─────────────

document.addEventListener("DOMContentLoaded", () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = initMap;
  document.head.appendChild(script);
});
