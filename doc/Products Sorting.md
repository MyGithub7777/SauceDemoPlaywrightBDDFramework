# SauceDemo Playwright BDD — Products Sorting Automation

We will implement **4 Products Sorting scenarios** using your existing Playwright BDD framework, Page Object Model (POM), fixtures, and step definitions.

We will use a **Scenario Outline** to avoid writing duplicate scenarios and step implementations.

## What we will automate

| Scenario          | Dropdown option     | Expected result         |
| ----------------- | ------------------- | ----------------------- |
| 1. Name A–Z       | Name (A to Z)       | Alphabetical ascending  |
| 2. Name Z–A       | Name (Z to A)       | Alphabetical descending |
| 3. Price Low–High | Price (low to high) | Price ascending         |
| 4. Price High–Low | Price (high to low) | Price descending        |

## Step 1 — Understand the Products page

SauceDemo provides a sorting dropdown on the Products page with four options. We will select each option and verify that the products appear in the correct order.

## Step 2 — Update products.feature

File: `features/products.feature`

Keep your existing Products scenario and add the following Scenario Outline below it:

```
  @regression @sorting
  Scenario Outline: Verify products sorting functionality
    Given user is logged into SauceDemo
    When user selects "<sortOption>" sorting option
    Then products should be sorted by "<sortType>" in "<order>" order

    Examples:
      | sortOption          | sortType | order      |
      | Name (A to Z)       | name     | ascending  |
      | Name (Z to A)       | name     | descending |
      | Price (low to high) | price    | ascending  |
      | Price (high to low) | price    | descending |
```

**What it does:** Defines four independent sorting tests from one Scenario Outline. Cucumber-style BDD parameters substitute the values from the Examples table.

## Step 3 — Update ProductsPage.ts

File: `src/pages/ProductsPage.ts`

Keep your existing methods and add the sorting locators and methods.

Here is the complete updated class:

```
import { Page, Locator, expect } from '@playwright/test';

export class ProductsPage {

  private readonly productsTitle: Locator;
  private readonly productsList: Locator;
  private readonly productItems: Locator;
  private readonly sortDropdown: Locator;
  private readonly productNames: Locator;
  private readonly productPrices: Locator;

  constructor(private readonly page: Page) {
    this.productsTitle = page.locator('.title');
    this.productsList = page.locator('.inventory_list');
    this.productItems = page.locator('.inventory_item');

    this.sortDropdown = page.locator('.product_sort_container');
    this.productNames = page.locator('.inventory_item_name');
    this.productPrices = page.locator('.inventory_item_price');
  }

  // Existing methods

  async verifyProductsPage() {
    await expect(this.productsTitle).toHaveText('Products');
  }

  async verifyProductsList() {
    await expect(this.productsList).toBeVisible();
  }

  async verifyProductCount(expectedCount: number) {
    await expect(this.productItems).toHaveCount(expectedCount);
  }

  // New sorting methods

  async selectSortOption(option: string) {
    await this.sortDropdown.selectOption({ label: option });
  }

  async verifyNameSorting(order: string) {
    await expect(async () => {
      const actualNames = await this.productNames.allTextContents();

      expect(actualNames.length).toBeGreaterThan(0);

      const expectedNames = [...actualNames].sort((a, b) =>
        a.localeCompare(b, 'en')
      );

      if (order === 'descending') {
        expectedNames.reverse();
      }

      expect(actualNames).toEqual(expectedNames);
    }).toPass();
  }

  async verifyPriceSorting(order: string) {
    await expect(async () => {
      const priceTexts = await this.productPrices.allTextContents();

      const actualPrices = priceTexts.map(price =>
        Number(price.replace('$', '').trim())
      );

      expect(actualPrices.length).toBeGreaterThan(0);

      expect(actualPrices.every(price =>
        Number.isFinite(price)
      )).toBe(true);

      const expectedPrices = [...actualPrices].sort((a, b) =>
        a - b
      );

      if (order === 'descending') {
        expectedPrices.reverse();
      }

      expect(actualPrices).toEqual(expectedPrices);
    }).toPass();
  }
}
```

### Explanation of the new methods

| Method                 | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `selectSortOption()`   | Selects a sorting option from the dropdown                 |
| `verifyNameSorting()`  | Checks alphabetical order                                  |
| `verifyPriceSorting()` | Checks numerical price order                               |
| `allTextContents()`    | Retrieves product names or prices                          |
| `sort()`               | Creates the expected order                                 |
| `reverse()`            | Converts ascending to descending                           |
| `toEqual()`            | Compares actual and expected arrays                        |
| `toPass()`             | Retries the sorting assertion until it passes or times out |

**Important:** We use `[...actualNames]` and `[...actualPrices]` to create copies of the arrays. JavaScript's `.sort()` modifies the original array, so copying prevents accidental modification of the actual results.

## Step 4 — Update productsSteps.ts

File: `src/step-definitions/productsSteps.ts`

Keep your existing Products step definitions and add these two new steps:

```
When('user selects {string} sorting option',
  async ({ productsPage }, sortOption: string) => {
    await productsPage.selectSortOption(sortOption);
  }
);

Then(
  'products should be sorted by {string} in {string} order',
  async (
    { productsPage },
    sortType: string,
    order: string
  ) => {

    if (sortType === 'name') {
      await productsPage.verifyNameSorting(order);
    }
    else if (sortType === 'price') {
      await productsPage.verifyPriceSorting(order);
    }
    else {
      throw new Error(`Unsupported sort type: ${sortType}`);
    }

  }
);
```

**What it does:** Connects the sorting steps in the feature file to the reusable methods in `ProductsPage.ts`.

Notice that we only created **two new step definitions for four scenarios**.

## Step 5 — Verify fixtures.ts

File: `src/config/fixtures.ts`

No changes are required if you already have this fixture:

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

**What it does:** Supplies `loginPage` and `productsPage` to the step definitions.

Both Page Objects share the same browser page within each scenario.

## Step 6 — Verify playwright.config.ts

Ensure your existing BDD configuration includes:

```
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: [
    'src/config/fixtures.ts',
    'src/step-definitions/**/*.ts'
  ]
});
```

No additional Playwright configuration is required for sorting tests.

## Step 7 — Generate BDD tests

```
npx bddgen
```

Generates Playwright tests for all four sorting examples.

## Step 8 — Execute only sorting scenarios

```
npx playwright test --grep "@sorting" --headed
```

Runs the four sorting scenarios in a visible browser.

## Step 9 — Execute Products scenarios

```
npx playwright test --grep "@products" --headed
```

Runs the Products feature scenarios, including sorting.

## Step 10 — Execute all BDD scenarios

```
npx playwright test --headed
```

Runs Login, Products, and Sorting scenarios.

## Step 11 — Open HTML report

```
npx playwright show-report reports/html-report
```

Opens the test execution report.

## Expected execution result

**Products Sorting Tests** (Expected)

---

Expected total **4 passed**

Illustrative expected result; actual execution has not been verified in your local environment.

## What you learned

You have now implemented:

- **Scenario Outline** — Runs the same scenario with multiple data combinations.
- **Parameterized step definitions** — Reuses steps instead of duplicating code.
- **Dropdown handling** — Uses Playwright's `selectOption()`.
- **Array comparison** — Validates the displayed product order.
- **POM reuse** — Keeps sorting logic in `ProductsPage.ts`.
- **Fixture reuse** — Uses the existing `productsPage` fixture.

### Next recommended implementation

**Add to Cart functionality** is the next logical step. It will introduce product selection, cart badge verification, and interaction between the Products and Cart Page Objects.

[Implement Add to Cart BDD]