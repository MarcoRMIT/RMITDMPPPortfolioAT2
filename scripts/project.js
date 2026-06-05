import {
  findProjectBySlug,
  getCoverSrc,
  getProjectMedia,
  getYouTubeId,
  isVideoFile,
  isYouTubeProject,
  splitDescription,
  toAssetPath,
} from "./shared.js?v=20260605b";

const root = document.getElementById("project-root");
const backLink = document.getElementById("project-back");
const slug = new URLSearchParams(window.location.search).get("slug");

const createImageLightbox = () => {
  const overlay = document.createElement("div");
  overlay.className = "image-lightbox";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="image-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Expanded image view">
      <img class="image-lightbox__img" alt="" />
    </div>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector(".image-lightbox__img");
  const close = () => {
    overlay.hidden = true;
    overlay.classList.remove("is-open");
    img.src = "";
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) close();
  });

  return (src, alt = "Expanded project image") => {
    img.src = src;
    img.alt = alt;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
  };
};

const openImageLightbox = createImageLightbox();

const makeDescriptionBlocks = (project) => {
  const details = document.createElement("div");
  details.className = "project-page__description";

  const paragraphs = splitDescription(project.description);
  if (!paragraphs.length) {
    const fallback = document.createElement("p");
    fallback.textContent = "Add a project description in portfolio.config.js.";
    details.appendChild(fallback);
    return details;
  }

  paragraphs.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    details.appendChild(p);
  });

  return details;
};

const makeGalleryFigure = (project, { folder, file }, openLightbox) => {
  const item = document.createElement("figure");
  item.className = "project-page__media";

  if (isVideoFile(file)) {
    const video = document.createElement("video");
    video.src = toAssetPath(folder, file);
    video.controls = true;
    video.controlsList = "nodownload noplaybackrate";
    video.preload = "metadata";
    video.playsInline = true;
    item.appendChild(video);
    return item;
  }

  const img = document.createElement("img");
  img.src = toAssetPath(folder, file);
  img.alt = `${project.title} detail`;
  img.loading = "lazy";
  img.decoding = "async";
  img.className = "project-page__zoomable";
  img.addEventListener("click", () => openLightbox(img.src, img.alt));
  item.appendChild(img);
  return item;
};

const makeYouTubePlayer = (project) => {
  const wrap = document.createElement("div");
  wrap.className = "youtube-player";

  const videoId = getYouTubeId(project.youtubeUrl);

  if (!videoId) {
    wrap.innerHTML = `
      <div class="youtube-player__placeholder">
        <p><strong>YouTube video coming soon</strong></p>
        <p>Replace <code>youtubeUrl</code> in portfolio.config.js for <em>${project.title}</em>.</p>
        <p class="youtube-player__hint">Current placeholder: ${project.youtubeUrl || "not set"}</p>
      </div>
    `;
    return wrap;
  }

  const frameWrap = document.createElement("div");
  frameWrap.className = "youtube-player__frame";

  const playerHost = document.createElement("div");
  playerHost.id = `yt-${project.slug}`;
  playerHost.className = "youtube-player__host";
  frameWrap.appendChild(playerHost);

  const controls = document.createElement("div");
  controls.className = "youtube-player__controls";
  controls.innerHTML = `
    <button type="button" class="btn youtube-player__btn youtube-player__btn--icon" data-action="toggle-play" aria-label="Pause video">⏸️</button>
    <button type="button" class="btn youtube-player__btn youtube-player__btn--icon" data-action="toggle-mute" aria-label="Unmute video">🔇</button>
  `;

  const playBtn = controls.querySelector('[data-action="toggle-play"]');
  const muteBtn = controls.querySelector('[data-action="toggle-mute"]');

  const setPlayButton = (playing) => {
    playBtn.textContent = playing ? "⏸️" : "▶️";
    playBtn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
  };

  const setMuteButton = (muted) => {
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-label", muted ? "Unmute video" : "Mute video");
  };

  let player = null;
  let playerReady = null;

  const loadApi = () =>
    new Promise((resolve) => {
      if (window.YT?.Player) {
        resolve();
        return;
      }
      const existing = document.getElementById("youtube-iframe-api");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = () => resolve();
      document.head.appendChild(script);
    });

  const ensurePlayer = async () => {
    if (player) return player;
    if (playerReady) return playerReady;

    playerReady = (async () => {
      await loadApi();
      return new Promise((resolve) => {
        player = new window.YT.Player(playerHost.id, {
          videoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: (event) => {
              event.target.mute();
              setMuteButton(true);
              event.target.playVideo();
              setPlayButton(true);
              resolve(event.target);
            },
            onStateChange: (event) => {
              const { PLAYING, PAUSED, ENDED } = window.YT.PlayerState;
              if (
                event.data === PLAYING ||
                event.data === PAUSED ||
                event.data === ENDED
              ) {
                setPlayButton(event.data === PLAYING);
              }
            },
          },
        });
      });
    })();

    return playerReady;
  };

  controls.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    const ytPlayer = await ensurePlayer();
    if (action === "toggle-play") {
      const state = ytPlayer.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
        setPlayButton(false);
      } else {
        ytPlayer.playVideo();
        setPlayButton(true);
      }
    }
    if (action === "toggle-mute") {
      if (ytPlayer.isMuted()) {
        ytPlayer.unMute();
        setMuteButton(false);
      } else {
        ytPlayer.mute();
        setMuteButton(true);
      }
    }
  });

  ensurePlayer();

  wrap.appendChild(frameWrap);
  wrap.appendChild(controls);
  wrap.appendChild(
      Object.assign(document.createElement("p"), {
        className: "youtube-player__note",
        textContent:
          "",
      })
  );

  return wrap;
};

const renderNotFound = () => {
  document.title = "Project not found | DigiMarc Portfolio";
  root.innerHTML = `
    <div class="project-page__error">
      <h1>Project not found</h1>
      <p>The link may be outdated. Return to the portfolio gallery.</p>
      <a class="btn" href="index.html#categories">Back to portfolio</a>
    </div>
  `;
};

const renderProject = ({ project, category }) => {
  document.title = `${project.title} | DigiMarc Portfolio`;
  if (backLink) {
    backLink.href = `index.html#${category.id}`;
  }

  const header = document.createElement("header");
  header.className = "project-page__header";
  header.innerHTML = `
    <p class="project-page__category">${category.title}</p>
    <h1 class="project-page__title">${project.title}</h1>
  `;

  const content = document.createElement("div");
  content.className = "project-page__content";
  content.appendChild(makeDescriptionBlocks(project));

  const mediaSection = document.createElement("section");
  mediaSection.className = "project-page__gallery-section";
  mediaSection.setAttribute("aria-label", "Project media");

  if (isYouTubeProject(project)) {
    mediaSection.appendChild(makeYouTubePlayer(project));
  } else if (project.mediaPending) {
    const pending = document.createElement("div");
    pending.className = "project-page__pending";
    pending.innerHTML = `
      <p><strong>Media coming soon</strong></p>
      <p>Add renders to <code>${project.folder}</code> and set a <code>cover</code> filename in portfolio.config.js.</p>
    `;
    mediaSection.appendChild(pending);
  } else {
    const heroSrc = getCoverSrc(project);
    if (heroSrc) {
      const hero = document.createElement("figure");
      hero.className = "project-page__hero";
      const img = document.createElement("img");
      img.src = heroSrc;
      img.alt = `${project.title} hero`;
      img.decoding = "async";
      img.className = "project-page__zoomable";
      img.addEventListener("click", () => openImageLightbox(img.src, img.alt));
      hero.appendChild(img);
      mediaSection.appendChild(hero);
    }
  }

  const gallery = document.createElement("div");
  gallery.className = "project-page__gallery";

  getProjectMedia(project).forEach((entry) => {
    if (project.mediaPending) return;
    const isCoverDuplicate =
      entry.file === project.cover &&
      (!project.assets || entry.folder === project.folder);
    if (isCoverDuplicate && !isYouTubeProject(project)) return;
    gallery.appendChild(makeGalleryFigure(project, entry, openImageLightbox));
  });

  if (gallery.childElementCount) {
    mediaSection.appendChild(gallery);
  }

  root.appendChild(header);
  root.appendChild(content);
  root.appendChild(mediaSection);
};

const match = findProjectBySlug(slug);
if (!match) {
  renderNotFound();
} else {
  renderProject(match);
}
