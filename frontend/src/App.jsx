import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createInterests } from "./api";
import HeartbeatBar from "./components/HeartbeatBar";
import "./App.css";

const INITIAL = {
  householdMembers: 1,
  timeOutdoors: "",
  occupation: "",
  animalContact: null,
  animalTypes: [],
  housingAndAC: "",
  hobbies: [],
};

const OUTDOOR_OPTIONS = [
  { value: "Less than 30 min daily", emoji: "🌤️", label: "Under 30 min" },
  { value: "30 min – 1 hour daily", emoji: "🚶", label: "30 min – 1 hr" },
  { value: "1-2 hours daily", emoji: "🏃", label: "1–2 hours" },
  { value: "2+ hours daily", emoji: "⛰️", label: "2+ hours" },
];

const HOUSING_OPTIONS = [
  { value: "AC", emoji: "❄️", label: "Air conditioning" },
  { value: "Swamp Cooler", emoji: "💨", label: "Swamp cooler" },
  { value: "None", emoji: "🏠", label: "None" },
];

const ANIMAL_OPTIONS = [
  { name: "Sows", emoji: "🐷" },
  { name: "Chickens", emoji: "🐔" },
  { name: "Pigs", emoji: "🐖" },
  { name: "Goats", emoji: "🐐" },
  { name: "Horses", emoji: "🐴" },
  { name: "Cats", emoji: "🐱" },
  { name: "Dogs", emoji: "🐕" },
];

const HOBBY_OPTIONS = [
  "Hiking",
  "Gardening",
  "Reading",
  "Sports",
  "Cooking",
  "Music",
  "Yoga",
  "Swimming",
  "Travel",
  "Gaming",
];

const slide = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
  transition: { duration: 0.28, ease: "easeOut" },
};

function buildSteps(animalContact) {
  const steps = [
    "welcome",
    "household",
    "outdoors",
    "occupation",
    "animalContact",
  ];
  if (animalContact === true) {
    steps.push("animalTypes");
  }
  steps.push("housing", "hobbies", "review");
  return steps;
}

function ProgressBar({ step, total }) {
  return (
    <div className="progress" aria-label={`Step ${step + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            "progress__dot",
            i < step && "progress__dot--done",
            i === step && "progress__dot--active",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </div>
  );
}

function StepShell({ stepIndex, total, title, hint, children, nav }) {
  return (
    <motion.div className="card" key={title} {...slide}>
      <p className="card__step-label">
        Step {stepIndex + 1} of {total} · ~10 sec
      </p>
      <h2 className="card__title">{title}</h2>
      <p className="card__hint">{hint}</p>
      <div className="card__body">{children}</div>
      <div className="nav">{nav}</div>
    </motion.div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(null);
  const [pulseKey, setPulseKey] = useState(0);

  const steps = useMemo(() => buildSteps(form.animalContact), [form.animalContact]);
  const stepId = steps[step];
  const isSuccess = step >= steps.length;

  const canNext = useMemo(() => {
    switch (stepId) {
      case "welcome":
        return true;
      case "household":
        return form.householdMembers >= 0;
      case "outdoors":
        return Boolean(form.timeOutdoors);
      case "occupation":
        return form.occupation.trim().length > 0;
      case "animalContact":
        return form.animalContact !== null;
      case "animalTypes":
        return form.animalTypes.length > 0;
      case "housing":
        return Boolean(form.housingAndAC);
      case "hobbies":
        return form.hobbies.length > 0;
      case "review":
        return true;
      default:
        return false;
    }
  }, [stepId, form]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleInList = (field, value) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((item) => item !== value)
        : [...f[field], value],
    }));
  };

  const goNext = () => {
    setError("");
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    setError("");
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setPulseKey((k) => k + 1);
    setSubmitting(true);
    setError("");
    try {
      const result = await createInterests({
        householdMembers: form.householdMembers,
        timeOutdoors: form.timeOutdoors,
        occupation: form.occupation.trim(),
        animalContact: form.animalContact,
        animalTypes: form.animalContact ? form.animalTypes : [],
        housingAndAC: form.housingAndAC,
        hobbies: form.hobbies,
      });
      if (!result.interests?.id) {
        throw new Error("Save failed — no id returned from API");
      }
      setSavedId(result.interests.id);
      setStep(steps.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const nav = (primaryLabel = "Continue", onPrimary = goNext, primaryDisabled = !canNext) => (
    <>
      {step > 0 && !isSuccess && (
        <button type="button" className="btn btn--ghost" onClick={goBack}>
          Back
        </button>
      )}
      <button
        type="button"
        className="btn btn--primary"
        onClick={onPrimary}
        disabled={primaryDisabled}
      >
        {primaryLabel}
      </button>
    </>
  );

  const renderStep = () => {
    if (isSuccess) {
      return (
        <motion.div className="card success" key="success" {...slide}>
          <div className="pulse-ring" />
          <div className="success__icon">✓</div>
          <h2 className="card__title">Profile saved</h2>
          <p className="card__hint">
            Your health interests were submitted securely.
            {savedId && (
              <>
                <br />
                <small>Reference: {savedId}</small>
              </>
            )}
          </p>
          <button
            type="button"
            className="btn btn--primary"
            style={{ maxWidth: "100%", marginTop: "1rem" }}
            onClick={() => {
              setForm(INITIAL);
              setSavedId(null);
              setStep(0);
            }}
          >
            Start another profile
          </button>
        </motion.div>
      );
    }

    const shell = (title, hint, children, navButtons) => (
      <StepShell
        stepIndex={step}
        total={steps.length}
        title={title}
        hint={hint}
        nav={navButtons}
      >
        {children}
      </StepShell>
    );

    switch (stepId) {
      case "welcome":
        return shell(
          "Your health profile",
          "Quick questions to personalize pandemic risk insights.",
          <div className="welcome-hero">
            <div className="pulse-ring" style={{ width: 56, height: 56 }} />
            <p>
              This takes about one minute. One tap per screen — designed for
              busy healthcare workflows.
            </p>
          </div>,
          nav("Get started"),
        );

      case "household":
        return shell(
          "Household size",
          "How many people live in your home?",
          <div className="number-control">
            <button
              type="button"
              className="number-control__btn"
              aria-label="Decrease"
              onClick={() =>
                update({
                  householdMembers: Math.max(0, form.householdMembers - 1),
                })
              }
            >
              −
            </button>
            <span className="number-control__value">{form.householdMembers}</span>
            <button
              type="button"
              className="number-control__btn"
              aria-label="Increase"
              onClick={() =>
                update({ householdMembers: form.householdMembers + 1 })
              }
            >
              +
            </button>
          </div>,
          nav(),
        );

      case "outdoors":
        return shell(
          "Time outdoors",
          "Average daily time outside.",
          <div className="option-grid">
            {OUTDOOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`option-card ${
                  form.timeOutdoors === opt.value ? "option-card--selected" : ""
                }`}
                onClick={() => update({ timeOutdoors: opt.value })}
              >
                <span className="option-card__emoji">{opt.emoji}</span>
                <span className="option-card__label">{opt.label}</span>
              </button>
            ))}
          </div>,
          nav(),
        );

      case "occupation":
        return shell(
          "Occupation",
          "Your primary role or field.",
          <input
            className="text-input"
            type="text"
            placeholder="e.g. Nurse, Teacher, Student"
            value={form.occupation}
            onChange={(e) => update({ occupation: e.target.value })}
            autoFocus
          />,
          nav(),
        );

      case "animalContact":
        return shell(
          "Animal contact",
          "Regular contact with pets or livestock?",
          <div className="option-grid option-grid--2">
            {[
              { value: true, emoji: "🐾", label: "Yes" },
              { value: false, emoji: "🚫", label: "No" },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                className={`option-card ${
                  form.animalContact === opt.value ? "option-card--selected" : ""
                }`}
                onClick={() =>
                  update({
                    animalContact: opt.value,
                    animalTypes: opt.value ? form.animalTypes : [],
                  })
                }
              >
                <span className="option-card__emoji">{opt.emoji}</span>
                <span className="option-card__label">{opt.label}</span>
              </button>
            ))}
          </div>,
          nav(),
        );

      case "animalTypes":
        return shell(
          "Which animals?",
          "Select all animals you have regular contact with.",
          <div className="chip-grid">
            {ANIMAL_OPTIONS.map((animal) => (
              <button
                key={animal.name}
                type="button"
                className={`chip chip--animal ${
                  form.animalTypes.includes(animal.name) ? "chip--selected" : ""
                }`}
                onClick={() => toggleInList("animalTypes", animal.name)}
              >
                <span className="chip__emoji">{animal.emoji}</span>
                {animal.name}
              </button>
            ))}
          </div>,
          nav(),
        );

      case "housing":
        return shell(
          "Home cooling",
          "Primary cooling at your residence.",
          <div className="option-grid">
            {HOUSING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`option-card ${
                  form.housingAndAC === opt.value ? "option-card--selected" : ""
                }`}
                onClick={() => update({ housingAndAC: opt.value })}
              >
                <span className="option-card__emoji">{opt.emoji}</span>
                <span className="option-card__label">{opt.label}</span>
              </button>
            ))}
          </div>,
          nav(),
        );

      case "hobbies":
        return shell(
          "Hobbies",
          "Pick all that apply.",
          <div className="chip-grid">
            {HOBBY_OPTIONS.map((hobby) => (
              <button
                key={hobby}
                type="button"
                className={`chip ${
                  form.hobbies.includes(hobby) ? "chip--selected" : ""
                }`}
                onClick={() => toggleInList("hobbies", hobby)}
              >
                {hobby}
              </button>
            ))}
          </div>,
          nav(),
        );

      case "review":
        return shell(
          "Review & submit",
          "Confirm your answers.",
          <>
            {error && <div className="error-banner">{error}</div>}
            <ul className="review-list">
              <li>
                <strong>Household</strong>
                <span>{form.householdMembers} people</span>
              </li>
              <li>
                <strong>Outdoors</strong>
                <span>{form.timeOutdoors}</span>
              </li>
              <li>
                <strong>Occupation</strong>
                <span>{form.occupation}</span>
              </li>
              <li>
                <strong>Animals</strong>
                <span>
                  {form.animalContact
                    ? `Yes — ${form.animalTypes.join(", ")}`
                    : "No"}
                </span>
              </li>
              <li>
                <strong>Cooling</strong>
                <span>{form.housingAndAC}</span>
              </li>
              <li>
                <strong>Hobbies</strong>
                <span>{form.hobbies.join(", ")}</span>
              </li>
            </ul>
          </>,
          nav(submitting ? "Saving…" : "Submit profile", handleSubmit, submitting),
        );

      default:
        return null;
    }
  };

  const progressStep = Math.min(step, steps.length - 1);

  return (
    <div className="app">
      <div className="app__bg" aria-hidden>
        <div className="app__orb app__orb--1" />
        <div className="app__orb app__orb--2" />
      </div>

      <div className="app__center">
        <div className="app__content">
          {!isSuccess && (
            <header className="header">
              <div className="header__brand">
                <div className="header__icon" aria-hidden>
                  ♥
                </div>
                <div>
                  <p className="header__title">Epi-Guard Profile</p>
                  <p className="header__subtitle">
                    Pandemic prevention · Health interests
                  </p>
                </div>
              </div>
              <ProgressBar step={progressStep} total={steps.length} />
            </header>
          )}

          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>

        <HeartbeatBar pulseKey={pulseKey} />
      </div>
    </div>
  );
}
