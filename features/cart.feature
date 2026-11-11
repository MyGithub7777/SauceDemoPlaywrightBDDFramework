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
