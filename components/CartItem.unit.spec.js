import { mount } from '@vue/test-utils';
import CartItem from '@/components/CartItem';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

let server;

const mountCartItem = () => {
  const product = server.create('product', {
    title: 'Lindo relógio',
    price: '22.33',
  });

  const cartManager = new CartManager();

  const wrapper = mount(CartItem, {
    propsData: {
      product,
    },
    mocks: {
      $cart: cartManager,
    },
  });

  return {
    product,
    wrapper,
    cartManager,
  };
};

describe('CartItem - Unit', () => {
  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', () => {
    const { wrapper } = mountCartItem();
    expect(wrapper.vm).toBeDefined();
  });

  it('should display product info', () => {
    const { wrapper, product } = mountCartItem();

    const content = wrapper.text();

    expect(content).toContain(product.title);
    expect(content).toContain(product.price);
  });

  it('should display quantity 1 when product is first displayed', () => {
    const { wrapper } = mountCartItem();

    const quantity = wrapper.find('[data-testid="quantity"]');

    expect(quantity.text()).toContain('1');
  });

  it('should increase quantity when add button is clicked', async () => {
    const { wrapper } = mountCartItem();

    const quantity = wrapper.find('[data-testid="quantity"]');

    const button = wrapper.find('[data-testid="+"]');
    await button.trigger('click');
    expect(quantity.text()).toContain('2');

    await button.trigger('click');
    expect(quantity.text()).toContain('3');

    await button.trigger('click');
    expect(quantity.text()).toContain('4');
  });

  it('should decrease quantity when remove button is clicked', async () => {
    const { wrapper } = mountCartItem();

    const quantity = wrapper.find('[data-testid="quantity"]');

    const button = wrapper.find('[data-testid="-"]');
    await button.trigger('click');
    expect(quantity.text()).toContain('0');
  });

  it('should not go below 0 when remove button is clicked repeatedly', async () => {
    const { wrapper } = mountCartItem();

    const quantity = wrapper.find('[data-testid="quantity"]');

    const button = wrapper.find('[data-testid="-"]');
    await button.trigger('click');
    await button.trigger('click');
    expect(quantity.text()).toContain('0');
  });

  it('should display a button to remove item from cart', () => {
    const { wrapper } = mountCartItem();

    const button = wrapper.find('[data-testid="remove-button"');

    expect(button.exists()).toBe(true);
  });

  it('should call cart manager removeProduct() when button gets clicked', async () => {
    const { wrapper, cartManager, product } = mountCartItem();

    const spy = jest.spyOn(cartManager, 'removeProduct');

    await wrapper.find('[data-testid="remove-button"]').trigger('click');

    expect(spy).toHaveBeenCalledWith(product.id);
  });
});
