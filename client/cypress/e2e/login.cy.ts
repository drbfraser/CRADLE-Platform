import { ADMIN_CREDENTIALS } from '../../playwright/constants';

describe('login spec', () => {
  it('load website', () => {
    cy.visit('http://localhost:3000/login')
    cy.get('h1').should('contain', 'Log In')
  });

  it('No Password login', () => {
    cy.visit('http://localhost:3000/login')
    cy.get('input[name=email]').type('admin123@admin.com')
    cy.get('.MuiButtonBase-root').contains('Login').click()
    cy.get('.makeStyles-formError-27').should('contain', 'Password is required.')
  });

  it('No Email login', () => {
    cy.visit('http://localhost:3000/login')
    cy.get('input[name=password]').type('admin123')
    cy.get('.MuiButtonBase-root').contains('Login').click()
    cy.get('.makeStyles-formError-27').should('contain', 'Email is required.')
  });

  it('Login', () => {
    cy.visit('http://localhost:3000/login')
    cy.get('input[name=email]').type('admin123@admin.com')
    cy.get('input[name=password]').type('admin123')
    cy.get('.MuiButtonBase-root').contains('Login').click()
    .wait(5000)
    cy.get('.makeStyles-toolbarButtons-13 > div > .MuiTypography-body1')
      .should('contain', 'Admin (Admin)') 
  });

  it('shows loading spinner after clicking Login', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name=email]').type('admin123@admin.com');
    cy.get('input[name=password]').type('admin123');

    cy.get('.MuiButtonBase-root').contains('Login').click();

    // Optionally wait a moment for DOM to render spinner
    cy.wait(100);

    // Check for CircularProgress spinner (role="progressbar")
    cy.get('[role="progressbar"]').should('be.visible');
  });
});
