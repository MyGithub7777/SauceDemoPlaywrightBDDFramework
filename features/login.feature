Feature: SauceDemo Login Functionality

  @smoke
  Scenario: Login with valid credentials
    Given user navigates to SauceDemo login page
    When user enters valid username and password
    And user clicks on login button
    Then user should see the products page

  @regression
  Scenario: Login with invalid credentials
    Given user navigates to SauceDemo login page
    When user enters invalid username and password
    And user clicks on login button
    Then user should see an error message

  @regression
  Scenario: Login with locked out user
    Given user navigates to SauceDemo login page
    When user enters locked out user credentials
    And user clicks on login button
    Then user should see locked out error message