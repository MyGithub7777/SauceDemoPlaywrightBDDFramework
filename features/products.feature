@products
Feature: SauceDemo Products Functionality

  @smoke
  Scenario: Verify products are displayed after login
    Given user is logged into SauceDemo
    When user navigates to the products page
    Then user should see the products list
    And user should see 6 products

  @regression @sorting
  Scenario Outline: Verify products sorting functionality
    Given user is logged into SauceDemo
    When user selects "<sortOption>" sorting option
    Then products should be sorted by "<sortType>" in "<order>" order

    Examples:
      | sortOption          | sortType | order      |
      | Name (A to Z)       | name     | ascending  |
      | Name (Z to A)       | name     | descending |
      | Price (low to high) | price    | ascending  |
      | Price (high to low) | price    | descending |
