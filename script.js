const form = document.getElementById("decision-form");
const errorEl = document.getElementById("form-error");
const resultCard = document.getElementById("result-card");
const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const resultReasons = document.getElementById("result-reasons");
const resetBtn = document.getElementById("reset-btn");

const questionNames = [
  "lockin",
  "exit",
  "dependency",
  "asymmetry",
  "obligation",
  "reversibility",
];

function getAnswers() {
  const answers = {};

  for (const name of questionNames) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (!selected) {
      return null;
    }
    answers[name] = selected.value;
  }

  return answers;
}

function evaluateDecision(answers) {
  const reasons = [];

  const doNotTake =
    answers.lockin === "yes" ||
    answers.exit === "no" ||
    answers.dependency === "yes";

  if (answers.lockin === "yes") {
    reasons.push("Lock-in detected.");
  }
  if (answers.exit === "no") {
    reasons.push("Exit is not clean.");
  }
  if (answers.dependency === "yes") {
    reasons.push("Dependency risk is present.");
  }

  if (doNotTake) {
    return {
      status: "DO NOT TAKE",
      className: "result-donot",
      summary: "The structure creates direct exposure to lock-in, weak exit, or dependency.",
      reasons,
    };
  }

  const conditionalFlags = [
    answers.lockin === "unsure",
    answers.exit === "partial",
    answers.dependency === "partial",
    answers.asymmetry === "yes",
    answers.asymmetry === "unsure",
    answers.obligation === "yes",
    answers.obligation === "unclear",
    answers.reversibility === "no",
    answers.reversibility === "difficult",
  ];

  if (conditionalFlags.some(Boolean)) {
    if (answers.lockin === "unsure") {
      reasons.push("Lock-in is not fully clear.");
    }
    if (answers.exit === "partial") {
      reasons.push("Exit is only partial, not clean.");
    }
    if (answers.dependency === "partial") {
      reasons.push("Some dependency is being created.");
    }
    if (answers.asymmetry === "yes" || answers.asymmetry === "unsure") {
      reasons.push("Upside/downside balance may be unfavourable.");
    }
    if (answers.obligation === "yes" || answers.obligation === "unclear") {
      reasons.push("Commitment may exceed guaranteed return.");
    }
    if (answers.reversibility === "no" || answers.reversibility === "difficult") {
      reasons.push("Reversibility is weak.");
    }

    return {
      status: "CONDITIONAL",
      className: "result-conditional",
      summary: "The structure is not clearly broken, but it is not clean enough to proceed without tightening terms.",
      reasons,
    };
  }

  return {
    status: "TAKE",
    className: "result-take",
    summary: "The structure appears clean on lock-in, exit, dependency, and reversibility.",
    reasons: [
      "No immediate lock-in detected.",
      "Exit appears clean.",
      "Dependency does not appear concentrated.",
    ],
  };
}

function renderResult(result) {
  resultTitle.textContent = result.status;
  resultTitle.className = result.className;
  resultSummary.textContent = result.summary;

  resultReasons.innerHTML = "";
  result.reasons.forEach((reason) => {
    const li = document.createElement("li");
    li.textContent = reason;
    resultReasons.appendChild(li);
  });

  resultCard.classList.remove("hidden");
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const answers = getAnswers();

  if (!answers) {
    errorEl.classList.remove("hidden");
    return;
  }

  errorEl.classList.add("hidden");
  const result = evaluateDecision(answers);
  renderResult(result);
});

resetBtn.addEventListener("click", () => {
  form.reset();
  resultCard.classList.add("hidden");
  errorEl.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});