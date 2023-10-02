import * as moment from 'moment';

describe('Form templates', () => {

    beforeEach(() => {
      cy.login({ email: 'admin123@admin.com', password: 'admin123' })
      cy.visit('http://localhost:3000/admin/form-templates')
    });
    
    it('create form', () => {
      cy.get('[data-testid="AddIcon"]').click()
      cy.url().should('include', '/admin/form-templates/new')
      cy.contains('.MuiOutlinedInput-root', 'Title').type("Dinner Party Form English")
      cy.contains('.MuiOutlinedInput-root', 'Version').clear()
      cy.contains('.MuiOutlinedInput-root', 'Version').type("1")

      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'Field Text').type('Dietary')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("1")
      cy.get('.MuiButton-contained').contains('Save').click()

      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'Field Text').type('Any dietary restrictions?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("2")
      cy.get('.MuiFormControlLabel-label').contains('Multi Select').click()
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').type('Vegeterian')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').type('Vegan')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 3').type('Kosher')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 4').type('Halal')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 5').type('Other')
      cy.get('.MuiButton-contained').contains('Save').click()

      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'Field Text').type('Please specify other dietary restriction')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("3")
      cy.get('.MuiFormControlLabel-label').contains('Text').click()
      cy.get('.MuiSwitch-input').click()
      cy.get(':nth-child(3) > .MuiGrid-root > :nth-child(6) > .MuiTypography-root').click()
      cy.get('.MuiButton-contained').contains('Save').click()

      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'Field Text').type('Any allergies?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("4")
      cy.get('.MuiFormControlLabel-label').contains('Multiple Choice').click()
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').type('Yes')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').type('No')
      cy.get('.MuiButton-contained').contains('Save').click()

      // Make a duplicate question and delete the original
      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'Field Text').type('Any allergies?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("5")
      cy.get('.MuiFormControlLabel-label').contains('Multiple Choice').click()
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').type('Yes')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').type('No')
      cy.get('.MuiButton-contained').contains('Save').click()
      cy.get('[data-testid="DeleteIcon"]').eq(3).click()

      // Test edit and cancel
      cy.get('[data-testid="EditIcon"]').last().click()
      cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Any allergies?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '5')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').clear()
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type('4')
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('contain', 'Yes')
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('contain', 'No')
      cy.get(':nth-child(5) > .MuiFormGroup-root > :nth-child(1)').contains('Category').click({force: true})
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('not.exist')
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('not.exist')
      cy.get('.MuiButton-text').contains('Cancel').click()

      // Actually edit the field this time
      cy.get('[data-testid="EditIcon"]').last().click()
      cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Any allergies?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '5')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').clear()
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type('4')
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('contain', 'Yes')
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('contain', 'No')
      cy.get('.MuiButton-contained').contains('Save').click()

      // submit form and verify
      cy.get('.MuiGrid-container > .MuiButtonBase-root').contains('Submit Template').click()
      cy.get('.MuiDialogActions-root > .MuiButton-contained').contains('Submit').click()
      cy.wait(1000)
    })

    it('verify form', () => {
      cy.get('.MuiTableBody-root').contains('Dinner Party Form English').siblings().children().find('[data-testid="EditIcon"]').click()
      cy.wait(1000)
      cy.contains('.MuiOutlinedInput-root', 'Title').children('.MuiOutlinedInput-input').should('have.value', "Dinner Party Form English")
      cy.contains('.MuiOutlinedInput-root', 'Version').children('.MuiOutlinedInput-input').should('have.value',"1")
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

    it('create form with multiple languages', () => {
      cy.wait(1000)
      cy.get('[data-testid="AddIcon"]').click()
      cy.url().should('include', '/admin/form-templates/new')
      cy.contains('.MuiOutlinedInput-root', 'Title').type("Dinner Party Form Multilingual")
      cy.contains('.MuiOutlinedInput-root', 'Version').clear()
      cy.contains('.MuiOutlinedInput-root', 'Version').type("1")
      cy.get('.MuiGrid-container > :nth-child(4)').click()
      cy.get('.MuiDialogContent-dividers').contains('Spanish').click()
      cy.get('.MuiButton-contained').contains('Close').click()

      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').type('Dietary')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').type('Dietética')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("1")
      cy.get('.MuiButton-contained').contains('Save').click()

      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').type('Any dietary restrictions?')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').type('¿Alguna restricción dietética?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("2")
      cy.get('.MuiFormControlLabel-label').contains('Multi Select').click()
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').type('Vegeterian')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 1').type('Vegetariana')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').type('Vegan')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 2').type('Vegana')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 3').type('Kosher')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 3').type('Comestible según la ley judía')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 4').type('Halal')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 4').type('Halal')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 5').type('Other')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 5').type('Otra')
      cy.get('.MuiButton-contained').contains('Save').click()

      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').type('Please specify other dietary restriction')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').type('Por favor especifique otra restricción dietética')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("3")
      cy.get('.MuiFormControlLabel-label').contains('Text').click()
      cy.get('.MuiSwitch-input').click()
      cy.get(':nth-child(3) > .MuiGrid-root > :nth-child(6) > .MuiTypography-root').click()
      cy.get('.MuiButton-contained').contains('Save').click()

      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').type('Any allergies?')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').type('¿Ninguna alergia?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("4")
      cy.get('.MuiFormControlLabel-label').contains('Multiple Choice').click()
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').type('Yes')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 1').type('Sí')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').type('No')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 2').type('No')
      cy.get('.MuiButton-contained').contains('Save').click()

      // Make a duplicate question and delete the original
      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').type('Any allergies?')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').type('¿Ninguna alergia?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("5")
      cy.get('.MuiFormControlLabel-label').contains('Multiple Choice').click()
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').type('Yes')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 1').type('Sí')
      cy.get('.MuiButton-contained').contains('Add Option').click()
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').type('No')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 2').type('No')
      cy.get('.MuiButton-contained').contains('Save').click()
      cy.get('[data-testid="DeleteIcon"]').eq(3).click()

      // Test edit and cancel
      cy.get('[data-testid="EditIcon"]').last().click()
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').should('contain', 'Any allergies?')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').should('contain', '¿Ninguna alergia?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '5')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').clear()
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type('4')
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('contain', 'Yes')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 1').should('contain', 'Sí')
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('contain', 'No')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 2').should('contain', 'No')
      cy.get(':nth-child(6) > .MuiFormGroup-root > :nth-child(1)').contains('Category').click({force: true})
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('not.exist')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 1').should('not.exist')
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('not.exist')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 2').should('not.exist')
      cy.get('.MuiButton-text').contains('Cancel').click()

      // Actually edit the field this time
      cy.get('[data-testid="EditIcon"]').last().click()
      cy.contains('.MuiOutlinedInput-root', 'Field Text').should('contain', 'Any allergies?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '5')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').clear()
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type('4')
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('contain', 'Yes')
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('contain', 'No')
      cy.get('.MuiButton-contained').contains('Save').click()

      // submit form and verify
      cy.get('.MuiGrid-container > .MuiButtonBase-root').contains('Submit Template').click()
      cy.get('.MuiDialogActions-root > .MuiButton-contained').contains('Submit').click()
      cy.get('[data-testid="ChevronLeftIcon"]').click()
      cy.wait(1000)
    });

    it('verify form with multiple languages english', () => {
      cy.wait(1000)
      cy.get('.MuiTableBody-root').contains('Dinner Party Form Multilingual').siblings().children().find('[data-testid="EditIcon"]').click()
      cy.wait(1000)
      cy.contains('.MuiOutlinedInput-root', 'Title').children('.MuiOutlinedInput-input').should('have.value', "Dinner Party Form Multilingual")
      cy.contains('.MuiOutlinedInput-root', 'Version').children('.MuiOutlinedInput-input').should('have.value',"1")
      cy.contains('.MuiOutlinedInput-root', 'Language').children('.MuiOutlinedInput-input').should('have.value',"English, Spanish")
      cy.get('.MuiGrid-grid-xs-11 > .MuiTypography-root').should('contain', 'Dietary')
      // validate the editfield
      cy.get(':nth-child(2) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').should('contain', 'Dietary')
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
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').should('contain', 'Any dietary restrictions?')
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
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').should('contain', 'Please specify other dietary restriction')
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
      cy.contains('.MuiOutlinedInput-root', 'English Field Text').should('contain', 'Any allergies?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '4')
      cy.get("input[name='field-type-group']").eq(3).should('be.checked').and('have.value', 'mult_choice')
      cy.contains('.MuiOutlinedInput-root', 'English Option 1').should('contain', 'Yes')
      cy.contains('.MuiOutlinedInput-root', 'English Option 2').should('contain', 'No')
      cy.get('.MuiButton-text').contains('Cancel').click()
    });

    it('verify form with multiple languages spanish', () => {
      cy.wait(1000)
      cy.get('.MuiTableBody-root').contains('Dinner Party Form Multilingual').siblings().children().find('[data-testid="EditIcon"]').click()
      cy.wait(1000)
      cy.contains('.MuiOutlinedInput-root', 'View Language').type("Spanish").get('li[data-option-index="0"]').click()
      cy.get('.MuiGrid-grid-xs-11 > .MuiTypography-root').should('contain', 'Dietética')
      // validate the editfield
      cy.get(':nth-child(2) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').should('contain', 'Dietética')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '1')
      cy.get("input[name='field-type-group']").eq(0).should('be.checked').and('have.value', 'category')
      cy.get('.MuiButton-text').contains('Cancel').click()

      cy.get(':nth-child(4) > .MuiFormLabel-root > .MuiTypography-root').should('contain', '¿Alguna restricción dietética?')
      cy.get(':nth-child(2) > .MuiTypography-root').should('contain', 'Vegetariana')
      cy.get(':nth-child(3) > .MuiTypography-root').should('contain', 'Vegana')
      cy.get(':nth-child(4) > .MuiTypography-root').should('contain', 'Comestible según la ley judía')
      cy.get(':nth-child(5) > .MuiTypography-root').should('contain', 'Halal')
      cy.get(':nth-child(6) > .MuiTypography-root').should('contain', 'Otra')
      // validate the editfield
      cy.get(':nth-child(5) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').should('contain', '¿Alguna restricción dietética?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '2')
      cy.get("input[name='field-type-group']").eq(4).should('be.checked').and('have.value', 'mult_select')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 1').should('contain', 'Vegetariana')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 2').should('contain', 'Vegana')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 3').should('contain', 'Comestible según la ley judía')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 4').should('contain', 'Halal')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 5').should('contain', 'Otra')
      cy.get('.MuiButton-text').contains('Cancel').click()

      cy.get('.MuiGrid-grid-sm-11 > .MuiFormControl-root > .MuiInputBase-root').should('contain', 'Por favor especifique otra restricción dietética')
      // validate the editfield
      cy.get(':nth-child(8) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').should('contain', 'Por favor especifique otra restricción dietética')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '3')
      cy.get("input[name='field-type-group']").eq(2).should('be.checked').and('have.value', 'text')
      cy.get(':nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('contain', 'Any dietary restrictions?')
      cy.get(':nth-child(2) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select').should('contain', 'Equal to')
      // bug: other should be selected
      cy.get('.MuiButton-text').contains('Cancel').click()

      cy.get('#question_3 > .MuiTypography-root').should('contain', '¿Ninguna alergia?')
      cy.get('.MuiFormGroup-root > :nth-child(1) > .MuiTypography-root').should('contain', 'Sí')
      cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiTypography-root').should('contain', 'No')
      // validate the editfield
      cy.get(':nth-child(11) > :nth-child(2) > .MuiButtonBase-root > [data-testid="EditIcon"]').click()
      cy.contains('.MuiOutlinedInput-root', 'Spanish Field Text').should('contain', '¿Ninguna alergia?')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').should('contain', '4')
      cy.get("input[name='field-type-group']").eq(3).should('be.checked').and('have.value', 'mult_choice')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 1').should('contain', 'Sí')
      cy.contains('.MuiOutlinedInput-root', 'Spanish Option 2').should('contain', 'No')
      cy.get('.MuiButton-text').contains('Cancel').click()
    });

    it('create form default version', () => {
      // create form with default version
      cy.get('[data-testid="AddIcon"]').click()
      cy.url().should('include', '/admin/form-templates/new')
      cy.contains('.MuiOutlinedInput-root', 'Title').type("Dinner Party Form Default Version")

      cy.get('.MuiButton-contained').contains('Add Field').click()
      cy.contains('.MuiOutlinedInput-root', 'Field Text').type('Dietary')
      cy.contains('.MuiOutlinedInput-root', 'Question ID').type("1")
      cy.get('.MuiButton-contained').contains('Save').click()

      cy.get('.MuiGrid-container > .MuiButtonBase-root').contains('Submit Template').click()
      cy.get('.MuiDialogActions-root > .MuiButton-contained').contains('Submit').click()
      cy.wait(1000)
  });

  it('verify form default version', () => {
      // create form with default version
      cy.wait(1000)
      cy.get('.MuiTableBody-root').contains('Dinner Party Form Default Version').siblings().children().find('[data-testid="EditIcon"]').click()
      cy.wait(1000)
      cy.contains('.MuiOutlinedInput-root', 'Version').children('.MuiOutlinedInput-input').should('contain.value',moment.utc(new Date(Date.now()).toUTCString()).format('YYYY-MM-DD'))
  });

})

