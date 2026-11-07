(function () {
  "use strict";

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || !form.classList || !form.classList.contains("apply-form")) return;

    var button = form.querySelector("button[type='submit']");
    if (!button) return;

    button.disabled = true;
    button.textContent = "접수 중…";

    window.setTimeout(function () {
      button.disabled = false;
      button.textContent = "신청서 제출";
    }, 8000);
  });
})();
