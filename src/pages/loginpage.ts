import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly productsTitle: Locator;
  private readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.productsTitle = page.locator('.title');
    this.errorMessage = page.locator('[data-test="error"]');
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

  async verifyErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
