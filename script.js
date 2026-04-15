const form = document.getElementById("decision-form");
const resultSection = document.getElementById("result");
const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const resultReasons = document.getElementById("result-reasons");
const error = document.getElementById("error");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const answers = {};
  const fields = ["lockin","exit","dependency","asymmetry","obligation","reversibility"];

  for (let f of fields) {
    const val = document.querySelector(`input[name="${f}"]:checked`);
    if (!val) {
      error.classList.remove("hidden");
      return;
    }
    answers[f] = val.value;
  }

  error.classList.add("hidden");

  let result = evaluate(answers);
  display(result);
});

function evaluate(a) {
  let reasons = [];

  if (a.lockin === "yes") reasons.push("Lock-in present");
  if (a.exit === "no") reasons.push("No clean exit");
  if (a.dependency === "yes") reasons.push("Dependency created");

  if (a.lockin === "yes" || a.exit === "no" || a.dependency === "yes") {
    return {
      title: "DO NOT TAKE",
      summary: "The structure is broken. Do not proceed.",
      reasons
    };
  }

  let flags = (
    a.lockin === "unsure" ||
    a.exit === "partial" ||
    a.dependency === "partial" ||
    a.asymmetry !== "no" ||
    a.obligation !== "no" ||
    a.reversibility !== "yes"
  );

  if (flags) {
    return {
      title: "CONDITIONAL",
      summary: "This only works if key terms are clarified. Do not proceed as is.",
      reasons: ["Unclear or imbalanced structure"]
    };
  }

  return {
    title: "TAKE",
    summary: "The structure is clean. No immediate structural issues detected.",
    reasons: ["No lock-in, clean exit, no dependency"]
  };
}

function display(res) {
  resultTitle.textContent = res.title;
  resultSummary.textContent = res.summary;

  resultReasons.innerHTML = "";
  res.reasons.forEach(r => {
    let li = document.createElement("li");
    li.textContent = r;
    resultReasons.appendChild(li);
  });

  resultSection.classList.remove("hidden");
}

function resetForm() {
  form.reset();
  resultSection.classList.add("hidden");
}
