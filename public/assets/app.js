(function () {
  "use strict";

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

  function clearSlot(dialog) {
    if (!dialog) return;
    var slot = dialog.querySelector("[id$='-slot']");
    if (slot) slot.innerHTML = "";
  }

  function openDialog(slot) {
    var dialog = slot.closest("dialog");
    if (!dialog) return;

    if (!dialog.open) dialog.showModal();

    var focusTarget = slot.querySelector(
      "input:not([type='hidden']):not([disabled]), select, textarea, button[data-close-dialog]",
    );
    if (focusTarget) focusTarget.focus();
  }

  document.body.addEventListener("htmx:afterSwap", function (event) {
    var target = event.detail && event.detail.target;
    if (!target) return;

    if (target.querySelectorAll) {
      target.querySelectorAll("form").forEach(syncCapacity);
    }

    if (!target.id || !/-slot$/.test(target.id)) return;

    var dialog = target.closest("dialog");
    if (!dialog) return;

    if (!dialog.open) {
      openDialog(target);
    } else {
      var invalidField = target.querySelector(".input-error");
      if (invalidField) invalidField.focus();
    }
  });

  document.addEventListener("click", function (event) {
    var closer = event.target.closest("[data-close-dialog]");
    if (!closer) return;

    var dialog = closer.closest("dialog");
    if (dialog && dialog.open) dialog.close();
    clearSlot(dialog);
  });

  document.addEventListener("click", function (event) {
    if (event.target.tagName !== "DIALOG") return;
    event.target.close();
    clearSlot(event.target);
  });

  document.addEventListener("close", function (event) {
    if (event.target && event.target.tagName === "DIALOG") {
      clearSlot(event.target);
    }
  }, true);

  document.body.addEventListener("volunteer:changed", function (event) {
    var dialog = document.getElementById("volunteer-dialog");
    if (dialog && dialog.open) dialog.close();
    clearSlot(dialog);

    var table = document.getElementById("volunteer-table");
    if (table && window.htmx) {
      window.htmx.trigger(table, "refresh");
    }

    var detail = event.detail || {};
    showToast(detail.message || "저장했습니다.");
  });

  document.body.addEventListener("application:changed", function (event) {
    var table = document.getElementById("application-table");
    if (table && window.htmx) {
      window.htmx.trigger(table, "refresh");
    }

    var detail = event.detail || {};
    showToast(detail.message || "신청 상태를 저장했습니다.");
  });

  document.body.addEventListener("htmx:responseError", function (event) {
    var xhr = event.detail && event.detail.xhr;
    if (xhr && xhr.status === 401) return;
    showToast("요청을 처리하지 못했습니다. 잠시 후 다시 시도하세요.");
  });

  function syncCapacity(form) {
    var unlimited = form.querySelector("input[name='unlimited']");
    var capacity = form.querySelector("input[name='capacity']");
    if (!unlimited || !capacity) return;

    capacity.disabled = unlimited.checked;
    if (unlimited.checked) capacity.value = "";
  }

  document.addEventListener("change", function (event) {
    if (!event.target || event.target.name !== "unlimited") return;
    var form = event.target.closest("form");
    if (form) syncCapacity(form);
  });

  document.querySelectorAll("form").forEach(syncCapacity);
})();
