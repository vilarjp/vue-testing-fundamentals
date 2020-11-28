import { mount } from '@vue/test-utils';
import axios from 'axios';
import { makeServer } from '@/miragejs/server';
import ProductCard from '@/components/ProductCard';
import Search from '@/components/Search';
import ProductList from '.';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('ProductList - integration', () => {
  let server;

  const mountProductList = async (
    quantity = 10,
    overrides = [],
    shouldReject = false
  ) => {
    const products = createProducts(quantity, overrides);

    if (shouldReject) {
      axios.get.mockReturnValueOnce(new Error());
    } else
      axios.get.mockReturnValueOnce(Promise.resolve({ data: { products } }));

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await wrapper.vm.$nextTick();

    return { wrapper, products };
  };

  const createProducts = (quantity = 10, overrides = []) => {
    let overrideList = [];

    if (overrides.length > 0) {
      overrideList = overrides.map((override) =>
        server.create('product', override)
      );
    }

    const products = [
      ...server.createList('product', quantity),
      ...overrideList,
    ];

    return products;
  };

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
    jest.clearAllMocks();
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', async () => {
    const { wrapper } = await mountProductList();
    expect(wrapper.vm).toBeDefined();
  });

  it('should mount Search component', async () => {
    const { wrapper } = await mountProductList();
    expect(wrapper.findComponent(Search)).toBeDefined();
  });

  it('should call axios.get on component mount', async () => {
    await mountProductList();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/products');
  });

  it('should mount ProductCard component 10 times', async () => {
    const { wrapper } = await mountProductList();

    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(10);
  });

  it('should display the error message when promise rejects', async () => {
    const { wrapper } = await mountProductList(10, [], true);

    expect(wrapper.text()).toContain('Something went wrong!');
  });

  it('should filter the product list when a search is performed', async () => {
    const products = [
      {
        title: 'Meu relógio amado',
      },
      {
        title: 'Meu outro relógio amado',
      },
    ];

    const { wrapper } = await mountProductList(10, products);

    const search = wrapper.findComponent(Search);
    search.find('input[type="search"]').setValue('amado');
    await search.find('form').trigger('submit');

    expect(wrapper.vm.search).toEqual('amado');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(2);
  });

  it('should return the complete list if empty search is performed', async () => {
    const products = [
      {
        title: 'Meu relógio amado',
      },
    ];

    const { wrapper } = await mountProductList(10, products);

    const search = wrapper.findComponent(Search);
    search.find('input[type="search"]').setValue('amado');
    await search.find('form').trigger('submit');
    search.find('input[type="search"]').setValue('');
    await search.find('form').trigger('submit');

    expect(wrapper.vm.search).toEqual('');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(11);
  });

  it('should display the total quantity of products', async () => {
    const { wrapper } = await mountProductList(27);

    const quantity = wrapper.find('[data-testid="quantity"]');

    expect(quantity.text()).toBe('27 Products');
  });

  it('should display product (singular) when there is only product', async () => {
    const { wrapper } = await mountProductList(1);

    const quantity = wrapper.find('[data-testid="quantity"]');

    expect(quantity.text()).toBe('1 Product');
  });
});
