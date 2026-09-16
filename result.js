const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const resultReasons = document.getElementById("result-reasons");
const resultMeaning = document.getElementById("result-meaning");
const handoffButton = document.getElementById("qds-handoff");
const handoffStatus = document.getElementById("qds-handoff-status");
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

  handoffButton?.addEventListener("click", async () => {
    handoffButton.disabled = true;
    handoffStatus.textContent = "Preparing your private QDS handoff…";
    const sourceRunId = sessionStorage.getItem("dstLiteRunId") || `dst_lite_${crypto.randomUUID()}`;
    sessionStorage.setItem("dstLiteRunId", sourceRunId);
    try {
      const response = await fetch("/api/qds-handoff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sourceTool: "DST_LITE",
          sourceRunId,
          title: "Decision Stress Test result",
          objective: "Preserve the DST Lite result for optional follow-up in QDS.",
          inputPayload: result.inputs || {},
          outputPayload: { title: result.title, summary: result.summary, meaning: result.meaning, reasons: result.reasons, statusClass: result.statusClass },
          schemaVersion: "1"
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "The optional QDS handoff is not configured.");
      handoffStatus.textContent = "Handoff ready. Opening QDS…";
      if (typeof gtag === "function") gtag("event", "si_to_qds_handoff", { tool_name: "decision_stress_test", source_tool: "DST_LITE" });
      window.open(body.claimUrl, "_blank", "noopener");
    } catch (error) {
      handoffStatus.textContent = error instanceof Error ? error.message : "The optional QDS handoff is unavailable.";
      handoffButton.disabled = false;
    }
  });
}
