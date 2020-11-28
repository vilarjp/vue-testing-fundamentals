/// <reference types="cypress" />

import { makeServer } from '../../miragejs/server';

context('Store', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  context('Shopping Cart', () => {
    beforeEach(() => {
      server.createList('product', 10);

      cy.visit('/');
    });

    it('should not display shopping cart when page first loads', () => {
      cy.getByTestId('shopping-cart').should('have.class', 'hidden');
    });

    it('should display "Cart is empty" when there are no products', () => {
      cy.getByTestId('toggle-button').click();

      cy.getByTestId('shopping-cart').contains('Cart is empty');
    });

    it('should not display "Clear cart" when cart is empty', () => {
      cy.getByTestId('toggle-button').as('toggleButton').click();

      cy.getByTestId('clear-button').should('not.be.visible');
    });

    it('should toggle shopping cart visibility when button is clicked', () => {
      cy.getByTestId('toggle-button').as('toggleButton');
      cy.get('@toggleButton').click();

      cy.getByTestId('shopping-cart').should('not.have.class', 'hidden');

      cy.getByTestId('toggle-button').as('toggleButton');
      cy.get('@toggleButton').click();

      cy.getByTestId('shopping-cart').should('have.class', 'hidden');
    });

    it('should open shopping cart when a product is added', () => {
      cy.getByTestId('product-card').first().find('button').click();

      cy.getByTestId('shopping-cart').should('not.have.class', 'hidden');
    });

    it('should display quantity 1 when product is add to cart', () => {
      cy.addToCart({ index: 1 });

      cy.getByTestId('quantity').contains(1);
    });

    it('should increase quantity when button + gets clicked', () => {
      cy.addToCart({ index: 1 });

      cy.getByTestId('+').click();
      cy.getByTestId('quantity').contains(2);
    });

    it('should decrease quantity when button - gets clicked', () => {
      cy.addToCart({ index: 1 });

      cy.getByTestId('+').click();
      cy.getByTestId('quantity').contains(2);

      cy.getByTestId('-').click();
      cy.getByTestId('quantity').contains(1);
    });

    it('should not decrease bellow 0 when button - gets clicked', () => {
      cy.addToCart({ index: 1 });

      cy.getByTestId('+').click();
      cy.getByTestId('quantity').contains(2);

      cy.getByTestId('-').click();
      cy.getByTestId('quantity').contains(1);

      cy.getByTestId('-').click();
      cy.getByTestId('quantity').contains(0);

      cy.getByTestId('-').click();
      cy.getByTestId('quantity').contains(0);
    });

    it('should add first product to the cart', () => {
      cy.getByTestId('product-card').first().find('button').click();

      cy.getByTestId('cart-item').should('have.length', 1);
    });

    it('should add 3 products to the cart', () => {
      cy.addToCart({ indexes: [1, 3, 5] });

      cy.getByTestId('cart-item').should('have.length', 3);
    });

    it('should add 1 products to the cart', () => {
      cy.addToCart({ index: 6 });

      cy.getByTestId('cart-item').should('have.length', 1);
    });

    it('should add all products to the cart', () => {
      cy.addToCart({ indexes: 'all' });

      cy.getByTestId('cart-item').should('have.length', 10);
    });

    it('should remove a product from the cart', () => {
      cy.addToCart({ index: 2 });

      cy.getByTestId('cart-item').should('have.length', 1);

      cy.getByTestId('cart-item').first().getByTestId('remove-button').click();

      cy.getByTestId('cart-item').should('have.length', 0);
    });

    it('should clear cart when "Clear button" is clicked', () => {
      cy.addToCart({ indexes: [1, 2, 3] });

      cy.getByTestId('clear-button').click();

      cy.getByTestId('shopping-cart').contains('Cart is empty');
      cy.getByTestId('cart-item').should('have.length', 0);
    });
  });

  context('Product list', () => {
    it('should display "0 Products" when no product is returned', () => {
      cy.visit('/');

      cy.getByTestId('product-card').should('not.exist');
      cy.get('body').contains('0 Products');
    });

    it('should display "1 Product" when 1 product is returned', () => {
      server.createList('product', 1);

      cy.visit('/');

      cy.getByTestId('product-card').should('have.length', 1);
      cy.get('body').contains('1 Product');
    });

    it('should display "10 Products" when 10 products are returned', () => {
      server.createList('product', 10);

      cy.visit('/');

      cy.getByTestId('product-card').should('have.length', 10);
      cy.get('body').contains('10 Products');
    });
  });

  context('Search for products', () => {
    it('should return 1 product', () => {
      server.create('product', {
        title: 'Relógio bonito',
      });

      server.createList('product', 9);

      cy.visit('/');

      cy.getByTestId('product-card').should('have.length', 10);
      cy.get('input[type="search"]').type('Relógio bonito');
      cy.getByTestId('search-form').submit();
      cy.getByTestId('product-card').should('have.length', 1);
    });

    it('should return an empty list', () => {
      server.createList('product', 10);

      cy.visit('/');

      cy.getByTestId('product-card').should('have.length', 10);
      cy.get('input[type="search"]').type('Relógio bonito');
      cy.getByTestId('search-form').submit();
      cy.getByTestId('product-card').should('not.exist');
    });
  });
});
