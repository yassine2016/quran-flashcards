let words = [];
let studyMode = false;

document.getElementById("loadBtn").addEventListener("click", loadWords);
document.getElementById("studyModeBtn").addEventListener("click", () => { studyMode = true; renderCards(words); });
document.getElementById("listModeBtn").addEventListener("click", () => { studyMode = false; renderCards(words); });
document.getElementById("categoryFilter").addEventListener("change", () => renderCards(words));

async function loadWords() {
    const topN = parseInt(document.getElementById("topN").value);

    const res = await fetch("words.json");
    const data = await res.json();

    const byCategory = {
        verb: data.filter(w => w.category === "verb").sort((a, b) => a.frequency - b.frequency).slice(0, topN),
        noun: data.filter(w => w.category === "noun").sort((a, b) => a.frequency - b.frequency).slice(0, topN),
        particle: data.filter(w => w.category === "particle").sort((a, b) => a.frequency - b.frequency).slice(0, topN)
    };

    words = [...byCategory.verb, ...byCategory.noun, ...byCategory.particle];
    renderCards(words);
}

function renderCards(list) {
    const container = document.getElementById("flashcards");
    container.innerHTML = "";

    const filter = document.getElementById("categoryFilter").value;
    const filtered = filter === "all" ? list : list.filter(w => w.category === filter);

    filtered.forEach(word => {
        const card = document.createElement("div");
        card.className = "card";

        if (studyMode) {
            card.innerHTML = `
                <div class="front">${word.lemma}</div>
                <div class="back" style="display:none;">
                    <p>Category: ${word.category}</p>
                    ${word.audioUrl ? `<audio controls src="${word.audioUrl}"></audio>` : `<p>No audio</p>`}
                </div>
            `;
            card.addEventListener("click", () => {
                const front = card.querySelector(".front");
                const back = card.querySelector(".back");
                front.style.display = front.style.display === "none" ? "block" : "none";
                back.style.display = back.style.display === "none" ? "block" : "none";
            });
        } else {
            card.innerHTML = `
                <h3>${word.lemma}</h3>
                <p>Category: ${word.category}</p>
                <p>Freq: ${word.frequency}</p>
                ${word.audioUrl ? `<audio controls src="${word.audioUrl}"></audio>` : `<p>No audio</p>`}
            `;
            card.addEventListener("click", () => expandVerb(card, word));
        }

        container.appendChild(card);
    });
}

function expandVerb(card, word) {
    if (word.category !== "verb" || !word.forms) return;

    const formsDiv = document.createElement("div");
    formsDiv.className = "forms";

    word.forms.forEach(f => {
        formsDiv.innerHTML += `
            <div>
                <strong>${f.formType}</strong> – ${f.text}
                ${f.audioUrl ? `<audio controls src="${f.audioUrl}"></audio>` : `<span>No audio</span>`}
            </div>
        `;
    });

    card.appendChild(formsDiv);
}
