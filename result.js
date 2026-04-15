const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const resultReasons = document.getElementById("result-reasons");
const resultMeaning = document.getElementById("result-meaning");

const stored = sessionStorage.getItem("decisionResult");

if (!stored) {
  window.location.href = "index.html";
} else {
  const result = JSON.parse(stored);

  resultTitle.textContent = result.title;
  resultTitle.classList.add(result.statusClass);
  resultSummary.textContent = result.summary;
  resultMeaning.textContent = result.meaning;

  resultReasons.innerHTML = "";
  result.reasons.forEach((reason) => {
    const li = document.createElement("li");
    li.textContent = reason;
    resultReasons.appendChild(li);
  });
}