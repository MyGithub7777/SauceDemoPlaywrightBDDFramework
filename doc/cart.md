# SauceDemo Playwright BDD — Remove from Cart Implementation

We will implement Remove from Cart functionality using our existing framework:

Playwright + TypeScript + playwright-bdd + POM + Fixtures

We will reuse the existing `ProductsPage`, `CartPage`, `LoginPage`, and `fixtures.ts`.

## What we will automate

| Scenario                    | Expected result                  |
| --------------------------- | -------------------------------- |
| 1. Remove a single product  | Product is removed from the cart |
| 2. Verify cart badge update | Badge decreases from 2 to 1      |
| 3. Remove all products      | Cart badge disappears            |
| 4. Verify empty cart        | No products remain in the cart   |

We will use reusable step definitions instead of creating duplicate code.

## Step 1 — Update folder structure

We will add a new feature file and step definition file.

SauceDemoPlaywrightBDDFramework/

├── features/\
│   ├── login.feature\
│   ├── products.feature\
│   ├── cart.feature\
│   └── removeCart.feature       ← NEW\
│\
├── src/\
│   ├── pages/\
│   │   ├── LoginPage.ts\
│   │   ├── ProductsPage.ts      ← UPDATE\
│   │   └── CartPage.ts          ← UPDATE\
│   │\
│   ├── step-definitions/\
│   │   ├── loginSteps.ts\
│   │   ├── productsSteps.ts\
│   │   ├── cartSteps.ts\
│   │   └── removeCartSteps.ts   ← NEW\
│   │\
│   └── config/\
│       └── fixtures.ts         ← NO CHANGE\
│\
├── playwright.config.ts\
├── .env\
└── package.json

## Step 2 — Create removeCart.feature

File: `features/removeCart.feature`

```
@removeCart
Feature: SauceDemo Remove from Cart Functionality

  Background:
    Given user is logged into SauceDemo

  @smoke
  Scenario: Remove single product from cart
    When user adds "Sauce Labs Backpack" to the cart
    And user removes "Sauce Labs Backpack" from products page
    Then cart badge should not be visible

  @regression
  Scenario: Verify cart badge updates after removing a product
    When user adds "Sauce Labs Backpack" to the cart
    And user adds "Sauce Labs Bike Light" to the cart
    Then cart badge should display 2
    When user removes "Sauce Labs Backpack" from products page
    Then cart badge should display 1

  @regression
  Scenario: Remove all products from cart
    When user adds "Sauce Labs Backpack" to the cart
    And user adds "Sauce Labs Bike Light" to the cart
    And user removes "Sauce Labs Backpack" from products page
    And user removes "Sauce Labs Bike Light" from products page
    Then cart badge should not be visible

  @regression
  Scenario: Verify empty cart after removing products
    When user adds "Sauce Labs Backpack" to the cart
    And user adds "Sauce Labs Bike Light" to the cart
    And user opens the shopping cart
    And user removes "Sauce Labs Backpack" from cart page
    And user removes "Sauce Labs Bike Light" from cart page
    Then cart should be empty
    And cart badge should not be visible
```

Explanation: We reuse existing login, add-product, open-cart, and badge-count steps. We only need to implement the new removal and empty-cart steps.

## Step 3 — Update ProductsPage.ts

File: `src/pages/ProductsPage.ts`

Keep all existing locators and methods.

Add the following methods inside the existing `ProductsPage` class:

```
async removeProductFromProductsPage(productName: string) {

  const product = this.page
    .locator('.inventory_item')
    .filter({
      has: this.page.locator('.inventory_item_name', {
        hasText: productName,
        exact: true
      })
    });

  await expect(product).toHaveCount(1);

  await product.getByRole('button', {
    name: 'Remove'
  }).click();
}

async verifyCartBadgeNotVisible() {
  await expect(this.cartBadge).toBeHidden();
}
```

Explanation:

- `removeProductFromProductsPage()` finds the selected product and clicks its Remove button.
- `verifyCartBadgeNotVisible()` verifies that the cart badge disappears when no products remain.

We use the existing `cartBadge` locator from the previous implementation.

## Step 4 — Update CartPage.ts

File: `src/pages/CartPage.ts`

Keep the existing methods.

Add these methods inside the class:

```
async removeProductFromCart(productName: string) {

  const product = this.cartItems.filter({
    has: this.page.locator('.inventory_item_name', {
      hasText: productName,
      exact: true
    })
  });

  await expect(product).toHaveCount(1);

  await product.getByRole('button', {
    name: 'Remove'
  }).click();
}

async verifyCartEmpty() {
  await expect(this.cartItems).toHaveCount(0);
}
```

Explanation:

- `removeProductFromCart()` removes a product directly from the shopping cart.
- `verifyCartEmpty()` checks that no cart items remain.

We use the existing `cartItems` locator.

## Step 5 — Create removeCartSteps.ts

File: `src/step-definitions/removeCartSteps.ts`

```
import { When, Then } from '../config/fixtures';

When(
  'user removes {string} from products page',
  async ({ productsPage }, productName: string) => {
    await productsPage.removeProductFromProductsPage(productName);
  }
);

When(
  'user removes {string} from cart page',
  async ({ cartPage }, productName: string) => {
    await cartPage.removeProductFromCart(productName);
  }
);

Then(
  'cart badge should not be visible',
  async ({ productsPage }) => {
    await productsPage.verifyCartBadgeNotVisible();
  }
);

Then(
  'cart should be empty',
  async ({ cartPage }) => {
    await cartPage.verifyCartEmpty();
  }
);
```

Explanation: Four new step definitions support all four scenarios.

We do not need to repeat existing step implementations.

## Step 6 — Verify fixtures.ts

File: `src/config/fixtures.ts`

No changes are required.

Your existing fixture file should already contain:

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

The fixtures automatically supply Page Object instances to the steps.

## Step 7 — Verify playwright.config.ts

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

No additional changes are needed.

## Step 8 — Generate BDD tests

```
npx bddgen
```

Generates Playwright tests from all `.feature` files, including `removeCart.feature`.

## Step 9 — Execute Remove from Cart scenarios

```
npx playwright test --grep "@removeCart" --headed
```

Runs only Remove from Cart scenarios in a visible browser.

## Step 10 — Execute Smoke scenarios

```
npx playwright test --grep "@smoke" --headed
```

Runs all smoke-tagged scenarios across the framework.

## Step 11 — Execute all BDD scenarios

```
npx playwright test --headed
```

Runs Login, Products, Sorting, Add to Cart, and Remove from Cart scenarios.

## Step 12 — Open HTML report

```
npx playwright show-report reports/html-report
```

Opens the Playwright HTML execution report.

## Expected results

Remove from Cart Test Suite

Expected

Remove single product — badge disappears

Remove one of two products — badge shows 1

Remove all products — badge disappears

Remove products from cart — cart becomes empty

Expected result\
4 passed

These are expected results; actual test execution has not been verified.

## Important real-time framework concepts

We have now implemented reusable step definitions across multiple feature files.

For example:

```
When user adds "Sauce Labs Backpack" to the cart
```

This step is already defined in `cartSteps.ts`, so we reuse it in `removeCart.feature`.

Similarly:

```
Given user is logged into SauceDemo
```

This step is already defined in `productsSteps.ts`.

Key point: We should not create duplicate step definitions for the same Gherkin step. Cucumber-style step matching requires each step to resolve unambiguously.

Our framework is becoming more maintainable because:

- Page Object classes contain UI interaction methods.
- Step definitions map Gherkin steps to Page Object methods.
- Fixtures provide reusable Page Object instances.
- Feature files describe business scenarios.
- `playwright.config.ts` controls test execution.

## Next recommended implementation

Checkout functionality is the next logical step.

We can implement the complete end-to-end checkout flow:

1. Add product to cart.
2. Open cart.
3. Click Checkout.
4. Enter customer information.
5. Verify checkout overview.
6. Complete the order.
7. Verify order confirmation.

This will introduce `CheckoutPage.ts`, reusable customer test data, and end-to-end BDD scenarios.