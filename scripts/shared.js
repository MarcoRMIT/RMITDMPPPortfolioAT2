import { portfolioData } from "./portfolio.config.js?v=20260605a";

export { portfolioData };

export const toAssetPath = (folder, file) =>
  encodeURI(`./${folder}/${file}`).replace(/#/g, "%23");

export const isVideoFile = (file) => /\.(mp4|webm|mov)$/i.test(file);

export const isYouTubeProject = (project) =>
  project.type === "youtube" || Boolean(project.youtubeUrl);

export const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (match) return match[1];
  if (/^PLACEHOLDER_/i.test(url)) return null;
  return null;
};

export const getYouTubeEmbedUrl = (url, { autoplay = false } = {}) => {
  const id = getYouTubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    controls: "0",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
};

export const findProjectBySlug = (slug) => {
  if (!slug) return null;
  for (const category of portfolioData.categories) {
    const project = category.projects.find((entry) => entry.slug === slug);
    if (project) return { project, category };
  }
  return null;
};

export const getProjectMedia = (project) => {
  if (project.assets?.length) {
    return project.assets.map(({ folder, file }) => ({ folder, file }));
  }

  const folder = project.folder;
  const files = [];
  if (project.cover) files.push(project.cover);
  (project.gallery || []).forEach((file) => {
    if (file && file !== project.cover) files.push(file);
  });

  return files.map((file) => ({ folder, file }));
};

export const getCoverSrc = (project) => {
  if (project.mediaPending || !project.cover) return null;
  if (isYouTubeProject(project) && project.cover) {
    return toAssetPath(project.folder, project.cover);
  }
  if (isYouTubeProject(project)) return null;
  return toAssetPath(project.folder, project.cover);
};

export const projectPageUrl = (slug) => `project.html?slug=${encodeURIComponent(slug)}`;

export const splitDescription = (description) =>
  (description || "").trim().split(/\n\s*\n/).filter(Boolean);
