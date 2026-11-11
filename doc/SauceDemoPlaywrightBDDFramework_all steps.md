SauceDemoPlaywrightBDDFramework

Prer - 
Nodejs
npm
vscode 

Steps:- 
1. Create a project folder 
2. Open in vs code 
3. Install playwright setup 
		npm init playwright@latest
		Typescript
		tests
		no
		yes
		Initializes Playwright with TypeScript and creates the initial configuration.

4. Install playwright-bdd
		npm install -D playwright-bdd
		Installs the BDD integration for Playwright.

5. Install dotenv
		npm install dotenv
		Loads environment variables from a .env file.		

6. Install cross-env
		npm install --save-dev cross-env
		Supports environment variables across Windows, macOS, and Linux.

7. Install Allure Playwright
		npm install --save-dev allure-playwright
		Integrates Allure reporting with Playwright Test.

9. We will configure tsconfig.json to resolve the process.env and dotenv/config TypeScript errors.
Install Node.js type definitions
	npm install --save-dev @types/node
	Purpose: Enables TypeScript to recognize Node.js globals such as process and process.env.

Create and Configure tsconfig.json
===========================================
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "types": ["node"],
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": [
    "src/**/*.ts",
    "playwright.config.ts"
  ],
  "exclude": [
    "node_modules",
    ".features-gen",
    "reports",
    "test-results"
  ]
}

=============================================



Folder structure creation 
1. Create feature folder on project level
2. create folders under src - 
		step-definitions - step implementations
		pages - page classes (POM classes)
		hooks - before and after hooks 
		utils - reusbale utility functions 
		config - framework configuration and test data
		
3. other folder on project level 
		test-data
		reports - test execution reports 
		screenshots - screenshot captured during execution


What happens in projects?
There is no single mandatory folder structure. Both root-level and src-based structures are used.

However, using src/ for TypeScript implementation code offers several advantages:
- Maintainability: All automation implementation code is grouped together.
- Scalability: Easy to add more page classes, utilities, and hooks.
- Separation: Feature scenarios stay separate from their implementation.
- CI/CD integration: Generated reports and screenshots remain outside source code.
One more good practice: add reports/, screenshots/, and .env to .gitignore so generated artifacts and credentials aren't committed.

-----------------------------------------

Now lets start with first scenario writing 

1. Configure Playwright BDD

Update playwright.config.ts
Open the existing playwright.config.ts and replace its content:
===========================================================================
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import 'dotenv/config';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: [
    'src/config/fixtures.ts',
    'src/step-definitions/**/*.ts',
    'src/hooks/**/*.ts'
  ],
});

export default defineConfig({
  testDir,

  timeout: 30000,
  expect: {
    timeout: 10000
  },

  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }]
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com/',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});

===================================================================================

Purpose: Connects feature files and step definitions to the Playwright runner. It also configures browser execution, retries, screenshots, traces, and reports.



2. Create .env file
Create .env at project level:
===============
BASE_URL=https://www.saucedemo.com/
USERNAME1=standard_user
PASSWORD1=secret_sauce
===============

Purpose: Stores environment-specific configuration and SauceDemo test credentials.

3. create 1 scenario in login.feature

	Feature: SauceDemo Login Functionality

	  @smoke
	  Scenario: Login with valid credentials
	    Given user navigates to SauceDemo login page
	    When user enters valid username and password
	    And user clicks on login button
	    Then user should see the products page

4. create step implemention 
	create loginsteps.ts

===========================================
import { createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/loginpage';

const { Given, When, Then } = createBdd();

Given('user navigates to SauceDemo login page',
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
  }
);

When('user enters valid username and password',
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.enterCredentials(
      process.env.USERNAME1!,
      process.env.PASSWORD1!
    );
  }
);

When('user clicks on login button',
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.clickLogin();
  }
);

Then('user should see the products page',
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyProductsPage();
  }
);
============================================


5. create page classes as per pom classes
	create login page

===============================================================
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly productsTitle: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.productsTitle = page.locator('.title');
  }

  async navigate() {
    await this.page.goto('/');
  }

  async enterCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async verifyProductsPage() {
    await expect(this.productsTitle).toHaveText('Products');
  }
}
====================================================================




How to run :-

Execute the first scenario
Step 1. Generate BDD tests
	npx bddgen
	Converts the .feature scenario into a Playwright-compatible test.

Step 2. Execute the login scenario
	npx playwright test --project=chromium
	Runs the generated BDD scenario in Chromium.

Step 3. Open the HTML report
	npx playwright show-report reports/html-report
	Displays the execution results.
	
---------------------------------------------------------------



What happens when we add multiple scenarios?

Now imagine we add these scenarios to the framework:

==================================================================
Feature: SauceDemo Login Functionality

  @smoke
  Scenario: Login with valid credentials
    Given user navigates to SauceDemo login page
    When user enters valid username and password
    And user clicks on login button
    Then user should see the products page

  @regression
  Scenario: Login with invalid credentials
    Given user navigates to SauceDemo login page
    When user enters invalid username and password
    And user clicks on login button
    Then user should see an error message

  @regression
  Scenario: Login with locked out user
    Given user navigates to SauceDemo login page
    When user enters locked out user credentials
    And user clicks on login button
    Then user should see locked out error message
===================================================================

Problems with our current approach
Our first implementation works, but as the framework grows, some design problems become noticeable.

Problem 1 — Repeated object creation
===============================================
Given('user navigates to SauceDemo login page',
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
  }
);

When('user clicks on login button',
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.clickLogin();
  }
);
===============================================

We create the same type of Page Object repeatedly.

This is not a serious performance problem, but it adds unnecessary code and makes dependency management repetitive.

Problem 2 — More page classes

As we automate additional SauceDemo functionality, our tests may require:
const loginPage = new LoginPage(page);
const productsPage = new ProductsPage(page);
const cartPage = new CartPage(page);
const checkoutPage = new CheckoutPage(page);

Repeating these declarations across step definitions makes the framework harder to maintain.

Problem 3 — Managing test dependencies

As the framework grows, we may need to initialize test data, API clients, page classes, and reusable services.
We want each scenario to receive its required dependencies automatically.

Important: Playwright already provides a separate page and browser context for each test by default. Custom fixtures are not required to achieve basic scenario isolation. They primarily help us organize and inject reusable dependencies.

----------------------------------------------------------------------
 Introduce custom fixtures
	Now we will solve these problems using Playwright fixtures.
	Create fixtures.ts

Create this file:

src/config/fixtures.ts
=============================================================
import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/loginpage';

type MyFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  }
});

export const { Given, When, Then } = createBdd(test);
==============================================================

What this does:
1. Extends the Playwright test object with a custom loginPage fixture.
2. Creates a LoginPage instance using the built-in page.
3. Supplies that instance to steps that request loginPage.
4. Lets Playwright manage the fixture lifecycle for each scenario.

Update playwright.config.ts
Change only the steps configuration:
======================================================
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: [
    'src/config/fixtures.ts',
    'src/step-definitions/**/*.ts'
  ]
});
======================================================

Purpose: Ensures playwright-bdd discovers the custom fixture and its step definitions.
Keep the remaining Playwright configuration unchanged.


Update loginSteps.ts
Replace the earlier step definitions with:
=========================================================
import { Given, When, Then } from '../config/fixtures';

Given('user navigates to SauceDemo login page',
  async ({ loginPage }) => {
    await loginPage.navigate();
  }
);

When('user enters valid username and password',
  async ({ loginPage }) => {
    await loginPage.enterCredentials(
      process.env.USERNAME1!,
      process.env.PASSWORD1!
    );
  }
);

When('user clicks on login button',
  async ({ loginPage }) => {
    await loginPage.clickLogin();
  }
);

Then('user should see the products page',
  async ({ loginPage }) => {
    await loginPage.verifyProductsPage();
  }
);

========================================================
What changed?

Before:
async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
}


After:
async ({ loginPage }) => {
  await loginPage.navigate();
}


The fixture automatically supplies the Page Object.

======================================================

Execute the scenario again
First regenerate the BDD tests:
npx bddgen
Then run:
npx playwright test --project=chromium
Purpose: Verifies that the same login scenario works with our custom fixture implementation.

---------------------------------------------------------------

---------------------------------------------------------------

Now lets continue after custom fixtures

We will add the files in this order:
1. Products page
2. Products Sorting
3. Add to Cart
4. Remove from Cart
5. Checkout

Each section shows the changes needed at that stage. Keep the methods from the previous section when adding new methods.

---------------------------------------------------------------

First lets correct and verify the existing setup

Reference file: Current project files

What we will do?
Keep the existing Login scenarios working before adding another feature.

1. Update tsconfig.json


===========================================
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "types": ["node"],
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": [
    "src/**/*.ts",
    "playwright.config.ts"
  ],
  "exclude": [
    "node_modules",
    ".features-gen",
    "reports",
    "test-results"
  ]
}
===========================================

Purpose: module ESNext is compatible with moduleResolution Bundler.

2. Install TypeScript


===========================================
npm install --save-dev typescript
===========================================

Purpose: Adds the compiler for checking page classes and steps. package-lock.json is updated by npm.

3. Verify environment variable names


===========================================
BASE_URL=https://www.saucedemo.com/
USERNAME1=standard_user
PASSWORD1=secret_sauce
===========================================

Purpose: The current project uses USERNAME1 and PASSWORD1. Use those names in existing and new login steps. Keep actual values in the local .env.

4. Keep existing filename casing


===========================================
import { LoginPage } from '../pages/loginpage';
===========================================

Purpose: Reuse src/pages/loginpage.ts and src/step-definitions/loginsteps.ts. Imports must match the actual filenames.

5. Update package.json scripts


===========================================
{
  "scripts": {
    "bddgen": "node node_modules/playwright-bdd/dist/cli/index.js",
    "typecheck": "node node_modules/typescript/bin/tsc --noEmit",
    "test": "npm run bddgen && node node_modules/@playwright/test/cli.js test",
    "test:smoke": "npm run bddgen && node node_modules/@playwright/test/cli.js test --grep @smoke",
    "report": "node node_modules/@playwright/test/cli.js show-report reports/html-report"
  }
}
===========================================

Purpose: Adds commands for generation, type checking, execution and reports. Direct Node commands also work when local Windows command wrappers are missing.

6. Update .gitignore


===========================================
# Playwright
node_modules/
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
/playwright/.auth/

# Framework generated files and local configuration
.features-gen/
reports/
screenshots/
.env
===========================================

Purpose: Prevents local credentials and generated artifacts from being committed.


---------------------------------------------------------------

Now lets start with Products page scenario

Reference file: doc/productfeature.md

What we will do?
Login successfully, verify the Products page, verify the product list and check that six products are displayed.

1. Create features/products.feature


===========================================
@products
Feature: SauceDemo Products Functionality

  @smoke
  Scenario: Verify products are displayed after login
    Given user is logged into SauceDemo
    When user navigates to the products page
    Then user should see the products list
    And user should see 6 products
===========================================

Purpose: Adds the first Products scenario.

2. Create src/pages/ProductsPage.ts


===========================================
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
===========================================

Purpose: Keeps Products page locators and assertions in a Page Object.

3. Update src/config/fixtures.ts


===========================================
import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/loginpage';
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
===========================================

Purpose: Adds productsPage while keeping loginPage. Both use the same page within each scenario.

4. Create src/step-definitions/productsSteps.ts


===========================================
import { Given, When, Then } from '../config/fixtures';

Given('user is logged into SauceDemo',
  async ({ loginPage }) => {

    await loginPage.navigate();

    await loginPage.enterCredentials(
      process.env.USERNAME1!,
      process.env.PASSWORD1!
    );

    await loginPage.clickLogin();
    await loginPage.verifyProductsPage();
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
===========================================

Purpose: Defines shared login once, waits for Products, and connects the feature steps to the page methods.

5. Verify playwright.config.ts


===========================================
features: 'features/**/*.feature',
steps: ['src/config/fixtures.ts', 'src/step-definitions/**/*.ts', 'src/hooks/**/*.ts']
===========================================

Purpose: The existing feature and step globs discover new files automatically. No new browser configuration is needed.

How to run :-

Step 1. Generate BDD tests
	npm run bddgen

Step 2. Execute products scenarios
	node node_modules/@playwright/test/cli.js test --project=chromium --grep "@products"

Step 3. Open HTML report
	npm run report

Expected cases in this group: 1 at this stage. This is the expected count, not a passed execution result.

---------------------------------------------------------------

Now lets add Products Sorting

Reference file: doc/Products Sorting.md

What we will do?
Verify name ascending, name descending, price ascending and price descending using a Scenario Outline.

1. Update features/products.feature


===========================================
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
===========================================

Purpose: Keep the earlier Products scenario and append this outline. Four Examples rows generate four independent tests.

2. Update src/pages/ProductsPage.ts


===========================================
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
    this.validateSortOrder(order);
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
    }).toPass({ timeout: 10000 });
  }

  async verifyPriceSorting(order: string) {
    this.validateSortOrder(order);
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
    }).toPass({ timeout: 10000 });
  }










  private validateSortOrder(order: string) {
    if (order !== 'ascending' && order !== 'descending') {
      throw new Error(`Unsupported sort order: ${order}`);
    }
  }
}
===========================================

Purpose: Add sorting locators and methods while keeping existing product assertions. Copies preserve actual array order; numeric comparison sorts prices. Invalid orders fail explicitly and assertions retry for up to 10 seconds.

3. Update src/step-definitions/productsSteps.ts


===========================================
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
===========================================

Purpose: Append these two steps. Do not replace the earlier shared login and Products steps.

4. Verify fixtures.ts

Purpose: No change is required. Reuse productsPage from the previous section.

How to run :-

Step 1. Generate BDD tests
	npm run bddgen

Step 2. Execute sorting scenarios
	node node_modules/@playwright/test/cli.js test --project=chromium --grep "@sorting"

Step 3. Open HTML report
	npm run report

Expected cases in this group: 4. This is the expected count, not a passed execution result.

---------------------------------------------------------------

Now lets implement Add to Cart

Reference file: doc/add to cart.md

What we will do?
Add one or more products, verify the badge and verify selected products inside the cart.

1. Create features/cart.feature


===========================================
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
===========================================

Purpose: Background runs login separately before every scenario.

2. Update src/pages/ProductsPage.ts - add locators


===========================================
// Inside the class
private readonly cartBadge: Locator;
private readonly cartIcon: Locator;

// Inside the constructor
this.cartBadge = page.locator('.shopping_cart_badge');
this.cartIcon = page.locator('.shopping_cart_link');
===========================================

Purpose: Declare these inside the class and initialize them inside the existing constructor.

3. Update src/pages/ProductsPage.ts - add methods


===========================================
async addProductToCart(productName: string) {
  
    const product = this.page
      .locator('.inventory_item')
      .filter({
        has: this.page.getByText(productName, { exact: true })
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
===========================================

Purpose: Keep existing product and sorting methods. Exact product-name matching avoids selecting a similarly named product.

4. Create src/pages/CartPage.ts


===========================================
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
      has: this.page.getByText(productName, { exact: true })
    });

    await expect(product).toHaveCount(1);
  }

  async verifyCartProductCount(expectedCount: number) {
    await expect(this.cartItems).toHaveCount(expectedCount);
  }






}
===========================================

Purpose: Verifies the cart page, selected products and product count.

5. Update src/config/fixtures.ts


===========================================
import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/loginpage';
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
===========================================

Purpose: Register cartPage and keep both earlier fixtures.

6. Create src/step-definitions/cartSteps.ts


===========================================
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
===========================================

Purpose: Reuse the login step from productsSteps.ts. Add reusable product, badge and cart steps.

How to run :-

Step 1. Generate BDD tests
	npm run bddgen

Step 2. Execute cart scenarios
	node node_modules/@playwright/test/cli.js test --project=chromium --grep "@cart"

Step 3. Open HTML report
	npm run report

Expected cases in this group: 4. This is the expected count, not a passed execution result.

---------------------------------------------------------------

Now lets implement Remove from Cart

Reference file: doc/cart.md

What we will do?
Remove products on Products or Cart pages, verify badge changes and verify an empty cart.

1. Create features/removeCart.feature


===========================================
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
===========================================

Purpose: Reuses shared login and add-product steps.

2. Update src/pages/ProductsPage.ts


===========================================
async removeProductFromProductsPage(productName: string) {
  
    const product = this.page
      .locator('.inventory_item')
      .filter({
        has: this.page.getByText(productName, { exact: true })
      });
  
    await expect(product).toHaveCount(1);
  
    await product.getByRole('button', {
      name: 'Remove'
    }).click();
  }

  async verifyCartBadgeNotVisible() {
    await expect(this.cartBadge).toBeHidden();
  }
===========================================

Purpose: Append removal and hidden-badge methods. Keep all previous methods.

3. Update src/pages/CartPage.ts


===========================================
async removeProductFromCart(productName: string) {
  
    const product = this.cartItems.filter({
      has: this.page.getByText(productName, { exact: true })
    });
  
    await expect(product).toHaveCount(1);
  
    await product.getByRole('button', {
      name: 'Remove'
    }).click();
  }

  async verifyCartEmpty() {
    await expect(this.cartItems).toHaveCount(0);
  }
===========================================

Purpose: Append removal and empty-cart checks. Keep existing cart assertions.

4. Create src/step-definitions/removeCartSteps.ts


===========================================
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
===========================================

Purpose: Adds only new removal and empty-cart steps; earlier steps remain reusable.

5. Verify fixtures.ts

Purpose: No changes are needed. ProductsPage and CartPage already have fixtures.

How to run :-

Step 1. Generate BDD tests
	npm run bddgen

Step 2. Execute removeCart scenarios
	node node_modules/@playwright/test/cli.js test --project=chromium --grep "@removeCart"

Step 3. Open HTML report
	npm run report

Expected cases in this group: 4. This is the expected count, not a passed execution result.

---------------------------------------------------------------

Now lets implement Checkout

Reference file: doc/checkout.md

What we will do?
Login, add a Backpack, open Cart, proceed to Checkout, and verify success, required fields, cancellation and overview details.

1. Create features/checkout.feature


===========================================
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
===========================================

Purpose: Background performs setup before every scenario. The required-fields outline produces three negative cases.

2. Update src/pages/CartPage.ts - add checkout locator


===========================================
// Inside the class
private readonly checkoutButton: Locator;

// Inside the constructor
this.checkoutButton = page.locator('[data-test="checkout"]');
===========================================

Purpose: Add the declaration and constructor initialization while keeping existing cart code.

3. Update src/pages/CartPage.ts - add checkout method


===========================================
async proceedToCheckout() {
    await this.checkoutButton.click();
  }
===========================================

Purpose: Clicks the Checkout button from the cart.

4. Create src/config/testData.ts


===========================================
export const checkoutData = {
  firstName: 'John',
  lastName: 'Smith',
  postalCode: '12345'
};
===========================================

Purpose: Stores reusable valid customer information.

5. Create src/pages/CheckoutPage.ts


===========================================
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
===========================================

Purpose: Handles form fields, validation, overview, cancellation and completion. The price method checks the single selected item subtotal before tax.

6. Update src/config/fixtures.ts


===========================================
import { test as base, createBdd } from 'playwright-bdd';

import { LoginPage } from '../pages/loginpage';
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
===========================================

Purpose: Add checkoutPage while preserving all previous fixtures.

7. Create src/step-definitions/checkoutSteps.ts


===========================================
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
===========================================

Purpose: Reuses login, adding a product and opening Cart from earlier sections.

How to run :-

Step 1. Generate BDD tests
	npm run bddgen

Step 2. Execute checkout scenarios
	node node_modules/@playwright/test/cli.js test --project=chromium --grep "@checkout"

Step 3. Open HTML report
	npm run report

Expected cases in this group: 6. This is the expected count, not a passed execution result.

---------------------------------------------------------------

How to run all scenarios :-

Step 1. Install dependencies on a fresh checkout
	npm ci

Step 2. Install Chromium
	node node_modules/@playwright/test/cli.js install chromium

Step 3. Check TypeScript
	npm run typecheck

Step 4. Generate and list tests
	npm run bddgen
	node node_modules/@playwright/test/cli.js test --list

Step 5. Execute all scenarios
	npm test

Step 6. Execute smoke scenarios
	npm run test:smoke

Step 7. Open the HTML report
	npm run report

What have we added?
1. Existing Login - 3 cases
2. Products display - 1 case
3. Products Sorting - 4 cases
4. Add to Cart - 4 cases
5. Remove from Cart - 4 cases
6. Checkout - 6 cases
Total: 22 test cases in 5 feature files.

Actual verification performed on 10 November 2026
===========================================
TypeScript check: passed.
BDD generation: passed.
Test discovery: 22 tests in 5 feature files.
Browser execution: all 22 tests failed at browser launch because the expected Chromium executable was missing. No scenario steps executed.
The browser installation command returned without error, but the executable remained unavailable on retry.
Repair/install Chromium and rerun npm test before recording functional tests as passed.

Allure is installed as a dependency but is not configured as a reporter. The current report is Playwright HTML.
