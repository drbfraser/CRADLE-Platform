const QUESTION_LABEL = 'Patient notes';

describe('Edit custom form', () => {
  it('updates a submitted form and persists the new answer', () => {
    const templateName = `Cy Edit Form ${Date.now()}`;

    cy.login();
    cy.createTestPatient().then((patientResponse) => {
      const patientId = patientResponse.body.id as string;

      cy.createTestFormTemplate(templateName).then(() => {
        cy.visit(`/patients/${patientId}`);
        cy.contains('button', 'Submit New Form').click();
        cy.selectAndFetchFormTemplate(templateName);
        cy.get('label')
          .contains(QUESTION_LABEL)
          .parent()
          .find('textarea')
          .first()
          .type('original notes');
        cy.contains('button', 'Submit Form').click();

        cy.contains('button', 'View Form').click();
        cy.contains('button', 'Edit Form').click();
        cy.url().should('include', `/forms/edit/${patientId}/`);

        cy.get('label')
          .contains(QUESTION_LABEL)
          .parent()
          .find('textarea')
          .first()
          .clear()
          .type('updated notes');
        cy.contains('button', 'Update Form').click();

        cy.url().should('include', `/patients/${patientId}`);
        cy.contains('button', 'View Form').click();
        cy.get('label')
          .contains(QUESTION_LABEL)
          .parent()
          .find('textarea')
          .first()
          .should('be.disabled')
          .and('have.value', 'updated notes');
      });
    });
  });
});
