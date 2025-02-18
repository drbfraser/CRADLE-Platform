import { ADMIN_CREDENTIALS } from '../../playwright/constants';

describe('login spec', () => {
  it('Login', () => {
    cy.visit('/');
    cy.contains('Login');
    cy.get('input[name=username]').type(ADMIN_CREDENTIALS.username);
    cy.get('input[name=password]').type(ADMIN_CREDENTIALS.password);

    cy.get('button').should('contain', 'Login').click();

    // Check that we have been redirected to Referrals page.
    cy.url().should('contain', '/referrals');
  });
  // it('No Password Login', () => {
  //   cy.visit(BASE_URL);
  //   cy.get('input[name=username]').type(ADMIN_CREDENTIALS.username);

  //   cy.get('button').should('contain', 'Login').click();
  //   // Check that URL hasn't changed.
  //   cy.url().should('eq', BASE_URL);
  // });
  // it('No Email Login', () => {
  //   cy.visit(BASE_URL);
  //   cy.get('input[name=password]').type(ADMIN_CREDENTIALS.password);

  //   cy.get('button').should('contain', 'Login').click();
  //   // Check that URL hasn't changed.
  //   cy.url().should('eq', BASE_URL);
  // });
  // it('No Credentials Login', () => {
  //   cy.visit(BASE_URL);

  //   cy.get('button').should('contain', 'Login').click();
  //   // Check that URL hasn't changed.
  //   cy.url().should('eq', BASE_URL);
  // });
});
