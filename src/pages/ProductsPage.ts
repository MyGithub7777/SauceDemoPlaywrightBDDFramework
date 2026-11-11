import { Page, Locator, expect } from '@playwright/test';

export class ProductsPage {

  private readonly productsTitle: Locator;
  private readonly productsList: Locator;
  private readonly productItems: Locator;
  private readonly sortDropdown: Locator;
  private readonly productNames: Locator;
  private readonly productPrices: Locator;

  private readonly cartBadge: Locator;
  private readonly cartIcon: Locator;

  constructor(private readonly page: Page) {
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartIcon = page.locator('.shopping_cart_link');
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


  private validateSortOrder(order: string) {
    if (order !== 'ascending' && order !== 'descending') {
      throw new Error(`Unsupported sort order: ${order}`);
    }
  }
}
