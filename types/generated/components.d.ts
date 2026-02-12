import type { Schema, Attribute } from '@strapi/strapi';

export interface CommonBanner extends Schema.Component {
  collectionName: 'components_common_banners';
  info: {
    displayName: 'Banner';
    icon: 'picture';
  };
  attributes: {
    image: Attribute.Media<'images' | 'videos'>;
    banner_text: Attribute.String;
    description: Attribute.Text;
  };
}

export interface CommonKeyFeatures extends Schema.Component {
  collectionName: 'components_common_key_features';
  info: {
    displayName: 'Key Features';
    icon: 'information';
    description: '';
  };
  attributes: {
    description: Attribute.Text;
    key_feature_title: Attribute.Relation<
      'common.key-features',
      'oneToOne',
      'api::key-feature-title.key-feature-title'
    >;
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

export interface ModelModelHighlightsList extends Schema.Component {
  collectionName: 'components_model_model_highlights_lists';
  info: {
    displayName: 'Model Highlights List';
    description: '';
  };
  attributes: {
    list: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 35;
      }>;
  };
}

export interface ModelModelHighlights extends Schema.Component {
  collectionName: 'components_model_model_highlights';
  info: {
    displayName: 'Model Highlights';
    description: '';
  };
  attributes: {
    exteriorImage: Attribute.Media<'images'>;
    lists: Attribute.Component<'model.model-highlights-list', true>;
    interiorImage: Attribute.Media<'images'>;
  };
}

export interface SharedMetaSocial extends Schema.Component {
  collectionName: 'components_shared_meta_socials';
  info: {
    displayName: 'metaSocial';
    icon: 'project-diagram';
    description: '';
  };
  attributes: {
    socialNetwork: Attribute.Enumeration<['Facebook', 'Twitter']> &
      Attribute.Required;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    description: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    image: Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
    description: '';
  };
  attributes: {
    metaTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    metaDescription: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    metaImage: Attribute.Media<'images' | 'files' | 'videos'>;
    metaSocial: Attribute.Component<'shared.meta-social', true>;
    metaRobots: Attribute.String;
    structuredData: Attribute.JSON;
    metaViewport: Attribute.String;
    canonicalURL: Attribute.String;
    keyword: Attribute.Text;
  };
}

export interface StoryPageStoryPage extends Schema.Component {
  collectionName: 'components_story_page_story_pages';
  info: {
    displayName: 'Story Page';
  };
  attributes: {
    image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    caption: Attribute.Text;
    order: Attribute.Integer;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'common.banner': CommonBanner;
      'common.key-features': CommonKeyFeatures;
      'model.high-trim': ModelHighTrim;
      'model.model-highlights-list': ModelModelHighlightsList;
      'model.model-highlights': ModelModelHighlights;
      'shared.meta-social': SharedMetaSocial;
      'shared.seo': SharedSeo;
      'story-page.story-page': StoryPageStoryPage;
    }
  }
}
