export type Period = { start: string; end: string; current: boolean };
export type Experience = Period & {
  role: string;
  company: string;
  description: string;
};
export type Education = Period & {
  course: string;
  institution: string;
  level: string;
};
export type Resume = {
  name: string;
  email: string;
  phone: string;
  city: string;
  title: string;
  summary: string;
  linkedin: string;
  portfolio: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: { name: string; level: string }[];
};
export const emptyResume: Resume = {
  name: "",
  email: "",
  phone: "",
  city: "",
  title: "",
  summary: "",
  linkedin: "",
  portfolio: "",
  experiences: [],
  education: [],
  skills: [],
  languages: [],
};
export const emptyExperience: Experience = {
  role: "",
  company: "",
  description: "",
  start: "",
  end: "",
  current: false,
};
export const emptyEducation: Education = {
  course: "",
  institution: "",
  level: "Graduação",
  start: "",
  end: "",
  current: false,
};
export const sample: Resume = {
  name: "Mariana Oliveira",
  title: "Analista de atendimento",
  email: "mariana@example.com",
  phone: "(11) 99999-1234",
  city: "São Paulo, SP",
  linkedin: "",
  portfolio: "",
  summary:
    "Profissional de atendimento com experiência em relacionamento com clientes, resolução de problemas e melhoria de processos. Busco contribuir com uma equipe que valorize a colaboração e a experiência do cliente.",
  experiences: [
    {
      role: "Assistente de atendimento",
      company: "Empresa Exemplo",
      start: "2022-03",
      end: "",
      current: true,
      description:
        "Atendimento ao cliente por e-mail e chat.\nOrganização de demandas e acompanhamento de indicadores de satisfação.",
    },
  ],
  education: [
    {
      course: "Administração",
      institution: "Universidade Exemplo",
      level: "Graduação",
      start: "2019-02",
      end: "2022-12",
      current: false,
    },
  ],
  skills: ["Comunicação", "Excel", "Organização", "Atendimento ao cliente"],
  languages: [{ name: "Inglês", level: "Intermediário" }],
};
export function dateLabel(value: string) {
  return value ? value.split("-").reverse().join("/") : "";
}
export function validate(
  data: Resume,
): { step: number; message: string } | null {
  if (
    [data.name, data.title, data.city].some((v) => v.trim().length < 2) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
    data.phone.trim().length < 8
  )
    return {
      step: 0,
      message:
        "Preencha nome, cargo desejado, e-mail válido, telefone e cidade.",
    };
  if (
    [data.linkedin, data.portfolio].some(
      (v) => v && !/^https?:\/\/[^\s/]+/.test(v),
    )
  )
    return {
      step: 0,
      message: "Os links precisam começar com https:// ou http://.",
    };
  for (const [step, rows] of [
    [1, data.experiences],
    [2, data.education],
  ] as const) {
    for (const row of rows) {
      const names =
        "role" in row ? [row.role, row.company] : [row.course, row.institution];
      if (
        names.some((v) => v.trim().length < 2) ||
        !row.start ||
        (!row.current && !row.end) ||
        (row.end && row.end < row.start)
      )
        return {
          step,
          message:
            "Complete os campos e confira as datas. O término não pode ser anterior ao início.",
        };
    }
  }
  if (data.languages.some((v) => v.name.trim().length < 2))
    return { step: 3, message: "Informe o nome de cada idioma adicionado." };
  return null;
}
