import { mount } from '@vue/test-utils';
import Cart from '@/components/Cart';
import CartItem from '@/components/CartItem';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

describe('Cart - Unit', () => {
  let server;

  const mountCart = (hasProducts = true) => {
    const products = server.createList('product', 2);

    const cartManager = new CartManager();

    let wrapper;

    hasProducts
      ? (wrapper = mount(Cart, {
          propsData: {
            products,
          },
          mocks: {
            $cart: cartManager,
          },
        }))
      : (wrapper = mount(Cart, {
          mocks: {
            $cart: cartManager,
          },
        }));

    return {
      products,
      wrapper,
      cartManager,
    };
  };

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', () => {
    const { wrapper } = mountCart();

    expect(wrapper.vm).toBeDefined();
  });

  it('should not display empty cart button when there are no products', () => {
    const { wrapper } = mountCart(false);

    expect(wrapper.find('[data-testid="clear-button"]').exists()).toBe(false);
  });

  it('should emit close event when button gets clicked', async () => {
    const { wrapper } = mountCart();

    const button = wrapper.find('[data-testid="close-button"]');

    await button.trigger('click');

    expect(wrapper.emitted().close).toBeTruthy();
    expect(wrapper.emitted().close).toHaveLength(1);
  });

  it('should hide the cart when no prop isOpen is passed', () => {
    const { wrapper } = mountCart();

    expect(wrapper.classes()).toContain('hidden');
  });

  it('should display the cart when prop isOpen is passed', async () => {
    const { wrapper } = mountCart();

    await wrapper.setProps({
      isOpen: true,
    });

    expect(wrapper.classes()).not.toContain('hidden');
  });

  it('should display "Cart is empty" when there are no products', () => {
    const { wrapper } = mountCart(false);

    expect(wrapper.text()).toContain('Cart is empty');
  });

  it('should display 2 instances of CartItem when 2 products are provided', () => {
    const { wrapper } = mountCart();

    expect(wrapper.findAllComponents(CartItem)).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Cart is empty');
  });

  it('should display a button to clear the cart', () => {
    const { wrapper } = mountCart();

    const button = wrapper.find('[data-testid="clear-button"]');

    expect(button.exists()).toBe(true);
  });

  it('should call cart manager clearProducts() when button gets clicked', async () => {
    const { wrapper, cartManager } = mountCart();

    const spy = jest.spyOn(cartManager, 'clearProducts');

    await wrapper.find('[data-testid="clear-button"]').trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
