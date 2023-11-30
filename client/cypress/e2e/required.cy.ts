describe('Required question for form templates', () => {
  beforeEach(() => {
    cy.login({ email: 'admin123@admin.com', password: 'admin123' });
    cy.visit('http://localhost:3000/admin/form-templates');
  });

  it('toggles on without saving', () => {
    cy.get('.MuiTableBody-root')
      .contains('Dinner Party Form English')
      .siblings()
      .children()
      .find('[data-testid="EditIcon"]')
      .click();
    cy.wait(1000);
    cy.get(
      ':nth-child(6) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'English Field Text').should(
      'contain',
      'Any dietary restrictions?'
    );
    cy.get('[data-testid="required-switch"]').click();
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get(
      ':nth-child(6) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'English Field Text').should(
      'contain',
      'Any dietary restrictions?'
    );
    cy.get('[data-testid="required-switch"]')
      .children()
      .should('not.be.checked');
    cy.get('.MuiButton-text').contains('Cancel').click();

    cy.get('.MuiButton-contained').contains('Add Field').click();
    cy.get('.MuiFormControlLabel-label').contains('Text').click();
    cy.get('[data-testid="required-switch"]')
      .children()
      .should('not.be.checked');
    cy.get('[data-testid="required-switch"]').click();
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get('.MuiButton-contained').contains('Add Field').click();
    cy.get('.MuiFormControlLabel-label').contains('Text').click();
    cy.get('[data-testid="required-switch"]')
      .children()
      .should('not.be.checked');
  });

  it('toggles on and saves', () => {
    cy.get('.MuiTableBody-root')
      .contains('Dinner Party Form English')
      .siblings()
      .children()
      .find('[data-testid="EditIcon"]')
      .click();
    cy.wait(1000);
    cy.contains('.MuiOutlinedInput-root', 'Version').type('{backspace}6');
    cy.get(
      ':nth-child(6) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'English Field Text').should(
      'contain',
      'Any dietary restrictions?'
    );
    cy.get('[data-testid="required-switch"]').click();
    cy.get('.MuiButton-contained').contains('Save').click();
    cy.get(
      ':nth-child(6) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'English Field Text').should(
      'contain',
      'Any dietary restrictions?'
    );
    cy.get('[data-testid="required-switch"]').children().should('be.checked');
    cy.get('.MuiButton-text').contains('Cancel').click();

    cy.get('.MuiButton-contained').contains('Add Field').click();
    cy.get('.MuiFormControlLabel-label').contains('Text').click();
    cy.get('[data-testid="required-switch"]')
      .children()
      .should('not.be.checked');
    cy.get('[data-testid="required-switch"]').click();
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get('.MuiButton-contained').contains('Add Field').click();
    cy.get('.MuiFormControlLabel-label').contains('Text').click();
    cy.get('[data-testid="required-switch"]')
      .children()
      .should('not.be.checked');
    cy.get('.MuiButton-text').contains('Cancel').click();
    // save form
    cy.get('.MuiGrid-container > .MuiButtonBase-root')
      .contains('Submit Template')
      .click();
    cy.get('.MuiDialogActions-root > .MuiButton-contained')
      .contains('Submit')
      .click();
    cy.get('.MuiAlert-message', { timeout: 10000 }).should(
      'have.text',
      'Form Template Saved!'
    );
  });

  it('verifies toggle on and save', () => {
    cy.get('.MuiTableBody-root')
      .contains('Dinner Party Form English')
      .siblings()
      .children()
      .find('[data-testid="EditIcon"]')
      .click();
    cy.wait(1000);
    cy.get(':nth-child(5) > .MuiFormLabel-root > .MuiTypography-root').should(
      'contain',
      'Any dietary restrictions? *'
    );
    cy.get(
      ':nth-child(6) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'English Field Text').should(
      'contain',
      'Any dietary restrictions?'
    );
    cy.get('[data-testid="required-switch"]').children().should('be.checked');
    cy.get('.MuiButton-text').contains('Cancel').click();
  });
});
