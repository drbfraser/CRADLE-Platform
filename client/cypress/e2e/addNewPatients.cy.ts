describe('New patient', () => {
  beforeEach(() => {
    cy.login({ email: 'admin123@admin.com', password: 'admin123' })
  });
  it('load website', () => {
    cy.visit('http://localhost:3000/patients')      
    cy.get('[data-testid="new patient button"]').should('contain','New Patient')
    cy.get('[data-testid="new patient button"]').click()
    .wait(5000)
    cy.get('.MuiGrid-container > :nth-child(1)').type('2170')
    cy.get('.MuiGrid-container > :nth-child(2)').type("Cradle")
    cy.get('.MuiGrid-container > :nth-child(3)').type("12")
    cy.get('.MuiGrid-container > :nth-child(5)').type("2000-07-21")
    cy.get('.MuiGrid-container > :nth-child(6)').type("AB")
    cy.get('.MuiGrid-container > :nth-child(7)').type("12")
    cy.get('#mui-component-select-patientSex').click()
    cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').click()
    cy.get('.MuiGrid-grid-md-6').type("none")
    cy.get('.MuiButton-contained').click()
    .wait(5000)
    cy.get('.MuiButton-contained').click()
    cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root').type("Yes")
    cy.get('.MuiGrid-container > :nth-child(2)').type("Yes")
    cy.get('.MuiButton-contained').click()
    .wait(5000)
    cy.visit('http://localhost:3000/patients')      
    cy.get('tbody >> :nth-child(2)').should('contain',"2170")
  });
//  it('Test same ID', () => {
//    cy.visit('http://localhost:3000/patients')      
//    cy.get('[data-testid="new patient button"]').should('contain','New Patient')
//    cy.get('[data-testid="new patient button"]').click()
//    cy.get('.MuiGrid-container > :nth-child(1)').type('2170')
//    cy.get('.MuiGrid-container > :nth-child(2)').type("Cradle")
//    cy.get('.MuiGrid-container > :nth-child(3)').type("12")
//    cy.get('.MuiGrid-container > :nth-child(5)').type("2000-07-21")
//    cy.get('.MuiGrid-container > :nth-child(6)').type("AB")
//    cy.get('.MuiGrid-container > :nth-child(7)').type("12")
//    cy.get('.makeStyles-container-599').should('contain','Patient ID 2170 already exists')
//  });

})
