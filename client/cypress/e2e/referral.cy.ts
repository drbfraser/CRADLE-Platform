describe('Create Referral', () => {
  beforeEach(() => {
    cy.login({ email: 'admin123@admin.com', password: 'admin123' })
  });
  it('load website', () => {
    cy.visit('http://localhost:3000/patients/1234') 
    cy.get('.MuiGrid2-container > :nth-child(1)').should('contain','ID: 1234')
  });
  it('Create Empty Referal', () => {
    cy.visit('http://localhost:3000/patients/1234')
    .wait(1000)
    cy.contains('Create Referral').click()
    .wait(1000)
    cy.get('.MuiButton-root').contains('Submit Referral').click()
    cy.get(':nth-child(2) > .MuiFormControl-root > .MuiInputBase-root').click()
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root').should('contain','Health Facility is a required field')
  });
  it('Create Referal', () => {
    cy.visit('http://localhost:3000/patients/1234')
    .wait(1000)
    cy.contains('Create Referral').click()
    .wait(1000)
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').click()
    cy.contains('H1000').click()
    cy.get('.MuiButton-root').contains('Submit Referral').click()
    cy.get('.css-2ui6qg-MuiGrid-root > .MuiPaper-elevation').should('contain','H1000')
  });
})
