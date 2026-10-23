"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  Download,
  FileText,
  GraduationCap,
  Leaf,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  dateLabel,
  emptyEducation,
  emptyExperience,
  emptyResume,
  Resume,
  sample,
  validate,
} from "@/lib/resume";

const steps = [
  { title: "Dados pessoais", subtitle: "Vamos nos conhecer", icon: UserRound },
  {
    title: "Experiência",
    subtitle: "Sua trajetória profissional",
    icon: BriefcaseBusiness,
  },
  { title: "Formação", subtitle: "O que você aprendeu", icon: GraduationCap },
  { title: "Habilidades", subtitle: "Seus pontos fortes", icon: Sparkles },
  {
    title: "Revisar e baixar",
    subtitle: "Pronto para o próximo passo",
    icon: FileText,
  },
];
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const KEY = "memprega-resume-v1";
type Credentials = { id: string; token: string };

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder = "",
  maxLength = 160,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <span className="required"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </label>
  );
}

function Preview({ data }: { data: Resume }) {
  return (
    <article className="resume-sheet" aria-label="Prévia do currículo">
      <div className="resume-top">
        <h2>{data.name || "Seu nome completo"}</h2>
        <p className="resume-role">{data.title || "Seu próximo cargo"}</p>
        <p className="resume-contact">
          {[data.email, data.phone, data.city].filter(Boolean).join(" · ") ||
            "E-mail · Telefone · Cidade"}
        </p>
        {data.linkedin && <p className="resume-contact">{data.linkedin}</p>}
        {data.portfolio && <p className="resume-contact">{data.portfolio}</p>}
      </div>
      {data.summary && (
        <section>
          <h3>Resumo profissional</h3>
          <p>{data.summary}</p>
        </section>
      )}
      {data.experiences.length > 0 && (
        <section>
          <h3>Experiência profissional</h3>
          {data.experiences.map((item, i) => (
            <div className="resume-entry" key={i}>
              <h4>{item.role || "Cargo"}</h4>
              <p>
                {item.company || "Empresa"}{" "}
                <span>
                  · {dateLabel(item.start)} —{" "}
                  {item.current ? "Atual" : dateLabel(item.end)}
                </span>
              </p>
              <p>{item.description}</p>
            </div>
          ))}
        </section>
      )}
      {data.education.length > 0 && (
        <section>
          <h3>Formação acadêmica</h3>
          {data.education.map((item, i) => (
            <div className="resume-entry" key={i}>
              <h4>{item.course || "Curso"}</h4>
              <p>
                {item.institution || "Instituição"} · {item.level}
              </p>
              <p>
                {dateLabel(item.start)} —{" "}
                {item.current ? "Em andamento" : dateLabel(item.end)}
              </p>
            </div>
          ))}
        </section>
      )}
      {data.skills.length > 0 && (
        <section>
          <h3>Habilidades</h3>
          <p>{data.skills.join(" · ")}</p>
        </section>
      )}
      {data.languages.length > 0 && (
        <section>
          <h3>Idiomas</h3>
          <p>
            {data.languages.map((v) => `${v.name} — ${v.level}`).join(" · ")}
          </p>
        </section>
      )}
      {!data.summary &&
        !data.experiences.length &&
        !data.education.length &&
        !data.skills.length && (
          <div className="preview-empty">
            <FileText size={30} strokeWidth={1.3} />
            <p>Sua história começa aqui.</p>
            <span>
              Preencha o formulário e veja seu currículo ganhar forma.
            </span>
          </div>
        )}
    </article>
  );
}

export default function Home() {
  const [data, setData] = useState<Resume>(emptyResume);
  const [step, setStep] = useState(0);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("Rascunho neste navegador");
  const [skill, setSkill] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (
        saved?.data &&
        typeof saved.data.name === "string" &&
        ["experiences", "education", "skills", "languages"].every((k) =>
          Array.isArray(saved.data[k]),
        )
      ) {
        setData({ ...emptyResume, ...saved.data });
        if (saved.credentials?.id && saved.credentials?.token)
          setCredentials(saved.credentials);
      }
    } catch {
      setDraft("Não foi possível recuperar o rascunho");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify({ data, credentials }));
        setDraft("Rascunho salvo neste navegador");
      } catch {
        setDraft("Armazenamento local indisponível");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [data, credentials, ready]);
  function update<K extends keyof Resume>(key: K, value: Resume[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setMessage("");
    setError("");
  }
  function move(next: number) {
    setError("");
    setStep(next);
    setTimeout(() => heading.current?.focus(), 0);
  }
  function next() {
    if (!form.current?.reportValidity()) return;
    const issue = validate(data);
    if (issue && issue.step <= step) {
      setError(issue.message);
      if (issue.step !== step) move(issue.step);
      return;
    }
    move(Math.min(4, step + 1));
  }
  async function request(path: string, init: RequestInit = {}) {
    const response = await fetch(`${API}/api/v1/resumes${path}`, {
      ...init,
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      if (response.status === 422)
        throw new Error(
          "Confira os campos, os links e os limites de tamanho antes de salvar.",
        );
      if (response.status === 404 || response.status === 401)
        throw new Error(
          "O currículo salvo não está mais disponível. Use ‘Salvar como novo’ para preservar este rascunho.",
        );
      throw new Error(
        "Não foi possível concluir. Tente novamente em instantes.",
      );
    }
    return response;
  }
  async function save(download: boolean, asNew = false) {
    const issue = validate(data);
    if (issue) {
      move(issue.step);
      setError(issue.message);
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let access = asNew ? null : credentials;
      if (access)
        await request(`/${access.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access.token}`,
          },
          body: JSON.stringify(data),
        });
      else {
        const response = await request("", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        access = { id: result.id, token: result.token };
        setCredentials(access);
      }
      if (download) {
        const response = await request(`/${access.id}/pdf`, {
          headers: { Authorization: `Bearer ${access.token}` },
        });
        const url = URL.createObjectURL(await response.blob());
        const a = document.createElement("a");
        a.href = url;
        a.download = "meu-curriculo.pdf";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        setMessage("Currículo salvo. Seu PDF está pronto!");
      } else setMessage("Currículo salvo com sucesso no Me Emprega.");
    } catch (e) {
      setError(
        e instanceof TypeError || e instanceof DOMException
          ? "Não foi possível conectar ao servidor. Seu rascunho continua neste navegador. Tente novamente."
          : (e as Error).message,
      );
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    if (
      !window.confirm(
        "Apagar este currículo e o rascunho deste navegador? Esta ação não pode ser desfeita.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      if (credentials)
        await request(`/${credentials.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${credentials.token}` },
        });
      localStorage.removeItem(KEY);
      setCredentials(null);
      setData(emptyResume);
      setStep(0);
      setMessage("Currículo apagado.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function addSkill() {
    const value = skill.trim();
    if (value && data.skills.length < 40 && !data.skills.includes(value))
      update("skills", [...data.skills, value]);
    setSkill("");
  }

  return (
    <>
      <header className="header">
        <a className="brand" href="/" aria-label="Me Emprega início">
          <span className="brand-mark">
            <Leaf size={24} />
          </span>
          me<span>emprega</span>
          <span className="brand-dot">.</span>
        </a>
        <span className="header-divider" />
        <span className="header-title">Construtor de currículo</span>
        <div className="header-right">
          <ShieldCheck size={16} />
          <span>Seu próximo passo começa aqui</span>
        </div>
      </header>
      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-intro">
            <span className="eyebrow">SEU FUTURO, POR ESCRITO</span>
            <h1>
              Uma boa história
              <br />
              merece um bom
              <br />
              <em>currículo.</em>
            </h1>
            <p>
              Organize sua trajetória e abra as portas para novas oportunidades.
            </p>
          </div>
          <nav aria-label="Etapas do currículo">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  className={`step ${step === index ? "active" : ""}`}
                  aria-current={step === index ? "step" : undefined}
                  onClick={() => move(index)}
                  disabled={busy}
                >
                  <span className="step-icon">
                    {index < step ? <Check size={19} /> : <Icon size={19} />}
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </span>
                  {step === index && <span className="active-dot" />}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-tip">
            <Sparkles size={20} />
            <strong>Você tem muito a oferecer.</strong>
            <p>
              Vale incluir projetos, trabalho voluntário e experiências
              informais.
            </p>
          </div>
          <div className="sidebar-bottom">Feito para quem quer ir além.</div>
        </aside>
        <section className="editor">
          <div className="editor-top">
            <span>MEU CURRÍCULO</span>
            <span className="saved">
              <CheckCheck size={15} />
              {draft}
            </span>
          </div>
          <div className="section-heading">
            <span className="step-count">
              ETAPA {String(step + 1).padStart(2, "0")} DE 05
            </span>
            <h2 ref={heading} tabIndex={-1}>
              {
                [
                  "Primeiro, vamos nos conhecer.",
                  "Toda experiência conta.",
                  "Conhecimento abre caminhos.",
                  "O que faz você se destacar?",
                  "Sua próxima oportunidade começa aqui.",
                ][step]
              }
            </h2>
            <p>
              {
                [
                  "Como os recrutadores podem encontrar você?",
                  "Conte onde você trabalhou e o que realizou.",
                  "Adicione seus estudos, cursos técnicos e formação.",
                  "Destaque suas habilidades e os idiomas que você fala.",
                  "Confira suas informações e baixe um PDF pronto para enviar.",
                ][step]
              }
            </p>
          </div>
          <form
            ref={form}
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 4) next();
              else void save(true);
            }}
          >
            <fieldset disabled={busy || !ready}>
              {step === 0 && (
                <>
                  <div className="form-section-title">
                    <UserRound size={18} />
                    <h3>Informações pessoais</h3>
                    <span>* Campos obrigatórios</span>
                  </div>
                  <div className="fields">
                    <Field
                      label="Nome completo"
                      required
                      value={data.name}
                      onChange={(v) => update("name", v)}
                      placeholder="Como você quer ser chamado?"
                    />
                    <Field
                      label="Cargo desejado"
                      required
                      value={data.title}
                      onChange={(v) => update("title", v)}
                      placeholder="Ex.: Analista de atendimento"
                    />
                    <div className="two-columns">
                      <Field
                        label="E-mail"
                        type="email"
                        required
                        maxLength={254}
                        value={data.email}
                        onChange={(v) => update("email", v)}
                        placeholder="voce@exemplo.com"
                      />
                      <Field
                        label="Telefone"
                        type="tel"
                        required
                        maxLength={30}
                        value={data.phone}
                        onChange={(v) => update("phone", v)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <Field
                      label="Cidade e estado"
                      required
                      maxLength={120}
                      value={data.city}
                      onChange={(v) => update("city", v)}
                      placeholder="Ex.: São Paulo, SP"
                    />
                    <div className="two-columns">
                      <Field
                        label="LinkedIn (opcional)"
                        type="url"
                        maxLength={300}
                        value={data.linkedin}
                        onChange={(v) => update("linkedin", v)}
                        placeholder="https://linkedin.com/in/voce"
                      />
                      <Field
                        label="Portfólio (opcional)"
                        type="url"
                        maxLength={300}
                        value={data.portfolio}
                        onChange={(v) => update("portfolio", v)}
                        placeholder="https://seusite.com"
                      />
                    </div>
                    <label className="field">
                      <span>
                        Resumo profissional <small>(opcional)</small>
                      </span>
                      <textarea
                        maxLength={4000}
                        rows={4}
                        value={data.summary}
                        onChange={(e) => update("summary", e.target.value)}
                        placeholder="Conte um pouco sobre você, suas experiências e o que busca na sua próxima oportunidade."
                      />
                      <span className="field-help">
                        Uma boa apresentação faz diferença. Use de 3 a 5 linhas.
                        <span>{data.summary.length}/4000</span>
                      </span>
                    </label>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  {data.experiences.length === 0 && (
                    <div className="empty-state">
                      <BriefcaseBusiness />
                      <h3>Sua trajetória tem valor</h3>
                      <p>
                        Adicione empregos, estágios ou atividades voluntárias.
                        Buscando o primeiro emprego? Você pode continuar sem
                        preencher.
                      </p>
                    </div>
                  )}
                  {data.experiences.map((item, i) => (
                    <div className="entry-card" key={i}>
                      <div className="entry-heading">
                        <h3>Experiência {i + 1}</h3>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Remover experiência ${i + 1}`}
                          onClick={() =>
                            update(
                              "experiences",
                              data.experiences.filter((_, j) => j !== i),
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <div className="fields">
                        {(["role", "company"] as const).map((key, j) => (
                          <Field
                            key={key}
                            required
                            label={j ? "Empresa" : "Cargo"}
                            value={item[key]}
                            onChange={(v) =>
                              update(
                                "experiences",
                                data.experiences.map((x, n) =>
                                  n === i ? { ...x, [key]: v } : x,
                                ),
                              )
                            }
                          />
                        ))}
                        <div className="two-columns">
                          <Field
                            required
                            type="month"
                            label="Início"
                            value={item.start}
                            onChange={(v) =>
                              update(
                                "experiences",
                                data.experiences.map((x, n) =>
                                  n === i ? { ...x, start: v } : x,
                                ),
                              )
                            }
                          />
                          {!item.current && (
                            <Field
                              required
                              type="month"
                              label="Término"
                              value={item.end}
                              onChange={(v) =>
                                update(
                                  "experiences",
                                  data.experiences.map((x, n) =>
                                    n === i ? { ...x, end: v } : x,
                                  ),
                                )
                              }
                            />
                          )}
                        </div>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={item.current}
                            onChange={(e) =>
                              update(
                                "experiences",
                                data.experiences.map((x, n) =>
                                  n === i
                                    ? {
                                        ...x,
                                        current: e.target.checked,
                                        end: "",
                                      }
                                    : x,
                                ),
                              )
                            }
                          />
                          Trabalho aqui atualmente
                        </label>
                        <label className="field">
                          <span>Atividades e conquistas</span>
                          <textarea
                            rows={4}
                            maxLength={4000}
                            value={item.description}
                            onChange={(e) =>
                              update(
                                "experiences",
                                data.experiences.map((x, n) =>
                                  n === i
                                    ? { ...x, description: e.target.value }
                                    : x,
                                ),
                              )
                            }
                            placeholder="O que você fez? Quais resultados alcançou?"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-button"
                    disabled={data.experiences.length >= 20}
                    onClick={() =>
                      update("experiences", [
                        ...data.experiences,
                        { ...emptyExperience },
                      ])
                    }
                  >
                    <Plus size={18} />
                    Adicionar experiência
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  {!data.education.length && (
                    <div className="empty-state">
                      <GraduationCap />
                      <h3>Aprender faz parte da sua história</h3>
                      <p>
                        Inclua ensino médio, graduação ou cursos. Estudos em
                        andamento também contam.
                      </p>
                    </div>
                  )}
                  {data.education.map((item, i) => (
                    <div className="entry-card" key={i}>
                      <div className="entry-heading">
                        <h3>Formação {i + 1}</h3>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Remover formação ${i + 1}`}
                          onClick={() =>
                            update(
                              "education",
                              data.education.filter((_, j) => j !== i),
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <div className="fields">
                        {(["course", "institution"] as const).map((key, j) => (
                          <Field
                            key={key}
                            required
                            label={j ? "Instituição" : "Curso"}
                            value={item[key]}
                            onChange={(v) =>
                              update(
                                "education",
                                data.education.map((x, n) =>
                                  n === i ? { ...x, [key]: v } : x,
                                ),
                              )
                            }
                          />
                        ))}
                        <label className="field">
                          <span>Nível de formação</span>
                          <select
                            value={item.level}
                            onChange={(e) =>
                              update(
                                "education",
                                data.education.map((x, n) =>
                                  n === i ? { ...x, level: e.target.value } : x,
                                ),
                              )
                            }
                          >
                            {[
                              "Ensino fundamental",
                              "Ensino médio",
                              "Técnico",
                              "Graduação",
                              "Pós-graduação",
                              "Mestrado",
                              "Doutorado",
                              "Curso livre",
                            ].map((v) => (
                              <option key={v}>{v}</option>
                            ))}
                          </select>
                        </label>
                        <div className="two-columns">
                          <Field
                            required
                            type="month"
                            label="Início"
                            value={item.start}
                            onChange={(v) =>
                              update(
                                "education",
                                data.education.map((x, n) =>
                                  n === i ? { ...x, start: v } : x,
                                ),
                              )
                            }
                          />
                          {!item.current && (
                            <Field
                              required
                              type="month"
                              label="Término"
                              value={item.end}
                              onChange={(v) =>
                                update(
                                  "education",
                                  data.education.map((x, n) =>
                                    n === i ? { ...x, end: v } : x,
                                  ),
                                )
                              }
                            />
                          )}
                        </div>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={item.current}
                            onChange={(e) =>
                              update(
                                "education",
                                data.education.map((x, n) =>
                                  n === i
                                    ? {
                                        ...x,
                                        current: e.target.checked,
                                        end: "",
                                      }
                                    : x,
                                ),
                              )
                            }
                          />
                          Estou cursando
                        </label>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-button"
                    disabled={data.education.length >= 20}
                    onClick={() =>
                      update("education", [
                        ...data.education,
                        { ...emptyEducation },
                      ])
                    }
                  >
                    <Plus size={18} />
                    Adicionar formação
                  </button>
                </>
              )}
              {step === 3 && (
                <>
                  <h3>Habilidades</h3>
                  <p className="muted">
                    Adicione conhecimentos técnicos e qualidades profissionais.
                  </p>
                  <div className="skill-input">
                    <Field
                      label="Nova habilidade"
                      maxLength={80}
                      value={skill}
                      onChange={setSkill}
                      placeholder="Ex.: Excel, comunicação, organização"
                    />
                    <button
                      type="button"
                      className="secondary"
                      onClick={addSkill}
                      disabled={!skill.trim() || data.skills.length >= 40}
                    >
                      Adicionar
                    </button>
                  </div>
                  <div className="chips">
                    {data.skills.map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() =>
                          update(
                            "skills",
                            data.skills.filter((x) => x !== v),
                          )
                        }
                        aria-label={`Remover habilidade ${v}`}
                      >
                        {v}
                        <span>×</span>
                      </button>
                    ))}
                  </div>
                  <h3 className="languages-title">Idiomas</h3>
                  {data.languages.map((item, i) => (
                    <div className="language-row" key={i}>
                      <Field
                        label="Idioma"
                        required
                        maxLength={80}
                        value={item.name}
                        onChange={(v) =>
                          update(
                            "languages",
                            data.languages.map((x, n) =>
                              n === i ? { ...x, name: v } : x,
                            ),
                          )
                        }
                      />
                      <label className="field">
                        <span>Nível</span>
                        <select
                          value={item.level}
                          onChange={(e) =>
                            update(
                              "languages",
                              data.languages.map((x, n) =>
                                n === i ? { ...x, level: e.target.value } : x,
                              ),
                            )
                          }
                        >
                          {[
                            "Básico",
                            "Intermediário",
                            "Avançado",
                            "Fluente",
                            "Nativo",
                          ].map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remover idioma ${i + 1}`}
                        onClick={() =>
                          update(
                            "languages",
                            data.languages.filter((_, n) => n !== i),
                          )
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-button"
                    disabled={data.languages.length >= 15}
                    onClick={() =>
                      update("languages", [
                        ...data.languages,
                        { name: "", level: "Básico" },
                      ])
                    }
                  >
                    <Plus size={18} />
                    Adicionar idioma
                  </button>
                </>
              )}
              {step === 4 && (
                <>
                  <div className="review-banner">
                    <span>
                      <Check size={26} />
                    </span>
                    <div>
                      <h3>Uma nova versão do seu futuro.</h3>
                      <p>
                        Seu currículo será gerado em PDF com texto selecionável,
                        pronto para processos seletivos.
                      </p>
                    </div>
                  </div>
                  <div className="review-list">
                    {steps.slice(0, 4).map((item, i) => (
                      <button type="button" key={i} onClick={() => move(i)}>
                        <span>{item.title}</span>
                        <span>
                          {
                            [
                              data.name || "Preencher",
                              `${data.experiences.length} experiência(s)`,
                              `${data.education.length} formação(ões)`,
                              `${data.skills.length} habilidade(s)`,
                            ][i]
                          }
                          <ArrowRight size={15} />
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="privacy-note">
                    <ShieldCheck size={18} />
                    Ao salvar ou baixar, suas informações serão armazenadas no
                    Me Emprega. O rascunho e a credencial ficam neste navegador.
                    Você pode apagar seu currículo abaixo.
                  </p>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => void save(false)}
                  >
                    Salvar currículo
                  </button>
                  {credentials && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => void save(false, true)}
                    >
                      Salvar como novo
                    </button>
                  )}
                </>
              )}
              {error && (
                <div role="alert" className="alert error">
                  {error}
                </div>
              )}
              {message && (
                <div role="status" className="alert success">
                  {message}
                </div>
              )}
              <div className="form-footer">
                {step > 0 ? (
                  <button
                    type="button"
                    className="back-button"
                    onClick={() => move(step - 1)}
                  >
                    <ArrowLeft size={17} />
                    Voltar
                  </button>
                ) : (
                  <span className="footer-note">
                    Um passo de cada vez. No seu ritmo.
                  </span>
                )}
                <button className="primary" type="submit">
                  {busy ? (
                    <>
                      <LoaderCircle size={18} className="spin" />
                      Preparando...
                    </>
                  ) : step === 4 ? (
                    <>
                      <Download size={18} />
                      Baixar currículo em PDF
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </fieldset>
          </form>
          <div className="editor-bottom">
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Substituir os campos atuais por um exemplo fictício?",
                  )
                ) {
                  setData(sample);
                  setError("");
                  setMessage("");
                }
              }}
            >
              Preencher com exemplo
            </button>
            <button
              type="button"
              className="text-button danger"
              disabled={busy}
              onClick={() => void reset()}
            >
              <Trash2 size={13} />
              Apagar currículo
            </button>
          </div>
        </section>
        <aside className="preview-panel">
          <div className="preview-header">
            <span>
              <FileText size={17} />
              Seu currículo, em tempo real
            </span>
            <span className="live-label">PRÉVIA</span>
          </div>
          <Preview data={data} />
          <p className="preview-caption">
            <ShieldCheck size={14} />
            Layout limpo. Sua trajetória em destaque.
          </p>
          <div className="preview-tip">
            <strong>Uma dica para você</strong>
            <p>
              Prefira informações claras e objetivas. Um bom currículo mostra
              quem você é e o que pode fazer.
            </p>
          </div>
          <span className="preview-footnote">
            A paginação do PDF se adapta ao seu conteúdo.
          </span>
        </aside>
      </main>
    </>
  );
}
