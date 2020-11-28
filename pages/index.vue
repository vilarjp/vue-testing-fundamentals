<template>
  <main class="my-8">
    <Search @handleSearch="setSearch" />
    <div v-if="errorMessage === ''" class="container mx-auto px-6">
      <h3 class="text-gray-700 text-2xl font-medium">Wrist Watch</h3>
      <span class="mt-3 text-sm text-gray-500" data-testid="quantity">{{
        quantityLabel
      }}</span>
      <div
        class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6"
      >
        <product-card
          v-for="product in list"
          :key="product.id"
          :product="product"
          data-testid="product-card"
        />
      </div>
    </div>
    <h3 v-else class="text-center text-2xl">{{ errorMessage }}</h3>
  </main>
</template>

<script>
import ProductCard from '@/components/ProductCard';
import Search from '@/components/Search';

export default {
  components: { ProductCard, Search },
  data() {
    return {
      products: [],
      errorMessage: '',
      search: '',
    };
  },
  computed: {
    list() {
      if (this.search) {
        return this.products.filter(({ title }) => {
          return title.includes(this.search);
        });
      } else return this.products;
    },
    quantityLabel() {
      if (this.list.length !== 1) {
        return `${this.list.length} Products`;
      } else {
        return `${this.list.length} Product`;
      }
    },
  },
  async created() {
    try {
      this.products = (await this.$axios.get('/api/products')).data.products;
    } catch (error) {
      this.errorMessage = 'Something went wrong!';
    }
  },
  methods: {
    setSearch({ search }) {
      this.search = search;
    },
  },
};
</script>
