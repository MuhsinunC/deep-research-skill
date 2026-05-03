// Topic-to-slug helper. Produces filesystem-safe identifiers used in
// research_report filenames + tmux session names + log filenames.

export function slugify(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
