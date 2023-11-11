describe('browser language', () => {

  beforeEach(() => {
    cy.login({ email: 'admin123@admin.com', password: 'admin123' })
  });

  it('create form browser language', () => {

    cy.visit('http://localhost:3000/admin/form-templates',{
        onBeforeLoad (win) {
          Object.defineProperty(win.navigator, 'language', {
            value: 'pl'
        })
        }
    });

    //Create form with default version
    cy.get('[data-testid="AddIcon"]').click();
    cy.url().should('include', '/admin/form-templates/new');
    cy.contains('.MuiOutlinedInput-root', 'Title').type(
      'Multi Language Medical Form'
    );
    
    //Check language contains browser language
    cy.contains('.MuiOutlinedInput-root', 'Language')
      .children('.MuiOutlinedInput-input')
      .should(
        'contain',
        'Polish'
      );

    //Form should select Polish as languge
    cy.get('.MuiGrid-container > :nth-child(4)').click();

    //Add second langauge
    cy.get('.MuiDialogContent-dividers').contains('English').click();
    cy.get('.MuiButton-contained').contains('Close').click();

    //Language should be set to Polish by default
    cy.get('.MuiButton-contained').contains('Add Category').click();
    cy.contains('.MuiOutlinedInput-root', 'Polish Category Name').type(
      'Informacje Osobiste'
    );
    cy.contains('.MuiOutlinedInput-root', 'English Category Name').type(
      'Personal Information'
    );
    cy.get('.MuiButton-contained').contains('Save').click();

    //Add single text field for both languages 
    cy.get('.MuiButton-contained').contains('Add Field').click();
    cy.contains('.MuiOutlinedInput-root', 'Polish Field Text').type(
        'Pełne Imię I Nazwisko'
    );
    cy.contains('.MuiOutlinedInput-root', 'English Field Text').type(
      'Full Name'
    );
    cy.get('.MuiFormControlLabel-label').contains('Text').click();
    cy.get('.MuiButton-contained').contains('Save').click();

    //Submit template
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

  it('verify form browser language', () => {

    //Set browser language to Polish
    cy.visit('http://localhost:3000/forms/new/49300028162',{
        onBeforeLoad (win) {
          Object.defineProperty(win.navigator, 'language', {
            value: 'pl'
          })
        }
      });

    //Check set default to Polish
    cy.get(`[data-cy = "form-name"]`).click();
    cy.contains('Multi Language Medical Form').click();
    cy.get(`[data-cy = "def-lang"] input`, {timeout: 1000}).should('have.value', 'Polish');
    
    //Set browser language to English
    cy.visit('http://localhost:3000/forms/new/49300028162',{
      onBeforeLoad (win) {
        Object.defineProperty(win.navigator, 'language', {
          value: 'en'
        })
      }
    });

    //Check set default to English
    cy.get(`[data-cy = "form-name"]`).click();
    cy.contains('Multi Language Medical Form').click();
    cy.get(`[data-cy = "def-lang"] input`, {timeout: 1000}).should('have.value', 'English');
    
  }); 
})
