import { FORMSPREE_ENDPOINT } from "@/data/site";

// One submit path for every form on the site (booking, list signup).
// With a Formspree endpoint configured, posts there and returns "success" or
// "error". Without one (Jah hasn't set one up yet), opens a pre-filled email
// to him and returns "mailto", which the caller answers with <MailtoFallback>
// so a visitor without a mail app still has a guaranteed manual path.
export async function submitForm({ subject, fields, to }) {
  const body = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v || ""}`)
    .join("\n");

  if (!FORMSPREE_ENDPOINT) {
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return { status: "mailto", body };
  }

  try {
    const data = new FormData();
    data.append("_subject", subject);
    Object.entries(fields).forEach(([k, v]) => data.append(k, v || ""));
    const res = await fetch(FORMSPREE_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: data });
    return { status: res.ok ? "success" : "error", body };
  } catch {
    return { status: "error", body };
  }
}
