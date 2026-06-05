// js/api.js
// Configuração única da URL da API. É o único lugar que você precisa editar.
//
// Quando rodar no seu computador (localhost), ele usa o backend local automaticamente.
// Quando estiver hospedado, ele usa a URL de produção abaixo.
//
// >>> TROQUE a URL de produção pela URL do seu backend no Render <<<
//     Exemplo: https://doemais-api.onrender.com

const API_URL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://doemais-api.onrender.com";
