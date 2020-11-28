import { mount } from '@vue/test-utils';
import Search from '@/components/Search.vue';

describe('Search - Unit', () => {
  it('should mount the component', () => {
    const wrapper = mount(Search);

    expect(wrapper.vm).toBeDefined();
  });

  it('should emit search event when form is submitted', async () => {
    const wrapper = mount(Search);

    const search = 'search input';

    await wrapper.find('input[type="search"]').setValue(search);
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted().handleSearch).toBeTruthy();
    expect(wrapper.emitted().handleSearch.length).toBe(1);
    expect(wrapper.emitted().handleSearch[0]).toEqual([{ search }]);
  });

  it('should emit search event when search input is cleared', async () => {
    const wrapper = mount(Search);
    const search = 'search input';
    const input = wrapper.find('input[type="search"]');

    await input.setValue(search);
    await input.setValue('');

    expect(wrapper.emitted().handleSearch).toBeTruthy();
    expect(wrapper.emitted().handleSearch.length).toBe(1);
    expect(wrapper.emitted().handleSearch[0]).toEqual([{ search: '' }]);
  });
});
