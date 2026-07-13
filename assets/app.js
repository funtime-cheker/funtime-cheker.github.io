/* ============================================================
   FunTime Checker — interactions & animations
   ============================================================ */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ---------- year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- nav: scroll state + progress ---------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- burger ---------- */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  burger.addEventListener("click", () => {
    const open = burger.classList.toggle("open");
    navLinks.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      burger.classList.remove("open");
      navLinks.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- scrollspy ---------- */
  const spyLinks = [...document.querySelectorAll("[data-spy]")];
  const spySections = spyLinks
    .map((a) => document.getElementById(a.dataset.spy))
    .filter(Boolean);
  if (spySections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          spyLinks.forEach((a) =>
            a.classList.toggle("active", a.dataset.spy === en.target.id)
          );
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    spySections.forEach((s) => spy.observe(s));
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (reduced) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- animated counters ---------- */
  const fmt = (n, dec) =>
    n.toLocaleString("ru-RU", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const counters = document.querySelectorAll(".num");
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const dec = parseInt(el.dataset.decimals || "0", 10);
        if (reduced) { el.textContent = fmt(target, dec); return; }
        const dur = 1600;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * e, dec);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => cio.observe(el));

  /* ---------- cursor glow ---------- */
  const glow = document.getElementById("cursorGlow");
  if (glow && !isTouch && !reduced) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add("has-mouse");
    }, { passive: true });
    const loop = () => {
      gx += (tx - gx) * 0.09;
      gy += (ty - gy) * 0.09;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- tilt ---------- */
  if (!isTouch && !reduced) {
    document.querySelectorAll(".tilt").forEach((card) => {
      let raf = null;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`;
        });
      });
      card.addEventListener("mouseleave", () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = "";
        card.style.transition = "transform 0.5s ease";
        setTimeout(() => (card.style.transition = ""), 500);
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (!isTouch && !reduced) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.translate = `${dx * 8}px ${dy * 6}px`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.translate = ""; });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    q.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((i) => {
        i.classList.remove("open");
        i.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- coverage tabs ---------- */
  const tabBtns = [...document.querySelectorAll(".tab-btn")];
  const tabPanels = [...document.querySelectorAll(".tab-panel")];
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.tab);
      tabBtns.forEach((b, j) => {
        b.classList.toggle("active", j === i);
        b.setAttribute("aria-selected", String(j === i));
      });
      tabPanels.forEach((p, j) => {
        p.classList.toggle("active", j === i);
        p.hidden = j !== i;
      });
    });
  });

  /* ---------- terminal typing ---------- */
  const termBody = document.getElementById("termBody");
  if (termBody) {
    const LINES = [
      { t: "ftchecker --scan --full", c: "t-cmd" },
      { t: "FunTime Checker v2.4.1 · база сигнатур от 13.07.2026", c: "t-dim" },
      { t: "[✓] Индекс MFT: 1 842 337 файлов · 2.1 c", c: "t-ok" },
      { t: "[✓] Prefetch: 128 записей проанализировано", c: "t-ok" },
      { t: "[✓] Журналы Windows: 14 302 события", c: "t-ok" },
      { t: "[!] nursultan.exe — удалён 14:32:07, запускался 14:05:11", c: "t-warn" },
      { t: "[!] Инжект в javaw.exe (JNI) — 14:06:43", c: "t-warn" },
      { t: "[!] Очистка корзины во время проверки", c: "t-warn" },
      { t: "[✗] ВЕРДИКТ: ЧИТ-КЛИЕНТ ОБНАРУЖЕН · уверенность 99.2%", c: "t-err" },
      { t: "Отчёт: C:\\FTChecker\\report_13-07-2026.html", c: "t-dim" },
    ];

    if (reduced) {
      LINES.forEach(({ t, c }) => {
        const div = document.createElement("div");
        div.className = "t-line " + c;
        div.textContent = t;
        termBody.appendChild(div);
      });
    } else {
      const caret = document.createElement("span");
      caret.className = "t-caret";
      let li = 0;

      const typeLine = () => {
        if (li >= LINES.length) {
          setTimeout(() => {
            termBody.innerHTML = "";
            li = 0;
            typeLine();
          }, 4200);
          return;
        }
        const { t, c } = LINES[li];
        const div = document.createElement("div");
        div.className = "t-line " + c;
        termBody.appendChild(div);
        div.appendChild(caret);
        let ci = 0;
        const isCmd = c === "t-cmd";
        const speed = isCmd ? 55 : 10;

        const typeChar = () => {
          if (ci <= t.length) {
            div.textContent = t.slice(0, ci);
            div.appendChild(caret);
            ci++;
            setTimeout(typeChar, speed);
          } else {
            li++;
            setTimeout(typeLine, isCmd ? 500 : 170);
          }
        };
        typeChar();
      };

      const tio = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          tio.disconnect();
          setTimeout(typeLine, 600);
        }
      }, { threshold: 0.3 });
      tio.observe(termBody);
    }
  }

  /* ---------- particle network ---------- */
  const canvas = document.getElementById("net");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, pts = [];
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(90, Math.floor((W * H) / 16000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const LINK = 130;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const o = (1 - Math.sqrt(d2) / LINK) * 0.14;
            ctx.strokeStyle = `rgba(255, 45, 85, ${o.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = "rgba(255, 82, 110, 0.5)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };

    const hio = new IntersectionObserver((entries) => {
      const vis = entries[0].isIntersecting;
      if (vis && !running) { running = true; draw(); }
      else if (!vis) running = false;
    });
    hio.observe(canvas);
    draw();
  }

  /* ============================================================
     Live search demo (Everything-style)
     ============================================================ */
  const saInput = document.getElementById("saInput");
  const saBody = document.getElementById("saBody");
  const saMeta = document.getElementById("saMeta");
  const saEmpty = document.getElementById("saEmpty");

  if (saInput && saBody) {
    // demo index: [path, size, modified, status]
    // status: sig = сигнатура, del = удалён, trace = след запуска, ok = обычный
    const FILES = [
      ["C:\\Users\\Player\\Downloads\\nursultan_loader.exe", "4.2 МБ", "13.07 14:03", "sig"],
      ["C:\\Windows\\Prefetch\\NURSULTAN.EXE-8A2B41F0.pf", "84 КБ", "13.07 14:05", "trace"],
      ["C:\\Users\\Player\\AppData\\Local\\Temp\\celestial_inject.dll", "1.8 МБ", "12.07 22:41", "sig"],
      ["C:\\Users\\Player\\Downloads\\OBS.exe", "6.1 МБ", "13.07 13:58", "sig"],
      ["C:\\$Recycle.Bin\\S-1-5-21\\$R2K4LM9.exe", "4.2 МБ", "13.07 14:32", "del"],
      ["C:\\Users\\Player\\AppData\\Local\\Temp\\~wx231.tmp", "2.9 МБ", "11.07 19:02", "del"],
      ["C:\\Users\\Player\\AppData\\Roaming\\wildclient\\config.wc", "12 КБ", "10.07 21:15", "sig"],
      ["C:\\Windows\\Prefetch\\XCLEANER.EXE-99A0B2C3.pf", "61 КБ", "13.07 14:30", "trace"],
      ["C:\\Users\\Player\\Downloads\\deadcode_free.rar", "18.4 МБ", "08.07 16:44", "sig"],
      ["C:\\Users\\Player\\AppData\\Local\\CheatEngine\\cheatengine-x86_64.exe", "28.1 МБ", "02.07 12:30", "sig"],
      ["C:\\Users\\Player\\AppData\\Roaming\\.minecraft\\mods\\sodium-0.5.8.jar", "2.4 МБ", "02.07 18:12", "ok"],
      ["C:\\Users\\Player\\AppData\\Roaming\\.minecraft\\mods\\lithium-0.11.jar", "1.1 МБ", "02.07 18:12", "ok"],
      ["C:\\Users\\Player\\AppData\\Roaming\\.minecraft\\mods\\iris-1.7.jar", "5.6 МБ", "02.07 18:13", "ok"],
      ["C:\\Users\\Player\\AppData\\Roaming\\.minecraft\\versions\\1.16.5\\1.16.5.jar", "16.2 МБ", "01.06 10:00", "ok"],
      ["C:\\Users\\Player\\AppData\\Roaming\\.minecraft\\logs\\latest.log", "412 КБ", "13.07 14:31", "ok"],
      ["C:\\Users\\Player\\AppData\\Roaming\\.minecraft\\options.txt", "8 КБ", "12.07 20:05", "ok"],
      ["C:\\Users\\Player\\AppData\\Roaming\\.minecraft\\screenshots\\2026-07-10_1.png", "2.2 МБ", "10.07 23:11", "ok"],
      ["C:\\Program Files\\Java\\jre1.8.0_301\\bin\\javaw.exe", "192 КБ", "14.05 09:00", "ok"],
      ["C:\\Windows\\Prefetch\\JAVAW.EXE-1F2C88A1.pf", "96 КБ", "13.07 14:05", "ok"],
      ["C:\\Users\\Player\\AppData\\Local\\Temp\\jna-103525\\jna.dll", "1.3 МБ", "13.07 14:05", "ok"],
      ["C:\\Users\\Player\\Desktop\\FunTime.lnk", "2 КБ", "01.06 10:02", "ok"],
      ["C:\\Users\\Player\\Documents\\clips\\hvh_clip1.mp4", "84.5 МБ", "09.07 22:37", "ok"],
      ["C:\\Users\\Player\\Videos\\proofs\\2026-07-13_14-31.mkv", "122 МБ", "13.07 14:31", "ok"],
      ["C:\\Users\\Player\\AppData\\Roaming\\discord\\settings.json", "4 КБ", "13.07 13:00", "ok"],
      ["C:\\Windows\\System32\\drivers\\etc\\hosts", "1 КБ", "01.06 09:58", "ok"],
    ];

    const BADGE = {
      sig: '<span class="sa-badge sig">СИГНАТУРА</span>',
      del: '<span class="sa-badge del">УДАЛЁН</span>',
      trace: '<span class="sa-badge trace">СЛЕД ЗАПУСКА</span>',
      ok: '<span class="sa-badge ok">обычный</span>',
    };

    const NOTES = {
      "C:\\Users\\Player\\Downloads\\OBS.exe": " · hash = expensive.exe",
      "C:\\$Recycle.Bin\\S-1-5-21\\$R2K4LM9.exe": " · был nursultan_loader.exe",
    };

    const escapeHtml = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const render = (rawQuery) => {
      const q = rawQuery.trim();
      let rows;
      let highlightRe = null;

      if (q === ":удалённые") {
        rows = FILES.filter((f) => f[3] === "del");
      } else if (q === "") {
        rows = FILES;
      } else if (q.includes("*")) {
        // simple glob on the file name
        const re = new RegExp("^" + q.split("*").map(escapeReg).join(".*") + "$", "i");
        rows = FILES.filter((f) => re.test(f[0].split("\\").pop()));
      } else {
        const needle = q.toLowerCase();
        rows = FILES.filter((f) => f[0].toLowerCase().includes(needle));
        highlightRe = new RegExp("(" + escapeReg(q) + ")", "ig");
      }

      saBody.innerHTML = rows
        .map(([path, size, date, status]) => {
          let shown = escapeHtml(path);
          if (highlightRe) shown = shown.replace(highlightRe, "<mark>$1</mark>");
          const note = NOTES[path] ? '<span class="t-dim">' + escapeHtml(NOTES[path]) + "</span>" : "";
          return `<tr class="row-${status}"><td>${shown}${note}</td><td>${size}</td><td>${date}</td><td>${BADGE[status]}</td></tr>`;
        })
        .join("");

      saEmpty.hidden = rows.length > 0;
      const flagged = rows.filter((f) => f[3] !== "ok").length;
      const time = (0.002 + rows.length * 0.00004).toFixed(3);
      saMeta.innerHTML =
        `${rows.length} объектов · <b>${flagged} помечено</b> · ${time} с · демо-индекс (в утилите: 1 842 337 файлов)`;
    };

    saInput.addEventListener("input", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      render(saInput.value);
    });

    document.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        const q = chip.dataset.q;
        if (q) chip.classList.add("active");
        saInput.value = q;
        render(q);
        saInput.focus();
      });
    });

    // hotkey "/" focuses the demo search
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== saInput &&
          !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        saInput.focus();
        saInput.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      }
    });

    render("");
  }

  /* ---------- hero mouse parallax ---------- */
  const hero = document.querySelector(".hero");
  if (hero && !isTouch && !reduced) {
    const g1 = hero.querySelector(".hero-glow-1");
    const g2 = hero.querySelector(".hero-glow-2");
    const term = hero.querySelector(".hero-term");
    let px = 0, py = 0, cx = 0, cy = 0, raf = null;
    const apply = () => {
      cx += (px - cx) * 0.07;
      cy += (py - cy) * 0.07;
      if (g1) g1.style.translate = `${(cx * -30).toFixed(1)}px ${(cy * -20).toFixed(1)}px`;
      if (g2) g2.style.translate = `${(cx * 22).toFixed(1)}px ${(cy * 16).toFixed(1)}px`;
      if (term) term.style.translate = `${(cx * -9).toFixed(1)}px ${(cy * -7).toFixed(1)}px`;
      if (Math.abs(px - cx) + Math.abs(py - cy) > 0.002) raf = requestAnimationFrame(apply);
      else raf = null;
    };
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  }

  /* ---------- cursor spotlight position for .tilt shine ---------- */
  if (!isTouch && !reduced) {
    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      }, { passive: true });
    });
  }

  /* ---------- search placeholder typing ---------- */
  if (saInput && !reduced) {
    const HINTS = ["nursultan", "*.jar", "prefetch", "celestial", "OBS.exe", ":удалённые"];
    const BASE = "Поиск по индексу: ";
    let hi = 0, chi = 0, deleting = false;
    const tickPh = () => {
      if (document.activeElement === saInput || saInput.value) {
        saInput.setAttribute("placeholder", "Поиск по индексу: nursultan, *.jar, prefetch…");
        setTimeout(tickPh, 1500);
        return;
      }
      const word = HINTS[hi];
      chi += deleting ? -1 : 1;
      saInput.setAttribute("placeholder", BASE + word.slice(0, chi) + "▌");
      let delay = deleting ? 40 : 90;
      if (!deleting && chi === word.length) { delay = 1600; deleting = true; }
      else if (deleting && chi === 0) { deleting = false; hi = (hi + 1) % HINTS.length; delay = 350; }
      setTimeout(tickPh, delay);
    };
    tickPh();
  }

  /* ---------- GitHub release resolver ----------
     Как только в репозитории появляется релиз с .exe-ассетом,
     кнопка скачивания начинает вести прямо на файл, а версия,
     размер и счётчик скачиваний обновляются автоматически. */
  const GH_REPO = "funtime-cheker/funtime-cheker.github.io";
  const dlBtn = document.getElementById("dlBtn");
  if (dlBtn) {
    fetch("https://api.github.com/repos/" + GH_REPO + "/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((rel) => {
        if (!rel || !Array.isArray(rel.assets) || !rel.assets.length) return;
        const asset = rel.assets.find((a) => /\.exe$/i.test(a.name)) || rel.assets[0];

        dlBtn.href = asset.browser_download_url;
        dlBtn.removeAttribute("target");

        const ver = rel.tag_name ? "v" + rel.tag_name.replace(/^v/i, "") : "";
        const mb = (asset.size / 1048576).toFixed(1).replace(".", ",");
        const info = document.getElementById("dlInfo");
        if (info) info.textContent = `${ver ? ver + " · " : ""}Windows 10/11 · ${mb} МБ · без установки`;

        const heroVer = document.getElementById("heroVer");
        if (heroVer && ver) heroVer.textContent = ver;

        const note = document.getElementById("dlNote");
        if (note && asset.download_count > 0) {
          note.hidden = false;
          note.innerHTML = `скачано <b>${asset.download_count.toLocaleString("ru-RU")}</b> раз`;
        }
      })
      .catch(() => {});
  }
})();
