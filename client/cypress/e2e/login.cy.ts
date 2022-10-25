describe('login spec', () => {
  it('load website', () => {
    cy.visit('localhost:3000/login')
    cy.get('h1').should('contain', 'Log In')
  });
  it('No Password login', () => {
    cy.visit('localhost:3000/login')
    cy.get('input[name=email]').type('admin123@admin.com')
    cy.get('.MuiButtonBase-root').contains('Login').click()
    cy.get('.makeStyles-formError-27').should('contain', 'Password is required.')
  });
  it('No Email login', () => {
    cy.visit('localhost:3000/login')
    cy.get('input[name=password]').type('admin123')
    cy.get('.MuiButtonBase-root').contains('Login').click()
    cy.get('.makeStyles-formError-27').should('contain', 'Email is required.')
  });
  it('Login', () => {
    cy.visit('localhost:3000/login')
    cy.get('input[name=email]').type('admin123@admin.com')
    cy.get('input[name=password]').type('admin123')
    cy.get('.MuiButtonBase-root').contains('Login').click()
    .wait(5000)
    cy.get('.makeStyles-toolbarButtons-13 > div > .MuiTypography-body1').should('contain', 'Admin (Admin)') 
  });

})

