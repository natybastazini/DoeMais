if (!localStorage.getItem("token")) {
  window.location.href = "./login.html";
}

const SEXO_MAP = { M: "Masculino", F: "Feminino", O: "Outro" };

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}
function setVal(id, valor) {
  const el = document.getElementById(id);
  if (el) el.value = valor ?? "";
}
function setText(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor || "—";
}
function getUsuario() {
  try { return JSON.parse(localStorage.getItem("usuario")) || {}; }
  catch { return {}; }
}
function formatarCPF(cpf) {
  if (!cpf) return "";
  const d = String(cpf).replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function mostrarMsg(texto, sucesso) {
  const el = document.getElementById("perfil-msg");
  el.textContent = texto;
  el.className = "rounded-2xl px-4 py-2 text-sm font-inter " +
    (sucesso ? "bg-green-2 text-green-1" : "bg-red-1/10 text-red-1");
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 4000);
}

function preencherView() {
  const u = getUsuario();
  setText("v-nome", u.nome);
  setText("v-email", u.email);
  setText("v-cpf", formatarCPF(u.cpf));
  setText("v-data", u.data_nascimento);
  setText("v-sexo", SEXO_MAP[u.sexo] || u.sexo || "—");
  setText("v-tipo", u.tipo_sanguineo === "NAO_SEI" ? "Não sei" : (u.tipo_sanguineo || "—"));
}

function abrirModal() {
  const u = getUsuario();
  setVal("f-nome", u.nome);
  setVal("f-email", u.email);
  setVal("f-cpf", formatarCPF(u.cpf));
  setVal("f-data", u.data_nascimento);
  setVal("f-sexo", u.sexo);
  setVal("f-tipo", u.tipo_sanguineo);
  setVal("f-senha", "");
  document.getElementById("modal-overlay").classList.add("open");
}

function fecharModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

function initMascaras() {
  const cpf = document.getElementById("f-cpf");
  cpf.addEventListener("input", () => {
    let v = cpf.value.replace(/\D/g, "").slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    cpf.value = v;
  });
}

async function salvarPerfil() {
  const dados = {
    nome: val("f-nome").trim(),
    email: val("f-email").trim(),
    cpf: val("f-cpf").replace(/\D/g, ""),
    data_nascimento: val("f-data"),
    sexo: val("f-sexo"),
    tipo_sanguineo: val("f-tipo"),
  };
  const novaSenha = val("f-senha");

  if (!dados.nome || !dados.email) {
    mostrarMsg("Nome e e-mail são obrigatórios.", false);
    return;
  }

  try {
    const body = { ...dados };
    if (novaSenha) body.password = novaSenha;
    const res = await fetch(API_URL + "/usuarios/me", {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    const atualizado = await res.json();
    localStorage.setItem("usuario", JSON.stringify(atualizado));
    preencherView();
    fecharModal();
    mostrarMsg("Perfil atualizado com sucesso!", true);
  } catch (_) {
    mostrarMsg("Não foi possível salvar no servidor.", false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof initFaq === "function") initFaq();
  preencherView();
  initMascaras();

  document.getElementById("btn-editar").addEventListener("click", abrirModal);
  document.getElementById("btn-fechar-modal").addEventListener("click", fecharModal);
  document.getElementById("btn-cancelar").addEventListener("click", fecharModal);
  document.getElementById("btn-salvar").addEventListener("click", salvarPerfil);
  document.getElementById("btn-sair").addEventListener("click", () => {
    if (typeof logout === "function") logout();
  });
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-overlay")) fecharModal();
  });
});