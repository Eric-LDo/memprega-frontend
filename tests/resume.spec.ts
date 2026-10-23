import { test, expect } from "@playwright/test";

test("formulário completo, rascunho, PDF e exclusão", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Primeiro, vamos nos conhecer." }),
  ).toBeVisible();
  await page.getByLabel("Nome completo").fill("João Oliveira");
  await page.getByLabel("Cargo desejado").fill("Analista de atendimento");
  await page.getByLabel("E-mail", { exact: false }).fill("joao@example.com");
  await page.getByLabel("Telefone").fill("11999999999");
  await page.getByLabel("Cidade e estado").fill("São Paulo, SP");
  await page
    .getByLabel("Resumo profissional")
    .fill("Experiência em atendimento e organização de processos.");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("memprega-resume-v1") || "{}").data
            ?.name,
      ),
    )
    .toBe("João Oliveira");
  await page.reload();
  await expect(page.getByLabel("Nome completo")).toHaveValue("João Oliveira");
  await page.screenshot({
    path: testInfo.outputPath("formulario.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar experiência" }).click();
  await page.getByLabel("Cargo *", { exact: true }).fill("Assistente");
  await page.getByLabel("Empresa *", { exact: true }).fill("Empresa Exemplo");
  await page.getByLabel("Início *", { exact: true }).fill("2022-01");
  await page.getByLabel("Trabalho aqui atualmente").check();
  await page
    .getByLabel("Atividades e conquistas")
    .fill("Atendimento ao cliente com atenção e agilidade.");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar formação" }).click();
  await page
    .getByLabel("Curso", { exact: false })
    .first()
    .fill("Administração");
  await page.getByLabel("Instituição").fill("Universidade Exemplo");
  await page.getByLabel("Início *", { exact: true }).fill("2019-01");
  await page.getByLabel("Término").fill("2022-12");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByLabel("Nova habilidade").fill("Excel");
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar idioma" }).click();
  await page.getByLabel("Idioma *", { exact: true }).fill("Inglês");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar currículo em PDF" }).click();
  const download = await downloadEvent;
  await download.saveAs(testInfo.outputPath("curriculo.pdf"));
  await expect(page.getByRole("status")).toContainText("Seu PDF está pronto");
  await page.screenshot({
    path: testInfo.outputPath("revisao.png"),
    fullPage: true,
  });
  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport);
  await page
    .getByRole("button", { name: "Salvar currículo", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("salvo com sucesso");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Apagar currículo" }).click();
  await expect(page.getByLabel("Nome completo")).toHaveValue("");
});

test("não envia dados inválidos e mostra erro de conexão", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Revisar e baixar", exact: false })
    .click();
  await page.getByRole("button", { name: "Baixar currículo em PDF" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Preencha" }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Preencher com exemplo" }).click();
  await page
    .getByRole("button", { name: "Revisar e baixar", exact: false })
    .click();
  await page.route("**/api/v1/resumes", (route) => route.abort());
  await page.getByRole("button", { name: "Baixar currículo em PDF" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Não foi possível conectar" }),
  ).toBeVisible();
});
