const QUESTION_LABEL = 'Patient notes';

describe('View custom form', () => {
  it('opens a submitted form in view mode with read-only fields', () => {
    const templateName = `Cy View Form ${Date.now()}`;

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
          .type('view-only notes');
        cy.contains('button', 'Submit Form').click();

        cy.contains(templateName).should('be.visible');
        cy.contains('button', 'View Form').click();
        cy.url().should('include', `/forms/view/${patientId}/`);

        cy.get('label')
          .contains(QUESTION_LABEL)
          .parent()
          .find('textarea')
          .first()
          .should('be.disabled')
          .and('have.value', 'view-only notes');
      });
    });
  });
});
