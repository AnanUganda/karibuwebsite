/* Karibu Care — small progressive enhancements. The site works without JS;
   this adds the nav scroll state, mobile menu, reveal motion, stepper
   highlight and the WhatsApp quote form. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  /* ---- Nav: transparent over the home hero, solid once scrolled ---- */
  var nav = document.querySelector(".nav");
  if (nav && nav.classList.contains("nav--overlay")) {
    var onScroll = function () {
      nav.classList.toggle("is-solid", window.scrollY > 24 || nav.classList.contains("is-open"));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".nav__toggle");
  var panel = document.getElementById("nav-panel");
  if (toggle && panel) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      nav.classList.toggle("is-open", open);
      if (nav.classList.contains("nav--overlay")) {
        nav.classList.toggle("is-solid", open || window.scrollY > 24);
      }
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- How it works: fill the step nearest the middle of the screen ---- */
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  if (steps.length) {
    var setActive = function () {
      var mid = window.innerHeight * 0.5;
      var active = steps[0];
      steps.forEach(function (step) {
        if (step.getBoundingClientRect().top < mid) active = step;
      });
      steps.forEach(function (step) { step.classList.toggle("is-active", step === active); });
    };
    setActive();
    window.addEventListener("scroll", setActive, { passive: true });
    window.addEventListener("resize", setActive);
  }

  /* ---- Get a Quote form: open WhatsApp with the answers pre-filled ---- */
  var form = document.getElementById("quote-form");
  if (form) {
    form.setAttribute("novalidate", "");
    var fields = Array.prototype.slice.call(form.querySelectorAll("[data-field]"));

    var valueOf = function (field) {
      var checked = field.querySelector("input:checked");
      if (checked) return checked.value;
      var input = field.querySelector("input:not([type=radio])");
      return input ? input.value.trim() : "";
    };

    var validate = function (field) {
      var ok = valueOf(field) !== "";
      field.classList.toggle("has-error", !ok);
      var input = field.querySelector("input:not([type=radio])");
      if (input) input.setAttribute("aria-invalid", String(!ok));
      return ok;
    };

    fields.forEach(function (field) {
      field.addEventListener("change", function () {
        if (field.classList.contains("has-error")) validate(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (field) {
        if (!validate(field) && !firstBad) firstBad = field;
      });
      if (firstBad) {
        var focusable = firstBad.querySelector("input");
        if (focusable) focusable.focus();
        return;
      }
      // Message uses the form's own field labels, one answer per line.
      var lines = fields.map(function (field) {
        return field.getAttribute("data-field") + ": " + valueOf(field);
      });
      var url = form.getAttribute("data-whatsapp") + "?text=" + encodeURIComponent(lines.join("\n"));
      var win = window.open(url, "_blank");
      if (win) win.opener = null;
      else window.location.href = url; // popup blocked: go there directly
    });
  }
})();
