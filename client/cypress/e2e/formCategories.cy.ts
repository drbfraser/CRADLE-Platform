describe('Form templates', () => {
  beforeEach(() => {
    cy.login({ email: 'admin123@admin.com', password: 'admin123' });
    cy.visit('http://localhost:3000/admin/form-templates');
  });

  it('create form with categories', () => {
    cy.get('[data-testid="AddIcon"]').click();
    cy.url().should('include', '/admin/form-templates/new');
    cy.contains('.MuiOutlinedInput-root', 'Title').type('NEET Check-in');
    cy.contains('.MuiOutlinedInput-root', 'Version').clear().type('1');

    // add first category
    cy.get('.MuiButton-contained').contains('Add Category').click();
    cy.contains('.MuiOutlinedInput-root', 'English Category Name').type(
      'Career Path'
    );
    cy.get('.MuiButton-contained').contains('Save').click();

    cy.get('.MuiTypography-root')
      .contains('Career Path')
      .parent()
      .next()
      .find('.MuiButton-contained')
      .click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text').type(
      'What field are you in?'
    );
    cy.get('.MuiFormControlLabel-label').contains('Text').click();
    cy.get('.MuiButton-contained').contains('Save').click();

    // add second category
    cy.get('.MuiButton-contained').contains('Add Category').click();
    cy.contains('.MuiOutlinedInput-root', 'English Category Name').type(
      'Current Status'
    );
    cy.get('.MuiButton-contained').contains('Save').click();

    cy.get('.MuiTypography-root')
      .contains('Current Status')
      .parent()
      .next()
      .find('.MuiButton-contained')
      .click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text').type(
      'Select all that are true:'
    );
    cy.get('.MuiFormControlLabel-label').contains('Multi Select').click();
    cy.get('.MuiButton-contained').contains('Add Option').click();
    cy.contains('.MuiOutlinedInput-root', 'English Option 1').type(
      'I am in employment.'
    );
    cy.get('.MuiButton-contained').contains('Add Option').click();
    cy.contains('.MuiOutlinedInput-root', 'English Option 2').type(
      'I am in education.'
    );
    cy.get('.MuiButton-contained').contains('Add Option').click();
    cy.contains('.MuiOutlinedInput-root', 'English Option 3').type(
      'I am in training'
    );
    cy.get('.MuiButton-contained').contains('Add Option').click();
    cy.contains('.MuiOutlinedInput-root', 'English Option 4').type(
      'None of the above'
    );
    cy.get('.MuiButton-contained').contains('Save').click();

    cy.get('.MuiTypography-root')
      .contains('Current Status')
      .parent()
      .next()
      .find('.MuiButton-contained')
      .click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text').type(
      'Please provide details to your answer above:'
    );
    cy.get('.MuiFormControlLabel-label').contains('Text').click();
    cy.get('.MuiButton-contained').contains('Save').click();

    // submit form and verify
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

  it('moves a category down', () => {
    cy.get('.MuiTableBody-root')
      .contains('NEET Check-in')
      .siblings()
      .children()
      .find('[data-testid="EditIcon"]')
      .click();
    cy.wait(1000);
    cy.get(
      ':nth-child(3) > :nth-child(3) > .MuiButtonBase-root > [data-testid="KeyboardArrowDownIcon"]'
    ).click();
    cy.get(
      ':nth-child(2) > :nth-child(3) > :nth-child(2) > .MuiButtonBase-root'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Category Name')
      .children()
      .should('have.value', 'Current Status');
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get(
      ':nth-child(6) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text')
      .children()
      .should('have.value', 'Select all that are true:');
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get(
      ':nth-child(9) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text')
      .children()
      .should('contain', 'Please provide details');
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get(
      ':nth-child(13) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Category Name')
      .children()
      .should('have.value', 'Career Path');
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get(
      ':nth-child(16) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text')
      .children()
      .should('contain', 'What field');
    cy.get('.MuiButton-text').contains('Cancel').click();
  });

  it('moves a category up', () => {
    cy.get('.MuiTableBody-root')
      .contains('NEET Check-in')
      .siblings()
      .children()
      .find('[data-testid="EditIcon"]')
      .click();
    cy.wait(1000);
    cy.get(
      ':nth-child(3) > :nth-child(1) > .MuiButtonBase-root > [data-testid="KeyboardArrowUpIcon"]'
    ).click();
    cy.get(
      ':nth-child(2) > :nth-child(3) > :nth-child(2) > .MuiButtonBase-root'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Category Name')
      .children()
      .should('have.value', 'Career Path');
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get(
      ':nth-child(6) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text')
      .children()
      .should('contain', 'What field');
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get(
      ':nth-child(10) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Category Name')
      .children()
      .should('have.value', 'Current Status');
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get(
      ':nth-child(13) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text')
      .children()
      .should('contain', 'Select all that are true');
    cy.get('.MuiButton-text').contains('Cancel').click();
    cy.get(
      ':nth-child(16) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text')
      .children()
      .should('contain', 'Please provide details');
    cy.get('.MuiButton-text').contains('Cancel').click();
  });

  it('deletes a category', () => {
    cy.get('.MuiTableBody-root')
      .contains('NEET Check-in')
      .siblings()
      .children()
      .find('[data-testid="EditIcon"]')
      .click();
    cy.wait(1000);
    cy.contains('.MuiOutlinedInput-root', 'Title')
      .children('.MuiOutlinedInput-input')
      .should('have.value', 'NEET Check-in');
    cy.contains('.MuiOutlinedInput-root', 'Version')
      .children('.MuiOutlinedInput-input')
      .clear()
      .type('2');
    cy.get(
      ':nth-child(3) > :nth-child(4) > .MuiButtonBase-root > [data-testid="DeleteIcon"]'
    ).click();
    cy.get('.MuiDialogActions-root > .MuiButton-contained').click();
    // check non existence
    cy.get('.MuiTypography-root').contains('Career Path').should('not.exist');
    cy.get('.MuiInputBase-root')
      .contains('What field are you in?')
      .should('not.exist');
    cy.get('.MuiTypography-root').contains('Current Status').should('exist');
    cy.get('.MuiInputBase-root')
      .contains('Please provide details to your answer above:')
      .should('exist');
    // submit form and verify
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

  it('edits a category', () => {
    cy.get('.MuiTableBody-root')
      .contains('NEET Check-in')
      .siblings()
      .children()
      .find('[data-testid="EditIcon"]')
      .click();
    cy.wait(1000);
    cy.contains('.MuiOutlinedInput-root', 'Title')
      .children('.MuiOutlinedInput-input')
      .should('have.value', 'NEET Check-in');
    cy.contains('.MuiOutlinedInput-root', 'Version')
      .children('.MuiOutlinedInput-input')
      .clear()
      .type('3');
    cy.get(
      ':nth-child(3) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]'
    ).click();
    cy.contains('.MuiOutlinedInput-root', 'English Category Name')
      .clear()
      .type('NEET Status');
    cy.get('.MuiButton-contained').contains('Save').click();
    // save form
    cy.get('.MuiInputBase-root').contains('Current Status').should('not.exist');
    cy.get('.MuiTypography-root').contains('NEET Status').should('exist');
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

  it('deletes all questions in a category then deletes the category', () => {
    cy.get('.MuiTableBody-root')
      .contains('NEET Check-in')
      .siblings()
      .children()
      .find('[data-testid="EditIcon"]')
      .click();
    cy.wait(1000);
    cy.contains('.MuiOutlinedInput-root', 'Title')
      .children('.MuiOutlinedInput-input')
      .should('have.value', 'NEET Check-in');
    cy.contains('.MuiOutlinedInput-root', 'Version')
      .children('.MuiOutlinedInput-input')
      .clear()
      .type('4');
    // add the category to delete
    cy.get('.MuiButton-contained').contains('Add Category').click();
    cy.contains('.MuiOutlinedInput-root', 'English Category Name').type(
      'Career Path'
    );
    cy.get('.MuiButton-contained').contains('Save').click();
    // add a sub-category to the category
    cy.get('.MuiTypography-root')
      .contains('Career Path')
      .parent()
      .next()
      .find('.MuiButton-contained')
      .click();
    cy.contains('.MuiOutlinedInput-root', 'Field Text').type('Career Goals');
    cy.get('.MuiButton-contained').contains('Save').click();
    // first delete the sub category
    cy.get(
      ':nth-child(17) > :nth-child(4) > .MuiButtonBase-root > [data-testid="DeleteIcon"]'
    ).click();
    cy.get('.MuiDialogActions-root > .MuiButton-contained').click();
    // next delete the category
    cy.get(
      ':nth-child(13) > :nth-child(4) > .MuiButtonBase-root > [data-testid="DeleteIcon"]'
    ).click();
    cy.get('.MuiDialogActions-root > .MuiButton-contained').click();
    // save form
    cy.get('.MuiInputBase-root').contains('Current Status').should('not.exist');
    cy.get('.MuiTypography-root').contains('NEET Status').should('exist');
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
});
