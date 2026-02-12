import type { Schema, Attribute } from '@strapi/strapi';

export interface CommonBanner extends Schema.Component {
  collectionName: 'components_common_banners';
  info: {
    displayName: 'Banner';
    icon: 'picture';
  };
  attributes: {
    image: Attribute.Media;
    banner_text: Attribute.String;
    description: Attribute.Text;
  };
}

export interface ModelHighTrim extends Schema.Component {
  collectionName: 'components_model_high_trims';
  info: {
    displayName: 'High Trim';
    icon: 'car';
  };
  attributes: {
    car_trim: Attribute.Relation<
      'model.high-trim',
      'oneToOne',
      'api::car-trim.car-trim'
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'common.banner': CommonBanner;
      'model.high-trim': ModelHighTrim;
    }
  }
}
