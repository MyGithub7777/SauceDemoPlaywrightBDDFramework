import { Page, Locator, expect } from '@playwright/test';

export class CartPage {

  private readonly cartTitle: Locator;
  private readonly cartItems: Locator;

  private readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.checkoutButton = page.locator('[data-test="checkout"]');
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

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

}
