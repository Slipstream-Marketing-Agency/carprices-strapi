// src/extensions/content-manager/admin/src/index.js
import ModelEditPage from './pages/Model';

export default {
  routes: [
    {
      method: 'GET',
      path: '/content-manager/collection-types/api::car-model.car-model/:id',
      handler: 'ModelEditPage',
      exact: true,
      component: ModelEditPage,
    },
  ],
};
