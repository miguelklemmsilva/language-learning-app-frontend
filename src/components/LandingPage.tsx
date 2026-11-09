import { useNavigate } from "react-router-dom";
import { LANGUAGES } from "../constants/languages";
import { PrimaryButton } from "./ui/PrimaryButton";
import { Icon, IconName } from "./ui/Icon";

const FEATURES: { title: string; icon: IconName; description: string }[] = [
  {
    title: "Translation",
    icon: "language",
    description: "Translate sentences, check hints, and decide when an answer is close enough.",
  },
  {
    title: "Listening",
    icon: "headset",
    description: "Hear a sentence in your chosen accent and type what you heard.",
  },
  {
    title: "Speaking",
    icon: "mic",
    description: "Say the sentence and get scores for accuracy, fluency, and completeness.",
  },
  {
    title: "Your words",
    icon: "book",
    description: "Add words one at a time or from a dictionary, then review them when they are due.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <section className="landing-card">
        <h1>PolyBara</h1>
        <p>
          Practice the language you are studying with translation, listening, and speaking. Keep a word list,
          and come back when those words are ready to review.
        </p>
        <PrimaryButton label="Get started" onClick={() => navigate("/sign-in")} />
      </section>
      <section className="landing-card">
        <h2>Languages</h2>
        <div className="wrap">
          {LANGUAGES.map((language) => (
            <span key={language.language} className="chip">
              <span aria-hidden="true">{language.flag}</span>
              {language.label}
            </span>
          ))}
        </div>
      </section>
      <section className="landing-card">
        <h2>Practice</h2>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feature-card">
              <Icon name={feature.icon} size={28} />
              <h3>{feature.title}</h3>
              <p className="muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-card">
        <h2>Ready to practice?</h2>
        <PrimaryButton label="Begin" onClick={() => navigate("/sign-in")} />
      </section>
    </div>
  );
}
