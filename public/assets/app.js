(function () {
  "use strict";

  function dialog() {
    return document.getElementById("volunteer-dialog");
  }

  function formSlot() {
    return document.getElementById("form-slot");
  }

  function showToast(message) {
    var region = document.getElementById("toast-region");
    if (!region) return;

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    region.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    window.setTimeout(function () {
      toast.classList.remove("is-visible");
      window.setTimeout(function () {
        toast.remove();
      }, 200);
    }, 3200);
  }

  function resetFormSlot() {
    var slot = formSlot();
    if (slot) slot.innerHTML = "";
  }

  document.body.addEventListener("htmx:afterSwap", function (event) {
    var target = event.detail && event.detail.target;
    if (!target || target.id !== "form-slot") return;

    var el = dialog();
    if (el && !el.open) {
      el.showModal();
      document.body.style.overflow = "hidden";
      var firstField = target.querySelector(
        "input:not([type='hidden']), select, textarea",
      );
      if (firstField) firstField.focus();
    } else if (el && el.open) {
      var invalidField = target.querySelector(".input-error");
      if (invalidField) invalidField.focus();
    }
  });

  document.addEventListener("click", function (event) {
    var closer = event.target.closest("[data-close-dialog]");
    if (!closer) return;
    var el = dialog();
    if (el && el.open) el.close();
    resetFormSlot();
  });

  document.addEventListener("click", function (event) {
    var el = dialog();
    if (el && el.open && event.target === el) {
      el.close();
      resetFormSlot();
    }
  });

  document.body.addEventListener("volunteer:changed", function (event) {
    var el = dialog();
    if (el && el.open) el.close();
    resetFormSlot();

    var table = document.getElementById("volunteer-table");
    if (table && window.htmx) {
      window.htmx.trigger(table, "refresh");
    } else if (window.location.pathname !== "/") {
      window.location.assign("/volunteers");
    }

    var detail = event.detail || {};
    showToast(detail.message || "저장했습니다.");
  });

  document.body.addEventListener("htmx:responseError", function (event) {
    var xhr = event.detail && event.detail.xhr;
    if (xhr && xhr.status === 401) return;
    showToast("요청을 처리하지 못했습니다. 잠시 후 다시 시도하세요.");
  });

  var el = dialog();
  if (el) {
    el.addEventListener("close", function () {
      resetFormSlot();
      document.body.style.overflow = "";
    });
  }
})();
