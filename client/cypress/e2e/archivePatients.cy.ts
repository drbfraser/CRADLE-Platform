describe('ArchivePatient', () => {
  beforeEach(() => {
    cy.login({ email: 'admin123@admin.com', password: 'admin123' })
  });
  it('ArchiveAB', () => {
    cy.visit('http://localhost:3000/patients')
    cy.get('tbody > :nth-child(2) > :nth-child(1) > span').should('contain','AB')
    cy.visit('http://localhost:3000/admin/patients')      
    .wait(5000)
    cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(1)').should('contain','AB')
    cy.get(':nth-child(4) > :nth-child(4) > [aria-label="Archive Patient"]').click()
    .wait(5000)
    cy.get('.MuiDialogActions-root > .MuiButton-contained').click()
    cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(3)').should('contain','TRUE')
    cy.visit('http://localhost:3000/patients')
    cy.contains('AB').should('not.exist')
    cy.visit('http://localhost:3000/admin/patients')      
    .wait(5000)
    cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(1)').should('contain','AB')
    cy.get(':nth-child(4) > :nth-child(4) > [aria-label="Unarchive Patient"]').click()
    .wait(5000)
    cy.get('.MuiDialogActions-root > .MuiButton-contained').click()
    cy.get('.MuiTableBody-root > :nth-child(4) > :nth-child(3)').should('contain','FALSE')
    cy.visit('http://localhost:3000/patients')      
    .wait(5000)
    cy.get('tbody > :nth-child(2) > :nth-child(1) > span').should('contain','AB')

  });
})
