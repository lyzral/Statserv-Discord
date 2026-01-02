function formatNumber(n, sepMode) {
  const s = Math.trunc(Number(n) || 0).toString();
  if (sepMode === "none") return s;

  const sep =
    sepMode === "space" ? " " :
    sepMode === "comma" ? "," :
    sepMode === "dot" ? "." :
    sepMode === "apostrophe" ? "'" :
    "";

  if (!sep) return s;

  let out = "";
  let c = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    out = s[i] + out;
    c++;
    if (c === 3 && i !== 0) {
      out = sep + out;
      c = 0;
    }
  }
  return out;
}

module.exports = { formatNumber };
