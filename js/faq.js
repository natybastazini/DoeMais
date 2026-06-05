// TABELA DE PARA QUEM PODE DOAR E DE QUEM PODE RECEBER.
function initCompatibilidade() {
  const types = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const canReceiveFrom = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
  };

  const canDonateTo = {
    "A+": ["A+", "AB+"],
    "A-": ["A+", "A-", "AB+", "AB-"],
    "B+": ["B+", "AB+"],
    "B-": ["B+", "B-", "AB+", "AB-"],
    "AB+": ["AB+"],
    "AB-": ["AB+", "AB-"],
    "O+": ["A+", "B+", "O+", "AB+"],
    "O-": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  };

  function buildGrid(containerId, dataMap, label) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = "";
    types.forEach((t) => {
      const compat = dataMap[t];
      const card = document.createElement("div");
      card.className =
        "flex flex-col items-center w-44 bg-white rounded-3xl p-3 gap-2 shadow-lg";

      const badge = document.createElement("div");
      badge.className =
        "w-12 h-12 rounded-full bg-red-1 flex items-center justify-center text-white font-bold text-lg";
      badge.textContent = t;

      const lbl = document.createElement("p");
      lbl.className =
        "text-xs font-semibold text-gray-400 uppercase tracking-wide";
      lbl.textContent = label;

      const list = document.createElement("div");
      list.className = "w-full";
      types.forEach((other) => {
        const row = document.createElement("div");
        row.className =
          "flex justify-between items-center py-0.5 border-b border-gray-100 text-sm last:border-0";
        const name = document.createElement("span");
        name.className = "font-medium text-gray-600";
        name.textContent = other;
        const ico = document.createElement("span");
        const ok = compat.includes(other);
        ico.className = ok
          ? "text-green-600 font-bold"
          : "text-red-400 font-bold";
        ico.textContent = ok ? "✓" : "✗";
        row.appendChild(name);
        row.appendChild(ico);
        list.appendChild(row);
      });

      card.appendChild(badge);
      card.appendChild(lbl);
      card.appendChild(list);
      grid.appendChild(card);
    });
  }

  window.switchTab = function (tab) {
    document.getElementById("grid-recebe").style.display =
      tab === "recebe" ? "grid" : "none";
    document.getElementById("grid-doa").style.display =
      tab === "doa" ? "grid" : "none";
    const btnR = document.getElementById("btn-recebe");
    const btnD = document.getElementById("btn-doa");
    btnR.style.background = tab === "recebe" ? "#C62828" : "white";
    btnR.style.color = tab === "recebe" ? "white" : "#C62828";
    btnD.style.background = tab === "doa" ? "#C62828" : "white";
    btnD.style.color = tab === "doa" ? "white" : "#C62828";
  };

  buildGrid("grid-recebe", canReceiveFrom, "Recebe de");
  buildGrid("grid-doa", canDonateTo, "Doa para");

  document.getElementById("grid-doa").style.display = "none";
}

