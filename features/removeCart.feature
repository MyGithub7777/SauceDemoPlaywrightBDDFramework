@removeCart
Feature: SauceDemo Remove from Cart Functionality

  Background:
    Given user is logged into SauceDemo

  @smoke
  Scenario: Remove single product from cart
    When user adds "Sauce Labs Backpack" to the cart
    And user removes "Sauce Labs Backpack" from products page
    Then cart badge should not be visible

  @regression
  Scenario: Verify cart badge updates after removing a product
    When user adds "Sauce Labs Backpack" to the cart
    And user adds "Sauce Labs Bike Light" to the cart
    Then cart badge should display 2
    When user removes "Sauce Labs Backpack" from products page
    Then cart badge should display 1

  @regression
  Scenario: Remove all products from cart
    When user adds "Sauce Labs Backpack" to the cart
    And user adds "Sauce Labs Bike Light" to the cart
    And user removes "Sauce Labs Backpack" from products page
    And user removes "Sauce Labs Bike Light" from products page
    Then cart badge should not be visible

  @regression
  Scenario: Verify empty cart after removing products
    When user adds "Sauce Labs Backpack" to the cart
    And user adds "Sauce Labs Bike Light" to the cart
    And user opens the shopping cart
    And user removes "Sauce Labs Backpack" from cart page
    And user removes "Sauce Labs Bike Light" from cart page
    Then cart should be empty
    And cart badge should not be visible
