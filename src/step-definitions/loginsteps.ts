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

When('user enters invalid username and password',
  async ({ loginPage }) => {
    await loginPage.enterCredentials(
      'invalid_user',
      'wrong_password'
    );
  }
);

Then('user should see an error message',
  async ({ loginPage }) => {
    await loginPage.verifyErrorMessage(
      'Username and password do not match'
    );
  }
);

When('user enters locked out user credentials',
  async ({ loginPage }) => {
    await loginPage.enterCredentials(
      'locked_out_user',
      'secret_sauce'
    );
  }
);

Then('user should see locked out error message',
  async ({ loginPage }) => {
    await loginPage.verifyErrorMessage(
      'Sorry, this user has been locked out.'
    );
  }
);