import {
  getCoverSrc,
  isYouTubeProject,
  portfolioData,
  projectPageUrl,
} from "./shared.js?v=20260605a";

const root = document.getElementById("categories-root");
const heroName = document.getElementById("hero-name");
const heroRole = document.getElementById("hero-role");
const heroSummary = document.getElementById("hero-summary");
const resumeButton = document.getElementById("resume-button");
const contactHeading = document.getElementById("contact-heading");
const contactLead = document.querySelector(".contact__lead");
const contactLinksRoot = document.getElementById("contact-links");

heroName.textContent = portfolioData.profile.name;
heroRole.textContent = portfolioData.profile.role;
heroSummary.textContent = portfolioData.profile.summary;
if (resumeButton && portfolioData.resumeFile) {
  resumeButton.href = encodeURI(`./${portfolioData.resumeFile}`);
}
if (contactHeading && portfolioData.contact?.heading) {
  contactHeading.textContent = portfolioData.contact.heading;
}
if (contactLead && portfolioData.contact?.lead) {
  contactLead.textContent = portfolioData.contact.lead;
}

const makeCoverMedia = (project) => {
  const wrap = document.createElement("div");
  wrap.className = "project__media project__media--cover";

  if (project.mediaPending) {
    wrap.innerHTML =
      '<div class="project__media-placeholder">Media coming soon</div>';
    return wrap;
  }

  const coverSrc = getCoverSrc(project);
  if (isYouTubeProject(project) && !coverSrc) {
    wrap.innerHTML =
      '<div class="project__media-placeholder project__media-placeholder--video">Film · view project</div>';
    return wrap;
  }

  if (!coverSrc) {
    wrap.innerHTML =
      '<div class="project__media-placeholder">Cover image unavailable</div>';
    return wrap;
  }

  const img = document.createElement("img");
  img.src = coverSrc;
  img.alt = `${project.title} cover image`;
  img.loading = "lazy";
  img.decoding = "async";
  img.onerror = () => {
    wrap.innerHTML =
      '<div class="project__media-placeholder">Media failed to load</div>';
  };
  wrap.appendChild(img);
  return wrap;
};

portfolioData.categories.forEach((category) => {
  const section = document.createElement("section");
  section.className = "category";
  section.id = category.id;

  const header = document.createElement("div");
  header.className = "category__header";
  header.innerHTML = `<h2>${category.title}</h2><p>${category.description}</p>`;

  const grid = document.createElement("div");
  grid.className = "project-grid";

  category.projects.forEach((project) => {
    const card = document.createElement("a");
    card.className = "project project--link";
    card.href = projectPageUrl(project.slug);
    card.setAttribute("aria-label", `View ${project.title}`);

    const coverMedia = makeCoverMedia(project);
    card.appendChild(coverMedia);

    const body = document.createElement("div");
    body.className = "project__body";
    const shortDescription = (project.description || "").split(/\n\s*\n/)[0] || "";
    body.innerHTML = `
      <h3 class="project__title">${project.title}</h3>
      <p class="project__meta">${category.title}</p>
      <p class="project__summary">${shortDescription}</p>
      <span class="project__hint">View project →</span>
    `;
    card.appendChild(body);

    grid.appendChild(card);
  });

  section.appendChild(header);
  section.appendChild(grid);
  root.appendChild(section);
});

if (contactLinksRoot && portfolioData.contact) {
  const list = document.createElement("div");
  list.className = "contact__grid";

  (portfolioData.contact.links || []).forEach((entry) => {
    const item = document.createElement("a");
    item.className = "contact-card";
    item.href = entry.url;
    item.target = entry.url.startsWith("mailto:") ? "_self" : "_blank";
    item.rel = "noreferrer";

    const iconWrap = document.createElement("span");
    iconWrap.className = "contact-card__icon";
    if (entry.icon) {
      const icon = document.createElement("img");
      icon.src = encodeURI(`./${entry.icon}`);
      icon.alt = `${entry.label} icon`;
      icon.loading = "lazy";
      icon.decoding = "async";
      icon.onerror = () => {
        iconWrap.textContent = entry.label.slice(0, 2).toUpperCase();
      };
      iconWrap.appendChild(icon);
    } else {
      iconWrap.textContent = entry.label.slice(0, 2).toUpperCase();
    }

    const title = document.createElement("strong");
    title.textContent = entry.label;
    const handle = document.createElement("span");
    handle.textContent = entry.handle || "";

    item.appendChild(iconWrap);
    item.appendChild(title);
    item.appendChild(handle);
    list.appendChild(item);
  });

  contactLinksRoot.appendChild(list);
}

const setupFastAnchorNavigation = () => {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetTop, behavior: "auto" });
      history.replaceState(null, "", href);
    });
  });
};

setupFastAnchorNavigation();

const initThreeHero = async () => {
  const canvas = document.getElementById("avatar-canvas");
  const heroSection = document.getElementById("top");
  if (!canvas) return;

  try {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js");

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.45, 5.2);

    const avatarRoot = new THREE.Group();
    scene.add(avatarRoot);

    scene.add(new THREE.HemisphereLight(0xc7ddff, 0x0f1830, 1.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    keyLight.position.set(3, 2, 4);
    const fillLight = new THREE.PointLight(0x78d7ff, 1.4, 20);
    fillLight.position.set(-2.6, -0.3, 2.7);
    const rimLight = new THREE.PointLight(0xc580ff, 0.9, 20);
    rimLight.position.set(-3.2, 1.8, -3);
    scene.add(keyLight, fillLight, rimLight);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 2),
      new THREE.MeshStandardMaterial({
        color: 0xaad7ff,
        emissive: 0x1a2f5a,
        emissiveIntensity: 0.95,
        metalness: 0.25,
        roughness: 0.25,
      })
    );
    avatarRoot.add(core);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.88, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x6bc6ff,
        transparent: true,
        opacity: 0.1,
      })
    );
    avatarRoot.add(halo);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x8bd9ff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.02, 8, 120), ringMaterial);
    ringA.rotation.x = Math.PI * 0.35;
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.018, 8, 120), ringMaterial.clone());
    ringB.rotation.y = Math.PI * 0.5;
    ringB.rotation.x = Math.PI * 0.12;
    avatarRoot.add(ringA, ringB);

    const electronOrbits = [];
    const electronColors = [0x70d7ff, 0xc580ff, 0x90f2ca];
    electronColors.forEach((color, index) => {
      const pivot = new THREE.Group();
      const electron = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, roughness: 0.3 })
      );
      electron.position.set(1.05 + index * 0.26, 0, 0);
      pivot.rotation.set(index * 0.7, index * 0.95, 0);
      pivot.add(electron);
      avatarRoot.add(pivot);
      electronOrbits.push({ pivot, speed: 0.8 + index * 0.26 });
    });

    const satelliteGroup = new THREE.Group();
    satelliteGroup.position.set(-1.9, 0.35, -1.1);
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x7fd3ff, metalness: 0.15, roughness: 0.45 })
    );
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd5deff, roughness: 0.6 })
    );
    moon.position.set(0.6, 0.04, 0);
    const moonOrbit = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.01, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0xb8ccff, transparent: true, opacity: 0.35 })
    );
    moonOrbit.rotation.x = Math.PI * 0.42;
    satelliteGroup.add(planet, moonOrbit, moon);
    avatarRoot.add(satelliteGroup);

    const basePixelRatio = Math.min(window.devicePixelRatio, 1.5);
    let currentPixelRatio = basePixelRatio;

    const onResize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(currentPixelRatio);
    };
    window.addEventListener("resize", onResize);
    onResize();

    const pointerTarget = { x: 0, y: 0 };
    let hovered = false;
    canvas.addEventListener("pointerenter", () => {
      hovered = true;
    });
    canvas.addEventListener("pointerleave", () => {
      hovered = false;
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!hovered) return;
      const rect = canvas.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      pointerTarget.x = nx * 0.42;
      pointerTarget.y = ny * 0.22;
    });

    const clock = new THREE.Clock();
    let inView = true;
    let isScrolling = false;
    let scrollTimeoutId;

    const endScroll = () => {
      isScrolling = false;
      currentPixelRatio = basePixelRatio;
      renderer.setPixelRatio(currentPixelRatio);
    };

    const onScrollActivity = () => {
      isScrolling = true;
      currentPixelRatio = 1;
      renderer.setPixelRatio(currentPixelRatio);
      if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
      scrollTimeoutId = setTimeout(endScroll, 220);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.06 }
    );
    if (heroSection) observer.observe(heroSection);

    const tick = () => {
      requestAnimationFrame(tick);
      if (!inView || isScrolling) return;

      const elapsed = clock.getElapsedTime();
      const baseY = Math.sin(elapsed * 0.7) * 0.06;
      avatarRoot.rotation.y += (pointerTarget.x + elapsed * 0.12 - avatarRoot.rotation.y) * 0.06;
      avatarRoot.rotation.x +=
        ((hovered ? pointerTarget.y : Math.sin(elapsed * 0.45) * 0.06) - avatarRoot.rotation.x) * 0.08;
      avatarRoot.position.y = baseY;
      ringA.rotation.z += 0.003;
      ringB.rotation.z -= 0.0024;
      halo.scale.setScalar(1 + Math.sin(elapsed * 1.45) * 0.03);
      electronOrbits.forEach((orbit) => {
        orbit.pivot.rotation.y += orbit.speed * 0.013;
      });
      satelliteGroup.rotation.y += 0.004;
      moon.position.set(
        Math.cos(elapsed * 1.3) * 0.6,
        Math.sin(elapsed * 1.3) * 0.13,
        Math.sin(elapsed * 1.3) * 0.24
      );

      renderer.render(scene, camera);
    };
    tick();

    window.addEventListener("scroll", onScrollActivity, { passive: true });
    window.addEventListener("wheel", onScrollActivity, { passive: true });
    window.addEventListener("touchmove", onScrollActivity, { passive: true });
  } catch (error) {
    console.warn("Three.js failed to load. Portfolio media still available.", error);
  }
};

initThreeHero();
