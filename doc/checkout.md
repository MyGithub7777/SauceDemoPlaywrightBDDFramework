# SauceDemo Playwright BDD — Checkout Functionality

Now we will implement the complete Checkout functionality using our existing framework:

Playwright + TypeScript + playwright-bdd + Page Object Model + Fixtures

We will reuse our existing Login, Products, and Cart functionality and add a new `CheckoutPage`.

## What we will automate

| Scenario                    | Validation                              |
| --------------------------- | --------------------------------------- |
| 1. Successful checkout      | Order completes successfully            |
| 2. Missing first name       | Required field error                    |
| 3. Missing last name        | Required field error                    |
| 4. Missing postal code      | Required field error                    |
| 5. Cancel checkout          | User returns to the Cart page           |
| 6. Verify checkout overview | Correct product and price are displayed |

We will first implement the successful checkout flow, then add negative scenarios and validations.

## Step 1 — Update folder structure

SauceDemoPlaywrightBDDFramework/

├── features/\
│   ├── login.feature\
│   ├── products.feature\
│   ├── cart.feature\
│   ├── removeCart.feature\
│   └── checkout.feature          ← NEW\
│\
├── src/\
│   ├── pages/\
│   │   ├── LoginPage.ts\
│   │   ├── ProductsPage.ts\
│   │   ├── CartPage.ts           ← UPDATE\
│   │   └── CheckoutPage.ts       ← NEW\
│   │\
│   ├── step-definitions/\
│   │   ├── loginSteps.ts\
│   │   ├── productsSteps.ts\
│   │   ├── cartSteps.ts\
│   │   ├── removeCartSteps.ts\
│   │   └── checkoutSteps.ts      ← NEW\
│   │\
│   └── config/\
│       ├── fixtures.ts          ← UPDATE\
│       └── testData.ts          ← NEW\
│\
├── playwright.config.ts\
├── .env\
└── package.json

## Step 2 — Create checkout.feature

File: `features/checkout.feature`

```
@checkout
Feature: SauceDemo Checkout Functionality

  Background:
    Given user is logged into SauceDemo
    And user adds "Sauce Labs Backpack" to the cart
    And user opens the shopping cart
    And user proceeds to checkout

  @smoke
  Scenario: Complete checkout with valid customer details
    When user enters valid checkout information
    And user continues to checkout overview
    And user completes the order
    Then order confirmation should be displayed

  @regression
  Scenario Outline: Verify required checkout fields
    When user enters first name "<firstName>" last name "<lastName>" and postal code "<postalCode>"
    And user continues to checkout overview
    Then checkout error message should be "<errorMessage>"

    Examples:
      | firstName | lastName | postalCode | errorMessage                   |
      |           | Smith    | 12345      | Error: First Name is required |
      | John      |          | 12345      | Error: Last Name is required  |
      | John      | Smith    |            | Error: Postal Code is required|

  @regression
  Scenario: Cancel checkout
    When user cancels checkout
    Then user should return to the cart page

  @regression
  Scenario: Verify checkout overview details
    When user enters valid checkout information
    And user continues to checkout overview
    Then checkout overview should display "Sauce Labs Backpack"
    And checkout overview should display correct price
```

Explanation: The `Background` performs the common login, add-to-cart, and checkout setup before every scenario. Each scenario runs independently.

## Step 3 — Update CartPage.ts

File: `src/pages/CartPage.ts`

Keep all existing methods.

Add this locator inside the class:

```
private readonly checkoutButton: Locator;
```

Initialize it inside the constructor:

```
this.checkoutButton = page.locator('[data-test="checkout"]');
```

Add this method:

```
async proceedToCheckout() {
  await this.checkoutButton.click();
}
```

Purpose: Clicks Checkout from the Cart page.

## Step 4 — Create testData.ts

File: `src/config/testData.ts`

```
export const checkoutData = {
  firstName: 'John',
  lastName: 'Smith',
  postalCode: '12345'
};
```

Purpose: Stores reusable checkout test data instead of hardcoding values in step definitions.

## Step 5 — Create CheckoutPage.ts

File: `src/pages/CheckoutPage.ts`

```
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {

  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;
  private readonly finishButton: Locator;
  private readonly errorMessage: Locator;
  private readonly confirmationMessage: Locator;
  private readonly overviewItems: Locator;
  private readonly itemTotal: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.confirmationMessage = page.locator('.complete-header');
    this.overviewItems = page.locator('.cart_item');
    this.itemTotal = page.locator('.summary_subtotal_label');
  }

  async enterCustomerInformation(
    firstName: string,
    lastName: string,
    postalCode: string
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async clickFinish() {
    await this.finishButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async verifyErrorMessage(expectedMessage: string) {
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }

  async verifyOrderConfirmation() {
    await expect(this.confirmationMessage)
      .toHaveText('Thank you for your order!');
  }

  async verifyOverviewProduct(productName: string) {
    await expect(
      this.overviewItems.locator('.inventory_item_name')
    ).toContainText([productName]);
  }

  async verifyOverviewPrice() {
    const priceText = await this.overviewItems
      .locator('.inventory_item_price')
      .first()
      .textContent();

    const itemPrice = Number(priceText?.replace('$', ''));

    await expect(this.itemTotal)
      .toHaveText(`Item total: $${itemPrice.toFixed(2)}`);
  }
}
```

Purpose: Contains checkout form actions, validations, and order completion methods.

The price verification checks the item subtotal before tax, rather than the final order total.

## Step 6 — Update fixtures.ts

File: `src/config/fixtures.ts`

Add `CheckoutPage` to your existing fixtures.

```
import { test as base, createBdd } from 'playwright-bdd';

import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

type MyFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
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
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  }

});

export const { Given, When, Then } = createBdd(test);
```

Purpose: Automatically injects the `checkoutPage` Page Object into the BDD step definitions.

## Step 7 — Create checkoutSteps.ts

File: `src/step-definitions/checkoutSteps.ts`

```
import { When, Then } from '../config/fixtures';
import { checkoutData } from '../config/testData';

When('user proceeds to checkout',
  async ({ cartPage }) => {
    await cartPage.proceedToCheckout();
  }
);

When('user enters valid checkout information',
  async ({ checkoutPage }) => {
    await checkoutPage.enterCustomerInformation(
      checkoutData.firstName,
      checkoutData.lastName,
      checkoutData.postalCode
    );
  }
);

When(
  'user enters first name {string} last name {string} and postal code {string}',
  async (
    { checkoutPage },
    firstName: string,
    lastName: string,
    postalCode: string
  ) => {
    await checkoutPage.enterCustomerInformation(
      firstName,
      lastName,
      postalCode
    );
  }
);

When('user continues to checkout overview',
  async ({ checkoutPage }) => {
    await checkoutPage.clickContinue();
  }
);

When('user completes the order',
  async ({ checkoutPage }) => {
    await checkoutPage.clickFinish();
  }
);

When('user cancels checkout',
  async ({ checkoutPage }) => {
    await checkoutPage.clickCancel();
  }
);

Then('checkout error message should be {string}',
  async ({ checkoutPage }, errorMessage: string) => {
    await checkoutPage.verifyErrorMessage(errorMessage);
  }
);

Then('order confirmation should be displayed',
  async ({ checkoutPage }) => {
    await checkoutPage.verifyOrderConfirmation();
  }
);

Then('checkout overview should display {string}',
  async ({ checkoutPage }, productName: string) => {
    await checkoutPage.verifyOverviewProduct(productName);
  }
);

Then('checkout overview should display correct price',
  async ({ checkoutPage }) => {
    await checkoutPage.verifyOverviewPrice();
  }
);

Then('user should return to the cart page',
  async ({ cartPage }) => {
    await cartPage.verifyCartPage();
  }
);
```

Purpose: Connects the checkout scenarios to reusable POM methods.

Notice that we reuse existing steps for login, adding products, and opening the cart.

## Step 8 — Verify playwright.config.ts

Keep your existing configuration. Confirm that the BDD paths are correct:

```
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: [
    'src/config/fixtures.ts',
    'src/step-definitions/**/*.ts'
  ]
});
```

No new Playwright configuration is needed.

## Step 9 — Generate BDD tests

```
npx bddgen
```

Purpose: Generates Playwright tests from the new checkout feature.

## Step 10 — Execute successful checkout only

```
npx playwright test --grep "Complete checkout with valid customer details" --headed
```

Purpose: Executes the successful checkout scenario first.

## Step 11 — Execute all Checkout scenarios

```
npx playwright test --grep "@checkout" --headed
```

Purpose: Runs all six checkout test cases (one positive, three required-field examples, one cancellation, and one overview verification).

## Step 12 — Execute all BDD tests

```
npx playwright test --headed
```

Purpose: Executes all existing features: Login, Products, Sorting, Add to Cart, Remove from Cart, and Checkout.

## Step 13 — Open HTML report

```
npx playwright show-report reports/html-report
```

Purpose: Displays test results, failures, screenshots, and traces where available.

## Expected test results

Checkout Test Suite

Expected

Successful checkout

Missing first name validation

Missing last name validation

Missing postal code validation

Cancel checkout

Verify checkout overview and price

Expected total\
6 passed

Illustrative expected results. Actual execution has not been verified in your local project.

## What we learned

- End-to-end automation: Login → Products → Cart → Checkout → Order confirmation.
- Scenario Outline: Three negative checkout scenarios with one reusable step definition.
- Test data management: Customer details are stored in `testData.ts`.
- POM: Checkout actions and assertions are centralized in `CheckoutPage.ts`.
- Fixtures: `checkoutPage` is automatically supplied to the step definitions.
- Step reuse: Existing Login, Products, and Cart steps work in Checkout scenarios without duplication.

### Recommended next step

Now that we have implemented the core SauceDemo business flow, I recommend improving the framework with advanced fixtures and reusable hooks, followed by Allure reporting and CI/CD integration.

This will help turn the current functional automation framework into a more maintainable, production-style Playwright BDD framework.