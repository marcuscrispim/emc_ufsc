document.addEventListener("DOMContentLoaded", function () {
    const disciplinasContainer = document.getElementById("disciplinas-container");
    const progressLabel = document.getElementById("progress-label");
    const progressBar = document.getElementById("progress-bar");
    const resetButton = document.getElementById("reset-button");
    const concluidas = new Set(JSON.parse(localStorage.getItem("disciplinasConcluidas") || "[]"));
    let semestres = [];
    let disciplinasMap = new Map();

    loadDisciplinas()
        .then(data => {
            semestres = data;
            disciplinasMap = new Map(
                semestres.flatMap(semestre => semestre.map(disciplina => [disciplina.nome, disciplina]))
            );
            [...concluidas].forEach(nome => {
                if (!disciplinasMap.has(nome)) {
                    concluidas.delete(nome);
                }
            });

            semestres.forEach((semestre, index) => {
                const semestreDiv = document.createElement("div");
                semestreDiv.classList.add("semestre");
                semestreDiv.dataset.semestre = String(index);

                const semestreHeader = document.createElement("div");
                semestreHeader.classList.add("semestre-header");

                const semestreTitle = document.createElement("h2");
                semestreTitle.textContent = `${index + 1}º semestre`;

                const semestreCount = document.createElement("span");
                semestreCount.classList.add("semestre-count");
                semestreCount.dataset.count = String(index);

                semestreHeader.append(semestreTitle, semestreCount);
                semestreDiv.appendChild(semestreHeader);

                const concluirButton = document.createElement("button");
                concluirButton.type = "button";
                concluirButton.dataset.action = String(index);
                concluirButton.addEventListener("click", () => {
                    toggleSemestre(index);
                    updateDisciplinasStatus();
                });
                semestreDiv.appendChild(concluirButton);

                const disciplinasList = document.createElement("div");
                disciplinasList.classList.add("disciplinas-list");

                semestre.forEach(disciplina => {
                    const disciplinaDiv = document.createElement("div");
                    disciplinaDiv.classList.add("disciplina");
                    disciplinaDiv.tabIndex = 0;
                    disciplinaDiv.setAttribute("role", "button");
                    disciplinaDiv.setAttribute("aria-pressed", "false");
                    disciplinaDiv.dataset.nome = disciplina.nome;
                    disciplinaDiv.dataset.preRequisitos = JSON.stringify(disciplina.preRequisitos);

                    const codigo = document.createElement("strong");
                    codigo.textContent = disciplina.nome;

                    const status = document.createElement("small");

                    disciplinaDiv.append(codigo, status);
                    disciplinaDiv.addEventListener("click", () => toggleDisciplina(disciplina.nome));
                    disciplinaDiv.addEventListener("keydown", event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleDisciplina(disciplina.nome);
                        }
                    });

                    disciplinasList.appendChild(disciplinaDiv);
                });

                semestreDiv.appendChild(disciplinasList);
                disciplinasContainer.appendChild(semestreDiv);
            });

            updateDisciplinasStatus();
        })
        .catch(() => {
            disciplinasContainer.innerHTML = `
                <div class="empty-state">
                    Não foi possível carregar as disciplinas.
                </div>
            `;
        });

    resetButton.addEventListener("click", () => {
        concluidas.clear();
        updateDisciplinasStatus();
    });

    function toggleDisciplina(nome) {
        if (concluidas.has(nome)) {
            concluidas.delete(nome);
        } else if (isLiberada(nome)) {
            concluidas.add(nome);
        }

        updateDisciplinasStatus();
    }

    function toggleSemestre(index) {
        const disciplinasSemestre = semestres[index];
        const semestreCompleto = disciplinasSemestre.every(disciplina => concluidas.has(disciplina.nome));

        disciplinasSemestre.forEach(disciplina => {
            if (semestreCompleto) {
                concluidas.delete(disciplina.nome);
            } else {
                concluidas.add(disciplina.nome);
            }
        });
    }

    function isLiberada(nome) {
        const disciplina = disciplinasMap.get(nome);
        return disciplina && disciplina.preRequisitos.every(pr => concluidas.has(pr));
    }

    function updateDisciplinasStatus() {
        const allDisciplinas = document.querySelectorAll(".disciplina");
        const total = disciplinasMap.size;
        const totalConcluidas = concluidas.size;

        allDisciplinas.forEach(disciplina => {
            const nome = disciplina.dataset.nome;
            const status = disciplina.querySelector("small");

            disciplina.classList.remove("concluida", "pode-fazer", "nao-pode-fazer");

            if (concluidas.has(nome)) {
                disciplina.classList.add("concluida");
                disciplina.setAttribute("aria-pressed", "true");
                status.textContent = "Concluída";
            } else if (isLiberada(nome)) {
                disciplina.classList.add("pode-fazer");
                disciplina.setAttribute("aria-pressed", "false");
                status.textContent = "Liberada";
            } else {
                disciplina.classList.add("nao-pode-fazer");
                disciplina.setAttribute("aria-pressed", "false");
                status.textContent = "Bloqueada";
            }
        });

        semestres.forEach((semestre, index) => {
            const concluidasSemestre = semestre.filter(disciplina => concluidas.has(disciplina.nome)).length;
            const count = document.querySelector(`[data-count='${index}']`);
            const button = document.querySelector(`[data-action='${index}']`);
            const semestreCompleto = concluidasSemestre === semestre.length;

            count.textContent = `${concluidasSemestre}/${semestre.length}`;
            button.textContent = semestreCompleto ? "Desmarcar semestre" : "Concluir semestre";
            button.classList.toggle("semestre-completo", semestreCompleto);
        });

        progressLabel.textContent = `${totalConcluidas} de ${total} concluídas`;
        progressBar.style.width = total ? `${(totalConcluidas / total) * 100}%` : "0";
        localStorage.setItem("disciplinasConcluidas", JSON.stringify([...concluidas]));
    }

    function loadDisciplinas() {
        return fetchJson("static/disciplinas.json")
            .catch(() => fetchJson("/disciplinas"));
    }

    function fetchJson(url) {
        return fetch(url).then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao carregar ${url}`);
            }

            return response.json();
        });
    }
});
