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
