# SauceDemo Playwright BDD — Add to Cart Implementation

Now we will implement Add to Cart functionality using our existing Playwright BDD + TypeScript + Page Object Model + Fixtures framework.

We will reuse `LoginPage.ts`, `ProductsPage.ts`, and `fixtures.ts`. We will also introduce `CartPage.ts` to verify products inside the shopping cart.

## What we will automate

| Scenario                 | Validation                           |
| ------------------------ | ------------------------------------ |
| 1. Add single product    | Product is added successfully        |
| 2. Add multiple products | Two products are added successfully  |
| 3. Verify cart badge     | Badge displays correct product count |
| 4. Verify cart contents  | Cart contains the selected products  |

Each scenario will run independently using Playwright's built-in test isolation.

## Step 1 — Update the folder structure

SauceDemoPlaywrightBDDFramework/

├── features/\
│   ├── login.feature\
│   ├── products.feature\
│   └── cart.feature              ← NEW\
│\
├── src/\
│   ├── pages/\
│   │   ├── LoginPage.ts\
│   │   ├── ProductsPage.ts       ← UPDATE\
│   │   └── CartPage.ts           ← NEW\
│   │\
│   ├── step-definitions/\
│   │   ├── loginSteps.ts\
│   │   ├── productsSteps.ts\
│   │   └── cartSteps.ts          ← NEW\
│   │\
│   └── config/\
│       └── fixtures.ts          ← UPDATE\
│\
├── playwright.config.ts\
├── .env\
└── package.json

## Step 2 — Create cart.feature

File: `features/cart.feature`

```
@cart
Feature: SauceDemo Add to Cart Functionality

  Background:
    Given user is logged into SauceDemo

  @smoke
  Scenario: Add single product to cart
    When user adds "Sauce Labs Backpack" to the cart
    Then cart badge should display 1

  @regression
  Scenario: Add multiple products to cart
    When user adds "Sauce Labs Backpack" to the cart
    And user adds "Sauce Labs Bike Light" to the cart
    Then cart badge should display 2

  @regression
  Scenario: Verify cart badge after adding products
    When user adds "Sauce Labs Backpack" to the cart
    And user adds "Sauce Labs Bolt T-Shirt" to the cart
    And user adds "Sauce Labs Onesie" to the cart
    Then cart badge should display 3

  @regression
  Scenario: Verify selected products in cart
    When user adds "Sauce Labs Backpack" to the cart
    And user adds "Sauce Labs Bike Light" to the cart
    And user opens the shopping cart
    Then cart should contain "Sauce Labs Backpack"
    And cart should contain "Sauce Labs Bike Light"
    And cart should display 2 products
```

Explanation:

- `Background` runs before each scenario.
- We reuse the existing `Given user is logged into SauceDemo` step.
- Each scenario gets a fresh browser context and page.
- Product names are parameterized using `{string}`.
- We avoid creating separate step definitions for every product.

Important: The Background does not mean all scenarios share the same logged-in browser. Each scenario performs its own login.

## Step 3 — Update ProductsPage.ts

File: `src/pages/ProductsPage.ts`

Keep all your existing methods for product verification and sorting.

Add these new locators to the class:

```
private readonly cartBadge: Locator;
private readonly cartIcon: Locator;
```

Initialize them inside the existing constructor:

```
this.cartBadge = page.locator('.shopping_cart_badge');
this.cartIcon = page.locator('.shopping_cart_link');
```

Now add these methods inside the `ProductsPage` class:

```
async addProductToCart(productName: string) {

  const product = this.page
    .locator('.inventory_item')
    .filter({
      has: this.page.locator('.inventory_item_name', {
        hasText: productName
      })
    });

  await expect(product).toHaveCount(1);

  await product.getByRole('button', {
    name: 'Add to cart'
  }).click();
}

async verifyCartBadge(expectedCount: number) {
  await expect(this.cartBadge).toHaveText(
    expectedCount.toString()
  );
}

async openShoppingCart() {
  await this.cartIcon.click();
}
```

Explanation:

| Method               | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `addProductToCart()` | Finds a specific product and clicks Add to cart |
| `verifyCartBadge()`  | Verifies the cart badge count                   |
| `openShoppingCart()` | Navigates to the shopping cart                  |

Using the product name makes the method reusable for any product.

## Step 4 — Create CartPage.ts

File: `src/pages/CartPage.ts`

```
import { Page, Locator, expect } from '@playwright/test';

export class CartPage {

  private readonly cartTitle: Locator;
  private readonly cartItems: Locator;

  constructor(private readonly page: Page) {
    this.cartTitle = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
  }

  async verifyCartPage() {
    await expect(this.cartTitle).toHaveText('Your Cart');
  }

  async verifyProductInCart(productName: string) {

    const product = this.cartItems.filter({
      has: this.page.locator('.inventory_item_name', {
        hasText: productName,
        exact: true
      })
    });

    await expect(product).toHaveCount(1);
  }

  async verifyCartProductCount(expectedCount: number) {
    await expect(this.cartItems).toHaveCount(expectedCount);
  }
}
```

Explanation: The `CartPage` class is responsible for validating products on the Cart page.

We are keeping responsibilities separate:

- `ProductsPage.ts` — Add products and verify the cart badge.
- `CartPage.ts` — Verify products inside the cart.

## Step 5 — Update fixtures.ts

File: `src/config/fixtures.ts`

Replace the existing content with:

```
import { test as base, createBdd } from 'playwright-bdd';

import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';

type MyFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
};

export const test = base.extend<MyFixtures>({

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  }

});

export const { Given, When, Then } = createBdd(test);
```

Explanation: We added `cartPage` to our existing fixture setup.

Now Playwright automatically supplies `loginPage`, `productsPage`, and `cartPage` whenever a step requests them.

We do not need to manually create Page Object instances in step definitions.

## Step 6 — Create cartSteps.ts

File: `src/step-definitions/cartSteps.ts`

```
import { When, Then } from '../config/fixtures';

When('user adds {string} to the cart',
  async ({ productsPage }, productName: string) => {
    await productsPage.addProductToCart(productName);
  }
);

Then('cart badge should display {int}',
  async ({ productsPage }, count: number) => {
    await productsPage.verifyCartBadge(count);
  }
);

When('user opens the shopping cart',
  async ({ productsPage, cartPage }) => {
    await productsPage.openShoppingCart();
    await cartPage.verifyCartPage();
  }
);

Then('cart should contain {string}',
  async ({ cartPage }, productName: string) => {
    await cartPage.verifyProductInCart(productName);
  }
);

Then('cart should display {int} products',
  async ({ cartPage }, count: number) => {
    await cartPage.verifyCartProductCount(count);
  }
);
```

Explanation: We created five reusable step definitions that support all four scenarios.

Notice that we do not duplicate the login step. It already exists in `productsSteps.ts`.

## Step 7 — Verify playwright.config.ts

No major changes are required.

Make sure the BDD configuration discovers all feature and step definition files:

```
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: [
    'src/config/fixtures.ts',
    'src/step-definitions/**/*.ts'
  ]
});
```

Your existing Playwright settings remain unchanged.

## Step 8 — Verify .env

Your `.env` should contain:

```
BASE_URL=https://www.saucedemo.com/
USERNAME=standard_user
PASSWORD=secret_sauce
```

Your `playwright.config.ts` should already contain:

```
import 'dotenv/config';
```

## Step 9 — Generate BDD tests

```
npx bddgen
```

Purpose: Generates Playwright tests from all `.feature` files, including `cart.feature`.

## Step 10 — Execute only Add to Cart scenarios

```
npx playwright test --grep "@cart" --headed
```

Purpose: Executes all four Cart scenarios in a visible browser.

## Step 11 — Execute only smoke scenarios

```
npx playwright test --grep "@smoke" --headed
```

Purpose: Executes scenarios tagged `@smoke`.

## Step 12 — Execute all BDD scenarios

```
npx playwright test --headed
```

Purpose: Executes Login, Products, Sorting, and Cart scenarios.

## Step 13 — View HTML report

```
npx playwright show-report reports/html-report
```

Purpose: Opens the Playwright HTML report.

## Expected results

Add to Cart Test Suite

Expected

Add single product — badge shows 1

Add multiple products — badge shows 2

Add three products — badge shows 3

Verify selected products — cart contains 2 items

Expected result

4 passed

These are expected outcomes, not verified execution results.

## Important concept — Background vs Fixtures

| Background                     | Fixtures                           |
| ------------------------------ | ---------------------------------- |
| Defines reusable Gherkin steps | Defines reusable test dependencies |
| Runs before each scenario      | Initialized when requested         |
| Performs login through steps   | Creates Page Object instances      |
| Visible in feature files       | Defined in TypeScript              |
| Describes test preconditions   | Manages dependency lifecycle       |

For example, `Background` calls the existing login step:

```
Background:
  Given user is logged into SauceDemo
```

That login step requests the `loginPage` fixture, which provides a `LoginPage` instance. The step then uses that instance to log in.

This is how BDD Background, Page Object Model, and Playwright fixtures work together.

## What should we implement next?

The logical next step is Remove from Cart functionality.

It will cover removing a single product, verifying badge updates, removing all products, and validating the empty cart.

Implement Remove from Cart&#x20;