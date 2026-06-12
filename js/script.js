/**
 * Dados de entregas - em um sistema real, esses dados viriam de uma API conectada a um banco de dados.
 * Mantidos conforme a base oficial do enunciado.
 */
const entregas = [
  { id: "301", regiao: "Sudeste", transportadora: "RotaMax", prazo: 3, diasReais: 7 },
  { id: "302", regiao: "Sul", transportadora: "ViaCargo", prazo: 5, diasReais: 5 },
  { id: "303", regiao: "Nordeste", transportadora: "FlashLog", prazo: 4, diasReais: 9 },
  { id: "304", regiao: "Norte", transportadora: "RotaMax", prazo: 6, diasReais: 4 },
  { id: "305", regiao: "Centro-Oeste", transportadora: "ViaCargo", prazo: 2, diasReais: 6 },
  { id: "306", regiao: "Sul", transportadora: "FlashLog", prazo: 5, diasReais: 12 },
  { id: "307", regiao: "Sul", transportadora: "RotaMax", prazo: 6, diasReais: 9 },
  { id: "308", regiao: "Sudeste", transportadora: "ViaCargo", prazo: 3, diasReais: 4 },
  { id: "309", regiao: "Norte", transportadora: "FlashLog", prazo: 5, diasReais: 5 },
  { id: "310", regiao: "Nordeste", transportadora: "ViaCargo", prazo: 4, diasReais: 8 }
];

let graficoTransportadora, graficoRegiao, graficoStatus, graficoRanking;
let dadosAtuais = [...entregas];

function normalizarTexto(texto) {
  return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function calcularAtraso(entrega) {
  return Math.max(0, entrega.diasReais - entrega.prazo);
}

function textoDias(valor) {
  return valor === 1 ? "1 dia" : `${valor} dias`;
}

function textoEntregas(valor) {
  return valor === 1 ? "1 entrega" : `${valor} entregas`;
}

function obterStatus(entrega) {
  const dias = calcularAtraso(entrega);
  if (dias === 0) return "No prazo";
  if (dias <= 2) return "Atenção";
  return "Crítico";
}

function popularFiltros() {
  const regioes = [...new Set(entregas.map(e => e.regiao))];
  const transportadoras = [...new Set(entregas.map(e => e.transportadora))];

  const selectRegiao = document.getElementById("filtroRegiao");
  const selectTransportadora = document.getElementById("filtroTransportadora");

  regioes.forEach(reg => {
    const opt = document.createElement("option");
    opt.value = reg;
    opt.textContent = reg;
    selectRegiao.appendChild(opt);
  });

  transportadoras.forEach(transp => {
    const opt = document.createElement("option");
    opt.value = transp;
    opt.textContent = transp;
    selectTransportadora.appendChild(opt);
  });
}

function obterDadosFiltrados() {
  const regiao = document.getElementById("filtroRegiao").value;
  const transportadora = document.getElementById("filtroTransportadora").value;
  const busca = normalizarTexto(document.getElementById("buscaInput").value);

  return entregas.filter(e => {
    const matchRegiao = regiao === "Todas" || e.regiao === regiao;
    const matchTransportadora = transportadora === "Todas" || e.transportadora === transportadora;
    const textoBusca = normalizarTexto(`${e.id} ${e.regiao} ${e.transportadora}`);
    const matchBusca = textoBusca.includes(busca);
    return matchRegiao && matchTransportadora && matchBusca;
  });
}

function atualizarCards(dados) {
  const total = dados.length;
  const atrasadas = dados.filter(e => calcularAtraso(e) > 0).length;
  const taxa = total ? Math.round((atrasadas / total) * 100) : 0;
  const maiorAtraso = total ? Math.max(...dados.map(e => calcularAtraso(e))) : 0;

  document.getElementById("totalEntregas").textContent = total;
  document.getElementById("totalAtrasadas").textContent = atrasadas;
  document.getElementById("taxaAtraso").textContent = `${taxa}%`;
  document.getElementById("maiorAtraso").textContent = textoDias(maiorAtraso);
}

function agregarAtrasoPorChave(lista, chave) {
  return lista.reduce((acc, item) => {
    const nome = item[chave];
    acc[nome] = (acc[nome] || 0) + calcularAtraso(item);
    return acc;
  }, {});
}

function atualizarInsightAutomatico(dados) {
  if (!dados.length) {
    document.getElementById("insightAutomatico").textContent =
      "Nenhuma entrega encontrada com os filtros atuais.";
    return;
  }

  const atrasadas = dados.filter(e => calcularAtraso(e) > 0);
  const taxa = Math.round((atrasadas.length / dados.length) * 100);
  const maisCritica = [...dados].sort((a, b) => calcularAtraso(b) - calcularAtraso(a))[0];

  const porRegiao = agregarAtrasoPorChave(dados, "regiao");
  const regiaoCritica = Object.entries(porRegiao).sort((a, b) => b[1] - a[1])[0];

  const entregaCriticaTexto = calcularAtraso(maisCritica) > 0
    ? `Entrega mais crítica: <strong>${maisCritica.id}</strong>, com ${textoDias(calcularAtraso(maisCritica))} de atraso.`
    : "Nenhuma entrega crítica no filtro atual.";

  const regiaoCriticaTexto = regiaoCritica[1] > 0
    ? `Região crítica: <strong>${regiaoCritica[0]}</strong> (${textoDias(regiaoCritica[1])} acumulados).`
    : "Nenhuma região crítica no filtro atual.";

  document.getElementById("insightAutomatico").innerHTML = `
    📍 <strong>${dados.length}</strong> ${dados.length === 1 ? "entrega analisada" : "entregas analisadas"}.
    <strong>${atrasadas.length}</strong> com atraso (${taxa}%).
    ${entregaCriticaTexto}
    ${regiaoCriticaTexto}
  `;
}

function atualizarTabela(dados) {
  const tbody = document.getElementById("tabelaBody");
  tbody.innerHTML = "";

  const ordenados = [...dados].sort((a, b) => calcularAtraso(b) - calcularAtraso(a));

  ordenados.forEach(entrega => {
    const atrasoDias = calcularAtraso(entrega);
    const status = obterStatus(entrega);

    let badgeClass = "badge-ok";
    if (status === "Atenção") badgeClass = "badge-warning";
    if (status === "Crítico") badgeClass = "badge-critical";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${entrega.id}</td>
      <td>${entrega.regiao}</td>
      <td>${entrega.transportadora}</td>
      <td>${textoDias(entrega.prazo)}</td>
      <td>${textoDias(entrega.diasReais)}</td>
      <td>${textoDias(atrasoDias)}</td>
      <td><span class="status-badge ${badgeClass}">${status}</span></td>
    `;

    tr.addEventListener("click", () => {
      abrirModal(
        `Entrega ${entrega.id}`,
        `Região: ${entrega.regiao}<br>` +
        `Transportadora: ${entrega.transportadora}<br>` +
        `Prazo contratado: ${textoDias(entrega.prazo)}<br>` +
        `Dias reais: ${textoDias(entrega.diasReais)}<br>` +
        `Atraso: ${textoDias(atrasoDias)}<br>` +
        `Status: ${status}`
      );
    });

    tbody.appendChild(tr);
  });
}

function destruirGraficos() {
  if (graficoTransportadora) graficoTransportadora.destroy();
  if (graficoRegiao) graficoRegiao.destroy();
  if (graficoStatus) graficoStatus.destroy();
  if (graficoRanking) graficoRanking.destroy();
}

function criarGraficoBarra(elemento, labels, valores, titulo, horizontal = false) {
  return new Chart(elemento, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: titulo,
        data: valores,
        backgroundColor: "#38bdf8",
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: horizontal ? "y" : "x",
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => textoDias(ctx.raw)
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#cbd5e1" },
          grid: { color: "#1e293b" }
        },
        y: {
          ticks: { color: "#cbd5e1" }
        }
      },
      onClick: (_, elements) => {
        if (elements.length) {
          const i = elements[0].index;
          abrirModal(
            labels[i],
            `Total acumulado: ${textoDias(valores[i])}. Prioridade operacional elevada.`
          );
        }
      }
    }
  });
}

function criarGraficoStatus(elemento, noPrazo, atrasadas) {
  return new Chart(elemento, {
    type: "doughnut",
    data: {
      labels: ["No prazo", "Atrasadas"],
      datasets: [{
        data: [noPrazo, atrasadas],
        backgroundColor: ["#2a9d8f", "#e76f51"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#e2e8f0" }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${textoEntregas(ctx.raw)}`
          }
        }
      },
      onClick: () => {
        abrirModal(
          "Status consolidado",
          `Entregas no prazo: ${textoEntregas(noPrazo)} | Atrasadas: ${textoEntregas(atrasadas)}.`
        );
      }
    }
  });
}

function atualizarGraficos(dados) {
  destruirGraficos();

  const atrasoTransportadora = agregarAtrasoPorChave(dados, "transportadora");
  const atrasoRegiao = agregarAtrasoPorChave(dados, "regiao");

  const ranking = [...dados]
    .filter(e => calcularAtraso(e) > 0)
    .sort((a, b) => calcularAtraso(b) - calcularAtraso(a))
    .slice(0, 5);

  const noPrazo = dados.filter(e => calcularAtraso(e) === 0).length;
  const atrasadas = dados.filter(e => calcularAtraso(e) > 0).length;

  graficoTransportadora = criarGraficoBarra(
    document.getElementById("graficoTransportadora"),
    Object.keys(atrasoTransportadora),
    Object.values(atrasoTransportadora),
    "Dias de atraso"
  );

  graficoRegiao = criarGraficoBarra(
    document.getElementById("graficoRegiao"),
    Object.keys(atrasoRegiao),
    Object.values(atrasoRegiao),
    "Dias de atraso"
  );

  graficoStatus = criarGraficoStatus(
    document.getElementById("graficoStatus"),
    noPrazo,
    atrasadas
  );

  graficoRanking = criarGraficoBarra(
    document.getElementById("graficoRanking"),
    ranking.map(e => e.id),
    ranking.map(e => calcularAtraso(e)),
    "Dias",
    true
  );
}

function gerarInsightTexto(tipo) {
  const d = dadosAtuais;
  const total = d.length;
  const atrasadas = d.filter(e => calcularAtraso(e) > 0).length;
  const taxa = total ? Math.round((atrasadas / total) * 100) : 0;

  const map = {
    total: ["Total de entregas", `Considerando os filtros atuais, são ${textoEntregas(total)} no total.`],
    atrasadas: ["Entregas atrasadas", `${textoEntregas(atrasadas)} estão fora do prazo (${taxa}% do total).`],
    taxa: ["Taxa de atraso", `A taxa atual é de ${taxa}% sobre o volume filtrado.`],
    maior: ["Maior atraso", `O maior atraso encontrado é de ${document.getElementById("maiorAtraso").textContent}.`],
    transportadora: ["Análise por transportadora", "O gráfico mostra os dias acumulados de atraso por cada transportadora. Quanto maior a barra, maior a criticidade."],
    regiao: ["Análise por região", "Regiões com barras mais altas concentram os maiores atrasos totais."],
    status: ["Status das entregas", "Gráfico de rosca mostrando proporção de entregas no prazo versus com atraso."],
    ranking: ["Ranking crítico", "As 5 entregas com maior número de dias em atraso, prioridade máxima para ação."],
    tabela: ["Tabela operacional", "Clique em qualquer linha para ver detalhes da entrega. Ordenada do maior para o menor atraso."]
  };

  return map[tipo] || ["Insight", "Explore os filtros para mais informações."];
}

function abrirModal(titulo, texto) {
  document.getElementById("modalTitle").innerText = titulo;
  document.getElementById("modalBody").innerHTML = `<p>${texto}</p>`;
  document.getElementById("modalOverlay").classList.add("active");
}

function fecharModal() {
  document.getElementById("modalOverlay").classList.remove("active");
}

function atualizarDashboard() {
  dadosAtuais = obterDadosFiltrados();
  atualizarCards(dadosAtuais);
  atualizarInsightAutomatico(dadosAtuais);
  atualizarTabela(dadosAtuais);
  atualizarGraficos(dadosAtuais);
}

document.getElementById("filtroRegiao").addEventListener("change", atualizarDashboard);
document.getElementById("filtroTransportadora").addEventListener("change", atualizarDashboard);
document.getElementById("buscaInput").addEventListener("input", atualizarDashboard);

document.querySelectorAll("[data-insight]").forEach(btn => {
  btn.addEventListener("click", () => {
    const tipo = btn.getAttribute("data-insight");
    const [tit, txt] = gerarInsightTexto(tipo);
    abrirModal(tit, txt);
  });
});

document.getElementById("closeModalBtn").addEventListener("click", fecharModal);
document.getElementById("modalOverlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modalOverlay")) fecharModal();
});

popularFiltros();
atualizarDashboard();