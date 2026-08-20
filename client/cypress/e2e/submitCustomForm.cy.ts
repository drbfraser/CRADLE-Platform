const QUESTION_LABEL = 'Patient notes';

describe('Submit custom form', () => {
  it('selects a template, fills answers, and shows the form in patient history', () => {
    const templateName = `Cy Submit Form ${Date.now()}`;

    cy.login();
    cy.createTestPatient().then((patientResponse) => {
      const patientId = patientResponse.body.id as string;

      cy.createTestFormTemplate(templateName).then(() => {
        cy.visit(`/patients/${patientId}`);
        cy.contains('button', 'Submit New Form').click();
        cy.url().should('include', `/forms/new/${patientId}`);

        cy.selectAndFetchFormTemplate(templateName);
        cy.get('label')
          .contains(QUESTION_LABEL)
          .parent()
          .find('textarea')
          .first()
          .type('cypress submitted notes');

        cy.contains('button', 'Submit Form').click();
        cy.url().should('include', `/patients/${patientId}`);
        cy.contains(templateName).should('be.visible');
        cy.contains('button', 'View Form').should('be.visible');
      });
    });
  });
});
