const form = document.getElementById("decision-form");
const errorEl = document.getElementById("form-error");

const questionNames = [
  "lockin",
  "exit",
  "dependency",
  "asymmetry",
  "obligation",
  "reversibility",
];

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const answers = {};

  for (const name of questionNames) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (!selected) {
      errorEl.classList.remove("hidden");
      return;
    }
    answers[name] = selected.value;
  }

  errorEl.classList.add("hidden");

  const result = evaluateDecision(answers);
  sessionStorage.setItem("decisionResult", JSON.stringify(result));
  window.location.href = "result.html";
});

function evaluateDecision(a) {
  const reasons = [];

  if (a.lockin === "yes") reasons.push("Lock-in is present.");
  if (a.exit === "no") reasons.push("There is no clean exit.");
  if (a.dependency === "yes") reasons.push("Dependency is being created.");

  if (a.lockin === "yes" || a.exit === "no" || a.dependency === "yes") {
    return {
      title: "DO NOT TAKE",
      summary: "The structure is broken. Do not proceed.",
      meaning:
        "This is not a pricing issue or a confidence issue. The structure itself creates direct risk through lock-in, weak exit, or dependency.",
      reasons,
      statusClass: "result-donot",
    };
  }

  const conditionalFlags = [
    a.lockin === "unsure",
    a.exit === "partial",
    a.dependency === "partial",
    a.asymmetry !== "no",
    a.obligation !== "no",
    a.reversibility !== "yes",
  ];

  if (conditionalFlags.some(Boolean)) {
    if (a.lockin === "unsure") reasons.push("Lock-in is not fully clear.");
    if (a.exit === "partial") reasons.push("Exit is only partial.");
    if (a.dependency === "partial") reasons.push("Some dependency is being created.");
    if (a.asymmetry === "yes" || a.asymmetry === "unsure") reasons.push("Upside and downside may be imbalanced.");
    if (a.obligation === "yes" || a.obligation === "unclear") reasons.push("Commitment may exceed guaranteed return.");
    if (a.reversibility === "no" || a.reversibility === "difficult") reasons.push("Recovery would be difficult if this fails.");

    return {
      title: "CONDITIONAL",
      summary: "This only works if key terms are clarified. Do not proceed as is.",
      meaning:
        "The structure is not clearly broken, but it is not clean. Unclear terms, asymmetry, or weak reversibility need tightening before any commitment.",
      reasons,
      statusClass: "result-conditional",
    };
  }

  return {
    title: "TAKE",
    summary: "The structure is clean. No immediate structural issues detected.",
    meaning:
      "No direct lock-in, no obvious dependency, and no major structural imbalance were detected based on your answers.",
    reasons: [
      "No immediate lock-in detected.",
      "Exit appears clean.",
      "Dependency does not appear concentrated.",
    ],
    statusClass: "result-take",
  };
}
