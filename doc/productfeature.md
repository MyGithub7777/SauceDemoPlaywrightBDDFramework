# SauceDemo Playwright BDD Framework — Products Page Implementation

Now we will implement the **Products Page** using our existing `playwright-bdd + TypeScript + POM + Fixtures` framework.

We will reuse the Login Page Object and introduce a new Products Page Object.

## What we will implement

**Products Page — First Scenario** (Implementation)

TEST FLOW

We will verify that a logged-in user can see the Products page and all six products.

## Step 1 — Update the folder structure

We will add `ProductsPage.ts`, `productsSteps.ts`, and `products.feature` to the existing framework.

**SauceDemoPlaywrightBDDFramework/**

├── features/\
│   ├── login.feature\
│   └── products.feature          ← NEW\
├── src/\
│   ├── pages/\
│   │   ├── LoginPage.ts\
│   │   └── ProductsPage.ts       ← NEW\
│   ├── step-definitions/\
│   │   ├── loginSteps.ts\
│   │   └── productsSteps.ts      ← NEW\
│   └── config/\
│       └── fixtures.ts          ← UPDATE\
├── .env\
├── playwright.config.ts\
└── package.json

## Step 2 — Create Products Feature File

File: `features/products.feature`

```
@products
Feature: SauceDemo Products Functionality

  @smoke
  Scenario: Verify products are displayed after login
    Given user is logged into SauceDemo
    When user navigates to the products page
    Then user should see the products list
    And user should see 6 products
```

**What it does:** Defines a BDD scenario to validate that the Products page displays all six inventory items after a successful login.

## Step 3 — Create ProductsPage.ts

File: `src/pages/ProductsPage.ts`

```
import { Page, Locator, expect } from '@playwright/test';

export class ProductsPage {

  private readonly productsTitle: Locator;
  private readonly productsList: Locator;
  private readonly productItems: Locator;

  constructor(private readonly page: Page) {
    this.productsTitle = page.locator('.title');
    this.productsList = page.locator('.inventory_list');
    this.productItems = page.locator('.inventory_item');
  }

  async verifyProductsPage() {
    await expect(this.productsTitle).toHaveText('Products');
  }

  async verifyProductsList() {
    await expect(this.productsList).toBeVisible();
  }

  async verifyProductCount(expectedCount: number) {
    await expect(this.productItems).toHaveCount(expectedCount);
  }
}
```

**What it does:** Creates reusable methods for verifying the Products page title, product list visibility, and total number of products.

Notice that we use Playwright's `Locator` and `expect` for reliable, auto-retrying assertions.

## Step 4 — Update fixtures.ts

File: `src/config/fixtures.ts`

Replace the existing fixture file with:

```
import { test as base, createBdd } from 'playwright-bdd';

import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

type MyFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

export const test = base.extend<MyFixtures>({

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  }

});

export const { Given, When, Then } = createBdd(test);
```

**What it does:** Registers both `loginPage` and `productsPage` as reusable Playwright fixtures.

Now step definitions can request either Page Object without manually creating instances.

---

## Step 5 — Create Products Step Definitions

File: `src/step-definitions/productsSteps.ts`

```
import { Given, When, Then } from '../config/fixtures';

Given('user is logged into SauceDemo',
  async ({ loginPage }) => {

    await loginPage.navigate();

    await loginPage.enterCredentials(
      process.env.USERNAME!,
      process.env.PASSWORD!
    );

    await loginPage.clickLogin();
  }
);

When('user navigates to the products page',
  async ({ productsPage }) => {
    await productsPage.verifyProductsPage();
  }
);

Then('user should see the products list',
  async ({ productsPage }) => {
    await productsPage.verifyProductsList();
  }
);

Then('user should see {int} products',
  async ({ productsPage }, count: number) => {
    await productsPage.verifyProductCount(count);
  }
);
```

**What it does:**

- `Given` — Logs in using the existing `LoginPage` fixture.
- `When` — Confirms the user has reached the Products page after login.
- `Then` — Verifies that the products list is visible.
- `Then` — Checks the expected product count using a reusable `{int}` parameter.

Notice that we are not repeating login locators in `productsSteps.ts`. We reuse the `LoginPage` methods.

Also, the `When` step is verifying the navigation that happened after login, rather than performing another navigation. Later, we can improve its wording to `Then user should be on the products page` for clearer BDD semantics.

## Step 6 — Verify playwright.config.ts

Open your existing `playwright.config.ts`.

Make sure your BDD configuration includes both feature and step definition folders:

```
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: [
    'src/config/fixtures.ts',
    'src/step-definitions/**/*.ts'
  ]
});
```

**What it does:** Automatically discovers both `login.feature` and `products.feature`, along with their step implementations.

Keep the remaining configuration unchanged.

## Step 7 — Verify .env

Your existing `.env` should contain:

```
BASE_URL=https://www.saucedemo.com/
USERNAME=standard_user
PASSWORD=secret_sauce
```

**What it does:** Supplies the website URL and login credentials.

Ensure your `playwright.config.ts` still imports:

```
import 'dotenv/config';
```

## Step 8 — Generate BDD Tests

Run:

```
npx bddgen
```

**What it does:** Generates Playwright-compatible tests from your feature files.

## Step 9 — Execute Products Scenario

Run:

```
npx playwright test --grep "Verify products are displayed after login" --headed
```

**What it does:** Executes only our new Products scenario in a visible browser.

Alternatively, execute all Products feature scenarios by tag:

```
npx playwright test --grep "@products" --headed
```

**What it does:** Runs scenarios tagged with `@products`, assuming your installed `playwright-bdd` version includes Gherkin tags in the generated test titles.

## Step 10 — Execute All Scenarios

```
npx playwright test --headed
```

**What it does:** Runs the existing Login scenarios and the new Products scenario.

## Step 11 — View HTML Report

```
npx playwright show-report reports/html-report
```

**What it does:** Opens the Playwright HTML report.

**Expected Products Scenario Result**

4 steps passed

Illustrative result — actual status depends on your test execution.

---

1. Login successfully
2. Verify Products page title
3. Verify products list visibility
4. Verify six products are displayed

---

## Step 12 — Understand how fixtures work here

Our fixture file contains two Page Objects:

```
type MyFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
};
```

When a step requests:

```
async ({ loginPage }) => {
  await loginPage.navigate();
}
```

Playwright provides the `LoginPage` instance.

When another step requests:

```
async ({ productsPage }) => {
  await productsPage.verifyProductsList();
}
```

Playwright provides the `ProductsPage` instance.

Both Page Objects use the **same Playwright `page` within the scenario**.

Each scenario gets its own isolated browser context and page by default.

## What have we achieved?

| Component                     | Status                 |
| ----------------------------- | ---------------------- |
| Login feature                 | Implemented previously |
| Login Page Object             | Reused                 |
| Products feature              | Implemented            |
| Products Page Object          | Implemented            |
| Products step definitions     | Implemented            |
| Multiple Page Object fixtures | Implemented            |
| Playwright configuration      | Reused                 |
| Test execution                | Ready to run           |

## What should we implement next?

I recommend **Products Sorting** before Add to Cart. It will teach us how to work with dropdowns, arrays, sorting, and assertions in Playwright.

[Implement Products Sorting]

[Implement Add to Cart]