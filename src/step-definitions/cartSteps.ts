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
