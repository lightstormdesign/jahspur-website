import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { LAYLO_URL, BOOKING_EMAIL, ARTIST_NAME } from "@/data/site";
import { submitForm } from "@/utils/forms";
import { MailtoFallback } from "./MailtoFallback";

const input = "field";

// The list signup, used on Home, Album, and Community. His #1 goal for the
// site is a 5,000-person list, so this appears wherever someone is likely to
// be moved, not only on the Community page.
//
// If he sets up Laylo (intake: "not sure yet"), LAYLO_URL turns this into a
// single button to his Laylo page, same as Sierra's site. Until then it's a
// small native form (name / email / optional phone).
export const SignupForm = ({ cta = "Join the Family", source = "website", className = "" }) => {
  const [fields, setFields] = useState({ name: "", email: "", phone: "" });
  const [state, setState] = useState({ status: "idle", body: "" });
  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));
  const subject = `New list signup (${source}): ${fields.name || fields.email}`;

  if (LAYLO_URL) {
    return (
      <a
        href={LAYLO_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="signup-laylo-link"
        className={`inline-flex items-center gap-2 rounded-full bg-[var(--js-gold)] px-7 py-3 font-body text-sm font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)] ${className}`}
      >
        {cta} <ArrowUpRight size={15} />
      </a>
    );
  }

  if (state.status === "success" || state.status === "mailto") {
    if (state.status === "mailto") {
      return (
        <MailtoFallback
          email={BOOKING_EMAIL}
          subject={subject}
          body={state.body}
          onReset={() => setState({ status: "idle", body: "" })}
        />
      );
    }
    return (
      <p data-testid="signup-success" className={`font-accent text-xl italic text-[var(--js-gold-light)] ${className}`}>
        Welcome to the family. You'll hear from {ARTIST_NAME} soon.
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <MailtoFallback email={BOOKING_EMAIL} subject={subject} body={state.body} onReset={() => setState({ status: "idle", body: "" })} />
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setState({ status: "submitting", body: "" });
    const res = await submitForm({
      subject,
      to: BOOKING_EMAIL,
      fields: { Name: fields.name, Email: fields.email, Phone: fields.phone, Source: source },
    });
    setState(res);
  };

  return (
    <form onSubmit={onSubmit} data-testid="signup-form" className={`grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2 ${className}`}>
      <input required placeholder="First name*" autoComplete="given-name" value={fields.name} onChange={set("name")} className={input} />
      <input required type="email" placeholder="Email*" autoComplete="email" value={fields.email} onChange={set("email")} className={input} />
      <input type="tel" placeholder="Phone, for texts (optional)" autoComplete="tel" value={fields.phone} onChange={set("phone")} className={`${input} sm:col-span-2`} />
      <button
        type="submit"
        disabled={state.status === "submitting"}
        className="mt-1 rounded-full bg-[var(--js-gold)] px-7 py-3.5 font-body text-[15px] font-medium text-[var(--js-black)] transition-colors hover:bg-[var(--js-gold-light)] disabled:opacity-60 sm:col-span-2"
      >
        {state.status === "submitting" ? "Sending…" : cta}
      </button>
    </form>
  );
};
