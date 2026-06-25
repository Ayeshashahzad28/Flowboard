function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, color, size = 28, title, ring }) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: color || "var(--accent)",
        boxShadow: ring
          ? `0 0 0 2px var(--surface), 0 0 0 4px ${ring}`
          : "none",
      }}
      title={title || name}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
