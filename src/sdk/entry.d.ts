/* eslint-disable no-undef */
import * as contentstack from 'contentstack';
import * as Utils from '@contentstack/utils';
import axios from 'axios';

import ContentstackLivePreview from '@contentstack/live-preview-utils';

const Stack = contentstack.Stack({
  api_key: process.env.REACT_APP_CONTENTSTACK_API_KEY,
  delivery_token: process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.REACT_APP_CONTENTSTACK_ENVIRONMENT,
  region: process.env.REACT_APP_CONTENTSTACK_REGION ? process.env.REACT_APP_CONTENTSTACK_REGION : 'us',
  live_preview: {
    management_token: process.env.REACT_APP_CONTENTSTACK_MANAGEMENT_TOKEN ? process.env.REACT_APP_CONTENTSTACK_MANAGEMENT_TOKEN : '',
    enable: true,
    host: process.env.REACT_APP_CONTENTSTACK_API_HOST ? process.env.REACT_APP_CONTENTSTACK_API_HOST : '',
  },
});

/**
 * initialize live preview
 */
ContentstackLivePreview.init({
  enable: true,
  stackSdk: Stack,
  clientUrlParams: {
    host: process.env.REACT_APP_CONTENTSTACK_APP_HOST ? process.env.REACT_APP_CONTENTSTACK_APP_HOST : '',
  },
  ssr: false,
});

if (process.env.REACT_APP_CONTENTSTACK_API_HOST) {
  Stack.setHost(process.env.REACT_APP_CONTENTSTACK_API_HOST);
}

const renderOption = {
  ['span']: (node, next) => {
    return next(node.children);
  },
};

export const onEntryChange = ContentstackLivePreview.onEntryChange;

export default {
  /**
   *
   * fetches all the entries from specific content-type
   * @param {* content-type uid} contentTypeUid
   * @param {* reference field name} referenceFieldPath
   * @param {* Json RTE path} jsonRtePath
   *
   */
  getEntry({ contentTypeUid, referenceFieldPath, jsonRtePath }) {
    return new Promise((resolve, reject) => {
      const query = Stack.ContentType(contentTypeUid).Query();
      if (referenceFieldPath) query.includeReference(referenceFieldPath);
      query
        .includeOwner()
        .toJSON()
        .find()
        .then(
          (result) => {
            jsonRtePath &&
              Utils.jsonToHTML({
                entry: result,
                paths: jsonRtePath,
                renderOption,
              });
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  },

  /**
   *fetches specific entry from a content-type
   *
   * @param {* content-type uid} contentTypeUid
   * @param {* url for entry to be fetched} entryUrl
   * @param {* reference field name} referenceFieldPath
   * @param {* Json RTE path} jsonRtePath
   * @returns
   */
  async getEntryByUrl({ contentTypeUid, entryUrl, referenceFieldPath, jsonRtePath }) {
    const data =  new Promise((resolve, reject) => {
      const blogQuery = Stack.ContentType(contentTypeUid).Query();
      if (referenceFieldPath) blogQuery.includeReference(referenceFieldPath);
      blogQuery.includeOwner().toJSON();
      const data = blogQuery.where('url', `${entryUrl}`).find();
      data.then(
        async (result) => {
          jsonRtePath &&
            Utils.jsonToHTML({
              entry: result,
              paths: jsonRtePath,
              renderOption,
            });
            const data = await result[0]
          resolve(result[0]);
        },
        (error) => {
          reject(error);
        }
      );
    });
    const bewData = await data;
    const finaldata =  await enhanceSDKWithToggles(bewData);
    console.log(finaldata, "dcdc")
    return finaldata
  },
};

const API_URL = 'https://dev-fest.devcontentstackapps.com/featureToggle';

function getFeatureToggles(apiKey: string): Promise<object> {
  return new Promise((resolve, reject) => {
    axios
      .get(`${API_URL}?stack_api_key=${apiKey}`)
      .then((resp) => {
        resolve(resp.data);
      })
      .catch(reject);
  });
}


async function enhanceSDKWithToggles(contentstackSDK: any) {

  const author = contentstackSDK[0]?.author?.[0]
  if (author) {
    const fetaureToogles = await getFeatureToggles("blt62a4a10a1212b1c6");
    console.log(fetaureToogles[0]?.enabled, "135")
    const featureFlag = fetaureToogles[0]?.enabled;
    if (featureFlag) {
      console.log("yaha aya kya", contentstackSDK[0]?.author?.[0], fetaureToogles[0])
      author.bio = author.new_bio
    }
  }
  return contentstackSDK
}