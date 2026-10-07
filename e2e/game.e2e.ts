import { expect, type Page, test } from "@playwright/test";

async function openLobby(page: Page) {
  await page.goto("/");
  await expect(async () => {
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Add player names" }),
    ).toBeVisible({
      timeout: 1_000,
    });
  }).toPass({ timeout: 10_000 });
}

async function addPlayer(page: Page, name: string) {
  const input = page.getByPlaceholder("Insert player name");
  await input.fill(name);
  await input.press("Enter");
  await expect(
    page.locator(".player-list li").filter({ hasText: name }),
  ).toBeVisible();
}

async function setTwoCards(page: Page) {
  await page.getByText("Settings", { exact: true }).click();
  const amount = page.locator("#cardAmount");
  await expect(amount).toBeEnabled();
  await amount.focus();
  await amount.press("Home");
  await amount.press("ArrowRight");
  await expect(page.locator(".card-count")).toHaveText("2");
}

async function startTwoPlayerGame(page: Page) {
  await openLobby(page);
  await addPlayer(page, "Alice");
  await addPlayer(page, "Bob");
  await setTwoCards(page);
  await page.getByRole("button", { name: "Let's get drinking" }).click();
  await expect(page.locator("main article h2")).toBeVisible();
  await expect(page.locator("progress")).toHaveAttribute("value", "1");
}

test("requires two players and lets players be removed in the lobby", async ({
  page,
}) => {
  await openLobby(page);
  const start = page.getByRole("button", { name: "Let's get drinking" });
  await expect(start).toBeDisabled();

  await addPlayer(page, "Alice");
  await expect(start).toBeDisabled();
  await addPlayer(page, "Bob");
  await expect(start).toBeEnabled();

  await page
    .locator(".player-list li")
    .filter({ hasText: "Bob" })
    .getByRole("button")
    .click();
  await expect(page.locator(".player-list li")).toHaveCount(1);
  await expect(start).toBeDisabled();
});

test("saves lobby settings and players across a reload", async ({ page }) => {
  await openLobby(page);
  await addPlayer(page, "Alice");
  await addPlayer(page, "Bob");
  await setTwoCards(page);

  const classic = page.locator(".tag-toggle").filter({ hasText: "Classic" });
  await classic.getByRole("button", { name: "Exclude tag" }).click();
  await expect(
    classic.getByRole("button", { name: "Exclude tag" }),
  ).toHaveClass(/active/);
  await expect(
    classic.getByRole("button", { name: "Include tag" }),
  ).not.toHaveClass(/active/);

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Add player names" }),
  ).toBeVisible();
  await expect(page.locator(".player-list li")).toHaveCount(2);
  await expect(page.locator(".player-list")).toContainText("Alice");
  await expect(page.locator(".player-list")).toContainText("Bob");
  await page.getByText("Settings", { exact: true }).click();
  await expect(page.locator(".card-count")).toHaveText("2");
  await expect(
    page
      .locator(".tag-toggle")
      .filter({ hasText: "Classic" })
      .getByRole("button", {
        name: "Exclude tag",
      }),
  ).toHaveClass(/active/);
});

test("plays through cards, replays, and resets to the start", async ({
  page,
}) => {
  await startTwoPlayerGame(page);
  await expect(page.locator("h1.target .text-light")).toHaveText(/Alice|Bob/);

  await page.getByRole("button", { name: "Next card" }).click();
  await expect(page.locator("progress")).toHaveAttribute("value", "2");
  await expect(page.getByRole("button", { name: "Game over" })).toBeVisible();
  await page.getByRole("button", { name: "Game over" }).click();
  await expect(page.getByRole("heading", { name: "Game over" })).toBeVisible();

  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.locator("progress")).toHaveAttribute("value", "1");
  await expect(page.locator("main article h2")).toBeVisible();
  await page.getByRole("button", { name: "Back to start" }).click();
  await expect(
    page.getByRole("button", { name: "Start", exact: true }),
  ).toBeVisible();
});

test("rerolls the current card", async ({ page }) => {
  await startTwoPlayerGame(page);
  await page.route("**/cards/cards.json", async (route) => {
    await route.fulfill({
      json: {
        cards: [
          {
            id: 99999,
            title: { en: "Rerolled card", fi: "Uusi kortti" },
            description: { en: "A replacement card", fi: "Korvaava kortti" },
            tags: ["classic"],
          },
        ],
      },
    });
  });
  await page.getByRole("button", { name: "Reroll" }).click();
  await expect(page.locator("main article h2")).toHaveText("Rerolled card");
  await expect(page.locator("main article p")).toHaveText("A replacement card");
  await expect(page.locator("progress")).toHaveAttribute("value", "1");
});

test("restores an active game and persists the selected language", async ({
  page,
}) => {
  await startTwoPlayerGame(page);
  const cardTitle = await page.locator("main article h2").textContent();
  await page.reload();
  await expect(page.locator("main article h2")).toHaveText(cardTitle!);
  await expect(page.locator("progress")).toHaveAttribute("value", "1");

  await page
    .getByRole("combobox", { name: "Select language" })
    .selectOption("fi");
  await expect(
    page.getByRole("combobox", { name: "Valitse kieli" }),
  ).toHaveValue("fi");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Valitse kieli" }),
  ).toHaveValue("fi");
  await expect(page.locator("main article h2")).not.toBeEmpty();
});
