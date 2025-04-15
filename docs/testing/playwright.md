# Automated End-to-End Testing with Playwright

## Playwright

Playwright is a browser automation tool for testing web applications inside of the browser. As such, our Playwright test scripts are used to perform tests of user activities on the Cradle web app from start to finish. These tests simulate the interactions that a real user would have with the web app, but are more consistent and efficient than manual testing. Since the tests run in the browser and make real network requests, these tests allow us to verify that the web app client and the server are both working together correctly.

Due to differences in browser implementations, it is important to test our web application in multiple different browsers. The Playwright test scripts are configured to run each test in Chromium, Firefox, and WebKit. Chromium is the open-source web browser that Google Chrome is built on, as well as several other web browsers, including Microsoft Edge. WebKit is the web browser engine that Safari uses.

**Note:** The Playwright scripts are run in a Node environment, not in the browser, so they don’t have access to browser global objects like `document`, `window`, `localStorage`, etc. However, these browser globals can be accessed through the browser that is being manipulated by the Playwright script. If you find yourself needing to access browser globals in the Playwright scripts, see https://playwright.dev/docs/evaluating for details on how to do so.

## Locators

Locators are a key component of any Playwright script. They are the mechanism by which elements of the UI are accessed so that they can be interacted with. There are several ways to find an element with a locator, and some are preferable for certain types of elements.

The recommended way of locating most element types is by using the [`getByRole()`](https://playwright.dev/docs/locators#locate-by-role) locator, which uses accessibility traits to identify an element. To figure out what a particular element’s accessibility role is, you can use the element inspector in the chrome dev tools.

While it is possible to locate elements using CSS selectors, it is not recommended, as they are tightly coupled to the styling of the page and are very sensitive to changes that could break the tests. See https://playwright.dev/docs/locators#locating-elements for more details on best-practices regarding locators.

There may be situations where you want to locate an element based on its relationship to another element, such as locating an element based on one or more of its descendants, siblings, or ancestor elements. For example, consider the task of locating a Referral Pending card with a specific comment on a patient summary page.

![referral-pending-card](https://media.github.sfu.ca/user/2507/files/1d00cadb-958c-479c-b89d-4df126ecfeba)

We want to locate the text of the comment on the page, but we want to make sure that the text is within a Referral Pending card, rather than just anywhere. The top-level element that contains the whole card is just a `div`, and it doesn’t have a specific accessibility role, so using `getByRole()` isn’t helpful here. We could just locate based on the text of the comment, but that would only return the element that directly contains the text. If we want to locate the ancestor element that contains the entire card, we need to do something else. We can’t locate based on the “Referral Pending” heading either, since there could be more than one Referral Pending card, and that would only return the element that directly contains the “Referral Pending” text. To locate the element that contains both the “Referral Pending” header and the “Referral Comment” text, we can use the `filter()` method, like so:

```ts
const referralPendingCard = page
  .locator('div')
  .filter({
    has: page.getByRole('heading', { name: 'Referral Pending' }),
  })
  .filter({ has: page.getByText('Referral Comment') });
```

Here, we are chaining together two calls to `filter()` in order to locate a `<div>` element which has both a descendant with the “heading” accessibility role and accessibility name of “Referral Pending”, as well as a descendant that contains the text, “Referral Comment”. This locator will match any Referral Pending card, but we can chain locators together to search for an element within another element.

```ts
expect(referralPendingCard.getByText('Some comment'));
```

This will match an element containing the string `'some comment'`, but only if it is the descendant of a Referral Pending card.

**Note:** Text matching is case-insensitive by default, so locating an element based on the string “submit” will match both “submit” and “Submit”. Text matching will also match substrings by default as well.

For more details on the different types of locators, see https://playwright.dev/docs/locators.

## Asynchronicity

Unlike some other testing framework, like Cypress, Playwright uses native JavaScript async/await. Since UI interactions don’t have instantaneous results, and often involve waiting for network requests to resolve, many of the function calls in Playwright test scripts will need to be awaited. A particular nuance is that locators do not need to be awaited when specifying a locator method, but they do need to be awaited when performing an action on that locator. This is because the locator doesn’t actually resolve until some action is called on it, such as calling the `click()` action on a button. For example:

```ts
// Locating an element doesn't need to be awaited.
const submitButton = page.getByRole('button', { name: 'submit' });

// Performing an action on the locator does need to be awaited.
await submitButton.click();
```

## The `test` Function

The `test` function is used to define tests. It is also an object, with methods that you can call. When called as a function, the first argument is the title of the test and the second argument is the test callback function, which defines the test. A basic test looks like this:

```ts
import { test, expect } from '@playwright/test';

test('Example Test', async ({ page }) => {
  await page.goto('http://www.some-url.com');
  const textField = page.getByRole('textbox', { name: 'Text Field' });
  await textField.fill('This text is entered into the text input field.');

  const submitButton = page.getByRole('button', { name: 'submit' });
  await submitButton.click();

  await expect(page).toHaveUrl('https://www.some-other-url.com');
});
```

## The `expect` Function

The `expect()` function is used to make an assertion. If that assertion fails, then the test fails. We typically want to assert that some element is present, or that our actions have resulted in us navigating to some other url, in order to confirm that our actions have had the expected outcome. Be sure to use the built-in assertions that are defined for the `expect()` function. For available assertions, see https://playwright.dev/docs/test-assertions.

## The `describe` Method

The `describe()` method of the `test` function/object is used to group tests together. The first argument is the name of the group of tests, and the second argument is a callback function that the grouped tests are defined within.

```ts
test.describe('A Group of Tests', () => {
  test('Test 1', async () => {
    // ...
  });
  test('Test 2', async () => {
    // ...
  });
});
```

Groups of tests can also be nested within groups:

```ts
test.describe('A Group of Tests', () => {
  test.describe('Sub-group 1', () => {
    test('Test 1-1', async () => {
      // ...
    });
    test('Test 1-2', async () => {
      // ...
    });
  });
  test.describe('Sub-group 2', () => {
    test('Test 2-1', async () => {
      // ...
    });
    test('Test 2-2', async () => {
      // ...
    });
  });
});
```

## Hooks

Hooks allow us to reduce duplication by extracting common logic that runs either before or after the tests. These hooks are `test.beforeEach()`, `test.afterEach()`, `test.beforeAll()`, and `test.afterAll()`. The “each” hooks run once for each test, and the “all” hooks run only once for the entire set of tests. Test hooks can be called inside of a `test.describe()` group and will run only for tests defined within that group.

Consider a scenario where we want to run multiple tests on a particular page and the tests mostly involve the exact same steps, with only one step differing between them. Rather than replicating each and every step across each test, we can extract the common steps into `test.beforeEach()` and `test.afterEach()` hooks.

```ts
test.describe('A Group of Tests', () => {
  test.beforeEach(async () => {
    // Step 1
    // Step 2
  });
  test('Test A', async () => {
    // Step 3-A
  });
  test('Test B', async () => {
    // Step 3-B
  });
  test('Test C', async () => {
    // Step 3-C
  });
  test.afterEach(async () => {
    // Step 4
    // Step 5
  });
});
```

## Fixtures

Fixtures are used to provide functionality and information to a test. The page object is a built-in fixture and is the primary mechanism for interacting with the browser from a Playwright script. Fixtures are another means by which we can reduce code duplication, by defining common functionality once inside of a fixture and then providing that fixture to be used by our tests.

Fixtures can be defined by extending Playwright’s `test` function/object with the `extend()` method.

```ts
import { test as baseTest, expect } from '@playwright/test';

type Fixtures = {
  patientName: string;
};

const test = baseTest.extend<Fixtures>({
  patientName: async ({ browserName }, use) => {
    use(`test-patient-${browserName}`);
  },
});

test('Example Test', async ({ page, patientName }) => {
  await expect(page.getByText(patientName)).toBeVisible();
});
```

In this example, `browserName` is also a built-in fixture. As can be seen, fixtures can use other fixtures that have already been defined.

When calling `test.extend()`, we provide a type which defines the fixtures we want to add. We then pass it an object with callback functions for each property of the type. The callback function creates the fixture and then passes it to the `use()` function. The `use()` function simply makes the fixture available to any test defined with the extended `test` function/object. The fixture can then be accessed through destructuring the parameter object of the `test` function, just as with the `page` fixture.

Playwright tests are completely isolated from one another, so each test gets its own distinct copy of each fixture. In the case of a built-in fixture like `browserName`, the fixture will have a different value depending on which browser the test is running in.

For the Cradle Platform, common fixtures are defined in `/client/playwright/fixtures.ts`, and the extended `test` object is exported so that it can be used by all of our test scripts. A fixture is only created when it is used by a test, so a test can use whichever fixtures it needs and ignore the ones it doesn’t.

The `api` fixture was created to provide a mechanism for making HTTP requests to the Flask server directly, without going through the web app’s UI. This can be used to perform setup before a test is run, performing clean up after a test, or for testing an expected outcome of a test. The `api` fixture is configured to attach an access token to the `Authorization` header of each outgoing request. It also has its base URL set as `http://127.0.0.1:5000`, so only the endpoint needs to be used in the url of outgoing requests.

The `testPatient` fixture uses the `api` fixture to create a new Patient for each test. Playwright runs tests in parallel, so using a unique patient for each test that requires a pre-existing patient allows us to keep each test isolated and avoid collisions. The `testPatient` fixture also takes care of cleanup by deleting the patient after the test has finished, regardless of whether the test passed or failed.

## Page Object Models

The Page Object Model design pattern uses classes to model pages as a way of encapsulating the logic for interacting with that page. This helps to reduce duplication, as we can define our locators in one place, rather than repeating them across several tests.

The Page Object Models are defined in `/client/playwright/page-object-models`. To avoid potential naming conflicts with our React page components, the names of the classes for the Page Object Models have been suffixed with `PageModel`. A base class, `PageObjectModel` has been defined which implements common logic for all of our Page Objects to inherit from. The Page Objects are provided to the tests as fixtures.

## Global Setup

A global setup function is used to authenticate via the Cradle REST API and saves the access token to a temporary file. Each test is automatically configured to load the access token from this temporary file and into its browser’s local storage. This allows us to perform the authentication just once rather than each test needing to authenticate individually. This setup is done in the file located at `/client/playwright/auth.setup.ts`. If additional global setup is needed in the future, the Playwright config is setup to execute tests in files that match the pattern, `*.setup.ts`.

## Global Teardown

Global teardown logic is defined in the file at `/client/playwright/teardown.ts`. The functions in this file are executed after all tests have completed. Currently, the only teardown logic that has been defined is to use the `api` fixture to delete any patients that have been created during the execution of the "Create Patient" tests, since these patients are not created as fixtures, and thus, do not automatically clean themselves up. If other entities are created for tests in the future, they can be cleaned up here.

## Running the Tests

Before running the tests, ensure that the back-end Flask server is running. Then, ensure that you are in the `/client/` directory. Some script aliases have been defined as shortcuts for running the tests. They can be invoked with the command `npx playwright test`, or with the alias `npm run e2e`.

Playwright runs the tests in ‘headless’ mode by default, meaning it won’t open the browser but will run the tests in the background, and the results will be displayed in an HTML report. Playwright does have a UI mode, however, which can be very useful when debugging. To run the tests in UI mode, use the command `npx playwright test --ui`, or `npm run e2e:ui`. The UI mode provides some tools similar to the Chrome DevTools. For more information on the UI mode, see https://playwright.dev/docs/running-tests.

## Debugging Playwright Tests

Automated tests can sometimes be “flaky”, a term which refers to the phenomenon where a test run multiple times will sometimes pass and sometimes fail. When this happens, it can be difficult to figure out why, as the errors are not consistently reproducible. A common cause of flaky tests is race conditions. It may be a result of flaws in how the tests are written, such as incorrect use of async/await, or it may be a flaw in the implementation of the “application under test” (AUT).

Playwright begins interacting with elements on the page immediately, and because it is so much faster than a human, it may attempt to interact with an element before the page has finished loading. If a test is failing intermittently, but when the test fails, it always fails at the same point, then it is quite likely that this is what is occurring. The element that the test last interacted with before failing should be examined closely to determine whether it is possible for the element to be interacted with before the data it needs has loaded. For example, the tests for creating a new referral were occasionally failing, and when they failed, would always fail after clicking the “Create Referral” button on the patient summary page. The button was located successfully, and was successfully clicked, but then the page would never get redirected and the test would get stuck waiting forever for the URL to change. The cause of this turned out to be a consequence of how the click event handler for the button was defined.

```ts
const handleCreateReferralClick = () => {
  if (patient) {
    navigate(`/referrals/new/${patient.id}`);
  }
};
```

If the `patient` variable is `null`, then clicking the button doesn’t do anything. However, the button was still enabled, so the user was able to click the button even if `patient` was `null`. The reason the tests were failing was because Playwright would sometimes click the button before the API call to fetch the patient’s data had resolved. Playwright would only click the button once, and then move on to the next step, so if the click didn’t do anything, then the test would get stuck. This happened more often when tests were running in parallel, likely because the response from the dev server was slower due to it needing to service more requests. The fix for this was thankfully very easy, simply disable the button until the patient’s data had loaded.

```tsx
<PrimaryButton
  onClick={handleCreateReferralClick}
  disabled={!patient}
>
  <Add /> Create Referral
</PrimaryButton>
```

This approach should be used for any interactive element that requires some data to be fetched asynchronously. Disable the element until the data has loaded. This will ensure that the Playwright tests wait until the elements become “actionable” before interacting with them, as per Playwright’s [auto-wait](https://playwright.dev/docs/actionability) feature. It also doesn’t hurt to prevent users from interacting with these elements before they are ready either, even if that scenario is less likely.
