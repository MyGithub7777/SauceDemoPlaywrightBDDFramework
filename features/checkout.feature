@checkout
Feature: SauceDemo Checkout Functionality

  Background:
    Given user is logged into SauceDemo
    And user adds "Sauce Labs Backpack" to the cart
    And user opens the shopping cart
    And user proceeds to checkout

  @smoke
  Scenario: Complete checkout with valid customer details
    When user enters valid checkout information
    And user continues to checkout overview
    And user completes the order
    Then order confirmation should be displayed

  @regression
  Scenario Outline: Verify required checkout fields
    When user enters first name "<firstName>" last name "<lastName>" and postal code "<postalCode>"
    And user continues to checkout overview
    Then checkout error message should be "<errorMessage>"

    Examples:
      | firstName | lastName | postalCode | errorMessage                   |
      |           | Smith    | 12345      | Error: First Name is required |
      | John      |          | 12345      | Error: Last Name is required  |
      | John      | Smith    |            | Error: Postal Code is required|

  @regression
  Scenario: Cancel checkout
    When user cancels checkout
    Then user should return to the cart page

  @regression
  Scenario: Verify checkout overview details
    When user enters valid checkout information
    And user continues to checkout overview
    Then checkout overview should display "Sauce Labs Backpack"
    And checkout overview should display correct price
