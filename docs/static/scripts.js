import { semestres } from '../disciplinas.js';

document.addEventListener("DOMContentLoaded", function () {
    const disciplinasContainer = document.getElementById("disciplinas-container");

    semestres.forEach((semestre, i) => {
        const semestreDiv = document.createElement("div");
        semestreDiv.classList.add("semestre");

        // Título do semestre
        const semestreTitle = document.createElement("h3");
        semestreTitle.textContent = `Semestre ${i + 1}`;
        semestreDiv.appendChild(semestreTitle);

        // Cria um container para as checkboxes de fase
        const fasesContainer = document.createElement("div");
        fasesContainer.classList.add("fase-checklist");

        // Criar checkboxes de fase 1..7
        for (let fase = 1; fase <= 7; fase++) {
            const label = document.createElement("label");
            label.textContent = `Fase ${fase}`;

            // Cria input checkbox
            const input = document.createElement("input");
            input.type = "checkbox";

            // Se quiser alguma lógica quando marcar/desmarcar, adicione eventListener aqui
            // ex: input.addEventListener("change", () => { ... });

            label.prepend(input);
            fasesContainer.appendChild(label);
        }
        semestreDiv.appendChild(fasesContainer);

        // Cria as disciplinas do semestre
        for (const [nome, preRequisitos] of Object.entries(semestre)) {
            const disciplinaDiv = document.createElement("div");
            disciplinaDiv.classList.add("disciplina");
            disciplinaDiv.textContent = nome;
            disciplinaDiv.dataset.nome = nome;
            disciplinaDiv.dataset.preRequisitos = JSON.stringify(preRequisitos);

            // Clique na disciplina → alterna "concluída" se ela estiver "pode-fazer" ou "concluída"
            disciplinaDiv.addEventListener("click", () => {
                if (
                    disciplinaDiv.classList.contains("pode-fazer") ||
                    disciplinaDiv.classList.contains("concluida")
                ) {
                    disciplinaDiv.classList.toggle("concluida");
                    if (disciplinaDiv.classList.contains("concluida")) {
                        disciplinaDiv.classList.remove("pode-fazer");
                    }
                    updateDisciplinasStatus();
                }
            });

            semestreDiv.appendChild(disciplinaDiv);
        }

        disciplinasContainer.appendChild(semestreDiv);
    });

    updateDisciplinasStatus();

    function updateDisciplinasStatus() {
        const allDisciplinas = document.querySelectorAll(".disciplina");

        allDisciplinas.forEach(disciplina => {
            const preRequisitos = JSON.parse(disciplina.dataset.preRequisitos);

            // Se não há pré-requisitos, é "pode-fazer"
            if (preRequisitos.length === 0) {
                disciplina.classList.add("pode-fazer");
            } else {
                // Verifica se todos os pré-requisitos estão concluídos
                const allConcluidas = preRequisitos.every(pr => {
                    const prElement = document.querySelector(`[data-nome='${pr}']`);
                    return prElement && prElement.classList.contains("concluida");
                });

                if (allConcluidas) {
                    disciplina.classList.add("pode-fazer");
                } else {
                    disciplina.classList.add("nao-pode-fazer");
                }
            }
        });

        // Ajusta as classes de cada disciplina
        allDisciplinas.forEach(disciplina => {
            if (disciplina.classList.contains("concluida")) {
                disciplina.classList.add("concluida");
                disciplina.classList.remove("pode-fazer", "nao-pode-fazer");
            } else {
                const preRequisitos = JSON.parse(disciplina.dataset.preRequisitos);
                const allConcluidas = preRequisitos.every(pr => {
                    const prElement = document.querySelector(`[data-nome='${pr}']`);
                    return prElement && prElement.classList.contains("concluida");
                });

                if (allConcluidas) {
                    disciplina.classList.remove("nao-pode-fazer");
                    disciplina.classList.add("pode-fazer");
                } else {
                    disciplina.classList.remove("pode-fazer");
                    disciplina.classList.add("nao-pode-fazer");
                }
            }
        });
    }
});
