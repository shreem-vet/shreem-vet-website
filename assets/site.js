(function () {
  const rootPrefix = document.body?.dataset?.rootPrefix || "./";

  const buildPath = (path) => {
    if (!path) return "";
    if (/^(https?:|mailto:|tel:)/i.test(path)) return path;
    return `${rootPrefix}${path}`;
  };

  const loadJson = async (name) => {
    const options = [buildPath(name), name, `../${name}`];
    for (const url of options) {
      try {
        const response = await fetch(url);
        if (response.ok) return await response.json();
      } catch (e) {}
    }
    return null;
  };

  const applySiteData = (data) => {
    if (!data) return;

    document.querySelectorAll("[data-site]").forEach((el) => {
      const key = el.dataset.site;
      if (data[key]) el.textContent = data[key];
    });

    document.querySelectorAll("[data-site-href]").forEach((el) => {
      const key = el.dataset.siteHref;
      if (!data[key]) return;
      let value = data[key];
      const scheme = el.dataset.siteScheme;
      if (scheme === "mailto") value = `mailto:${value}`;
      if (scheme === "tel") value = `tel:${value}`;
      el.setAttribute("href", value);
    });

    document.querySelectorAll("[data-hide-if-missing]").forEach((el) => {
      const key = el.dataset.hideIfMissing;
      if (!data[key]) el.classList.add("hide");
    });
  };

  const setFavicon = () => {
    const href = buildPath(
      "new-shreemvet/new-logo/WhatsApp Image 2026-06-08 at 17.12.11.jpeg",
    );
    const selectors = 'link[rel="icon"], link[rel="shortcut icon"]';
    let link = document.head.querySelector(selectors);
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/jpeg";
    link.href = href;
  };

  const buildUnifiedHeader = () => {
    document.querySelectorAll(".top-strip").forEach((el) => el.remove());

    const header = document.getElementById("site-header");
    if (!header) return;

    header.className = "global-header";
    header.innerHTML = `
      <div class="global-header-inner">
        <a class="header-logo-link" href="${rootPrefix}">
          <img class="header-logo" src="${buildPath("images/extra/log.png")}" alt="Shreemvet Industries logo" />
        </a>
        <div class="header-nav-box">
          <nav class="header-nav" aria-label="Primary">
            <a class="header-nav-link" href="${rootPrefix}">Home</a>
            <a class="header-nav-link" href="${buildPath("about/index.html")}">About</a>
            <a class="header-nav-link" href="${buildPath("product/index.html")}">All Products</a>
            <a class="header-nav-link" href="${buildPath("contact/index.html")}">Contact</a>
          </nav>
        </div>
        <div class="header-phone" aria-label="Call us">
          <ion-icon name="call-outline"></ion-icon>
          <span data-site="phone">+91 6284310250</span>
        </div>
      </div>
    `;
  };

  const initMenu = () => {
    const header = document.getElementById("site-header");
    const button = document.querySelector(".menu-btn");
    if (!header || !button) return;

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      header.classList.toggle("nav-open");
    });

    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) header.classList.remove("nav-open");
    });
  };

  const toTitle = (value) =>
    value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const renderCatalogues = async () => {
    const container = document.getElementById("catalogue-grid");
    if (!container) return;
    const catalogues = await loadJson("catalogues-data.json");
    if (!catalogues) return;

    container.innerHTML = catalogues
      .map(
        (item) => `
          <article class="catalog-card">
            <img src="${buildPath(item.image)}" alt="${item.title} catalogue" />
            <h3>${item.title}</h3>
            <a class="download-btn" href="${buildPath(item.file)}" target="_blank" download>Download</a>
          </article>
        `,
      )
      .join("");
  };

  const getQueryState = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get("category") || "Bolus",
      product: params.get("product") || "",
    };
  };

  const updateQuery = (category, product) => {
    const params = new URLSearchParams(window.location.search);
    params.set("category", category);
    if (product) params.set("product", product);
    else params.delete("product");
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  };

  const renderProducts = async (isHome = false) => {
    const tabRow = document.getElementById(
      isHome ? "home-tabs" : "product-tabs",
    );
    const grid = document.getElementById(
      isHome ? "home-product-grid" : "product-grid",
    );
    if (!tabRow || !grid) return;

    const productData = await loadJson("products-data.json");
    if (!productData) return;

    const categories = ["All", "Bolus", "Cattle", "Poultry"].filter(
      (cat) => cat === "All" || productData[cat],
    );
    const state = getQueryState();
    let activeCategory = categories.includes(state.category)
      ? state.category
      : categories[0];

    const drawTabs = () => {
      tabRow.innerHTML = categories
        .map((cat) => {
          const label = cat === "All" ? "All Products" : cat;
          return `<button class="tab-btn ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${label}</button>`;
        })
        .join("");
    };

    const drawGrid = () => {
      let items = [];
      if (activeCategory === "All") {
        // flatten all category arrays in canonical order
        const order = ["Bolus", "Cattle", "Poultry"];
        order.forEach((cat) => {
          if (Array.isArray(productData[cat]))
            items = items.concat(productData[cat]);
        });
      } else {
        items = productData[activeCategory] || [];
      }
      grid.innerHTML = items
        .map(
          (item) => `
            <a class="product-card product-card-link" href="${buildPath(item.pageHref || `product/${item.slug || item.id}/`)}">
              <img src="${buildPath(item.cover)}" alt="${item.name}" />
              <h3>${toTitle(item.name)}</h3>
            </a>
          `,
        )
        .join("");
    };

    tabRow.addEventListener("click", (event) => {
      const button = event.target.closest(".tab-btn");
      if (!button) return;
      activeCategory = button.dataset.category;
      drawTabs();
      drawGrid();
    });

    drawTabs();
    drawGrid();
  };

  const transformCompositionTables = () => {
    document.querySelectorAll(".composition-table").forEach((table) => {
      try {
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        if (!rows.length) return;
        const list = document.createElement("div");
        list.className = "composition-list";
        rows.forEach((tr) => {
          const th = tr.querySelector("th");
          const td = tr.querySelector("td");
          const row = document.createElement("div");
          row.className = "comp-row";
          const name = document.createElement("div");
          name.className = "comp-name";
          name.textContent = th ? th.textContent.trim() : "";
          const qty = document.createElement("div");
          qty.className = "comp-qty";
          qty.textContent = td ? td.textContent.trim() : "";
          row.appendChild(name);
          row.appendChild(qty);
          list.appendChild(row);
        });
        table.parentNode.replaceChild(list, table);
      } catch (e) {
        // silently ignore transform failures
      }
    });
  };

  const init = async () => {
    buildUnifiedHeader();
    initMenu();
    setFavicon();

    const siteData = await loadJson("site-data.json");
    applySiteData(siteData);

    await renderCatalogues();

    if (document.body.dataset.page === "home") {
      await renderProducts(true);
    }

    if (document.body.dataset.page === "products") {
      await renderProducts(false);
    }

    // transform static composition tables into responsive rows
    transformCompositionTables();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
