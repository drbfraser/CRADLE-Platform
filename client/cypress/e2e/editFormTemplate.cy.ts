describe('Edit Form templates', () => {
  beforeEach(() => {
    cy.login({ email: 'admin123@admin.com', password: 'admin123' })
    cy.visit('http://localhost:3000/admin/form-templates')
  });

  it('edit form version only', () => {
    cy.get('.MuiTableBody-root').contains('Dinner Party Form English').siblings().children().find('[data-testid="EditIcon"]').click()
    cy.wait(1000)
    cy.contains('.MuiOutlinedInput-root', 'Version').type("{backspace}2")
    cy.get('.MuiGrid-container > .MuiButtonBase-root').contains('Submit Template').click()
    cy.get('.MuiDialogActions-root > .MuiButton-contained').contains('Submit').click()
    cy.get('.MuiAlert-message', {timeout: 10000}).should('have.text','Form Template Saved!')
  });

  it('verify edit form version only', () => {
    cy.get('.MuiTableBody-root').contains('Dinner Party Form English').siblings().children().find('[data-testid="EditIcon"]').click()
    cy.wait(1000)
    cy.contains('.MuiOutlinedInput-root', 'Title').children('.MuiOutlinedInput-input').should('have.value', "Dinner Party Form English")
    cy.contains('.MuiOutlinedInput-root', 'Version').children('.MuiOutlinedInput-input').should('have.value',"2")
    cy.contains('.MuiOutlinedInput-root', 'Language').children('.MuiOutlinedInput-input').should('have.value',"English")
    cy.get('.MuiGrid-grid-xs-11 > .MuiTypography-root').should('contain', 'Dietary')
    // validate the editfield
    cy.get(':nth-child(2) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
    cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Dietary')
    cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '1')
    cy.get("input[name='field-type-group']").eq(0).should('be.checked').and('have.value', 'category')
    cy.get('.MuiButton-text').contains('Cancel').click()

    cy.get(':nth-child(4) > .MuiFormLabel-root > .MuiTypography-root').should('contain', 'Any dietary restrictions?')
    cy.get(':nth-child(2) > .MuiTypography-root').should('contain', 'Vegeterian')
    cy.get(':nth-child(3) > .MuiTypography-root').should('contain', 'Vegan')
    cy.get(':nth-child(4) > .MuiTypography-root').should('contain', 'Kosher')
    cy.get(':nth-child(5) > .MuiTypography-root').should('contain', 'Halal')
    cy.get(':nth-child(6) > .MuiTypography-root').should('contain', 'Other')
    // validate the editfield
    cy.get(':nth-child(5) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
    cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Any dietary restrictions?')
    cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '2')
    cy.get("input[name='field-type-group']").eq(4).should('be.checked').and('have.value', 'mult_select')
    cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('contain', 'Vegeterian')
    cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('contain', 'Vegan')
    cy.contains('.MuiOutlinedInput-root', 'English Option 3').should('contain', 'Kosher')
    cy.contains('.MuiOutlinedInput-root', 'English Option 4').should('contain', 'Halal')
    cy.contains('.MuiOutlinedInput-root', 'English Option 5').should('contain', 'Other')
    cy.get('.MuiButton-text').contains('Cancel').click()

    cy.get('.MuiGrid-grid-sm-11 > .MuiFormControl-root > .MuiInputBase-root').should('contain', 'Please specify other dietary restriction')
    // validate the editfield
    cy.get(':nth-child(8) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
    cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Please specify other dietary restriction')
    cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '3')
    cy.get("input[name='field-type-group']").eq(2).should('be.checked').and('have.value', 'text')
    cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('contain', 'Any dietary restrictions?')
    cy.get(':nth-child(2) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('contain', 'Equal to')
    // bug: other should be selected
    cy.get('.MuiButton-text').contains('Cancel').click()

    cy.get('#question_3 > .MuiTypography-root').should('contain', 'Any allergies?')
    cy.get('.MuiFormGroup-root > :nth-child(1) > .MuiTypography-root').should('contain', 'Yes')
    cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiTypography-root').should('contain', 'No')
    // validate the editfield
    cy.get(':nth-child(11) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
    cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Any allergies?')
    cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '4')
    cy.get("input[name='field-type-group']").eq(3).should('be.checked').and('have.value', 'mult_choice')
    cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('contain', 'Yes')
    cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('contain', 'No')
    cy.get('.MuiButton-text').contains('Cancel').click()
  });

  it('edit form change question', () => {
    cy.get('.MuiTableBody-root').contains('Dinner Party Form English').siblings().children().find('[data-testid="EditIcon"]').click()
    cy.wait(1000)
    cy.contains('.MuiOutlinedInput-root', 'Version').type("{backspace}3")
    // change a question
    cy.get('[data-testid="EditIcon"]').last().click()
    cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Any allergies?')
    cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '4')
    cy.get('.MuiButton-contained').contains('Add Option').click()
    cy.contains('.MuiOutlinedInput-root', 'English Option 3').type('Maybe...')
    cy.get('.MuiButton-contained').contains('Save').click()
    // save form
    cy.get('.MuiGrid-container > .MuiButtonBase-root').contains('Submit Template').click()
    cy.get('.MuiDialogActions-root > .MuiButton-contained').contains('Submit').click()
    cy.get('.MuiAlert-message', {timeout: 10000}).should('have.text','Form Template Saved!')
  });

  it('verify edit form change question', () => {
    cy.get('.MuiTableBody-root').contains('Dinner Party Form English').siblings().children().find('[data-testid="EditIcon"]').click()
    cy.wait(1000)
    cy.contains('.MuiOutlinedInput-root', 'Title').children('.MuiOutlinedInput-input').should('have.value', "Dinner Party Form English")
    cy.contains('.MuiOutlinedInput-root', 'Version').children('.MuiOutlinedInput-input').should('have.value',"3")
    cy.contains('.MuiOutlinedInput-root', 'Language').children('.MuiOutlinedInput-input').should('have.value',"English")
    cy.get('.MuiGrid-grid-xs-11 > .MuiTypography-root').should('contain', 'Dietary')
    // validate the editfield
    cy.get(':nth-child(2) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
    cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Dietary')
    cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '1')
    cy.get("input[name='field-type-group']").eq(0).should('be.checked').and('have.value', 'category')
    cy.get('.MuiButton-text').contains('Cancel').click()

    cy.get(':nth-child(4) > .MuiFormLabel-root > .MuiTypography-root').should('contain', 'Any dietary restrictions?')
    cy.get(':nth-child(2) > .MuiTypography-root').should('contain', 'Vegeterian')
    cy.get(':nth-child(3) > .MuiTypography-root').should('contain', 'Vegan')
    cy.get(':nth-child(4) > .MuiTypography-root').should('contain', 'Kosher')
    cy.get(':nth-child(5) > .MuiTypography-root').should('contain', 'Halal')
    cy.get(':nth-child(6) > .MuiTypography-root').should('contain', 'Other')
    // validate the editfield
    cy.get(':nth-child(5) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
    cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Any dietary restrictions?')
    cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '2')
    cy.get("input[name='field-type-group']").eq(4).should('be.checked').and('have.value', 'mult_select')
    cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('contain', 'Vegeterian')
    cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('contain', 'Vegan')
    cy.contains('.MuiOutlinedInput-root', 'English Option 3').should('contain', 'Kosher')
    cy.contains('.MuiOutlinedInput-root', 'English Option 4').should('contain', 'Halal')
    cy.contains('.MuiOutlinedInput-root', 'English Option 5').should('contain', 'Other')
    cy.get('.MuiButton-text').contains('Cancel').click()

    cy.get('.MuiGrid-grid-sm-11 > .MuiFormControl-root > .MuiInputBase-root').should('contain', 'Please specify other dietary restriction')
    // validate the editfield
    cy.get(':nth-child(8) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
    cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Please specify other dietary restriction')
    cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '3')
    cy.get("input[name='field-type-group']").eq(2).should('be.checked').and('have.value', 'text')
    cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('contain', 'Any dietary restrictions?')
    cy.get(':nth-child(2) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('contain', 'Equal to')
    // bug: other should be selected
    cy.get('.MuiButton-text').contains('Cancel').click()

    cy.get('#question_3 > .MuiTypography-root').should('contain', 'Any allergies?')
    cy.get('.MuiFormGroup-root > :nth-child(1) > .MuiTypography-root').should('contain', 'Yes')
    cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiTypography-root').should('contain', 'No')
    cy.get('.MuiFormGroup-root > :nth-child(3) > .MuiTypography-root').should('contain', 'Maybe...')
    // validate the editfield
    cy.get(':nth-child(11) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
    cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Any allergies?')
    cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '4')
    cy.get("input[name='field-type-group']").eq(3).should('be.checked').and('have.value', 'mult_choice')
    cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('contain', 'Yes')
    cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('contain', 'No')
    cy.get('.MuiButton-text').contains('Cancel').click()
  });
})

