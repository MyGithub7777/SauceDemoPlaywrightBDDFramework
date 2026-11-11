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
