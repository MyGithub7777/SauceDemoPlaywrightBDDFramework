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
