/// <reference types="cypress" />

describe('Player', () => {
    it('load player', () => {
        cy.visit('./cypress/index.html');
        cy.get('#video').get('video').should('not.have.attr', 'id');
    });
});