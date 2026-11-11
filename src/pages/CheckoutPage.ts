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
