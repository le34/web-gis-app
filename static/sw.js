importScripts('workbox-sw.prod.v1.3.0.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "/_nuxt/app.65d630ff3144bd2156fe.js",
    "revision": "09b327b6c3d16b4792d33a6521840ea0"
  },
  {
    "url": "/_nuxt/common.a8b9bf3351c0ce13e83f.js",
    "revision": "c95a62c44be224c47f4f52f191f990f1"
  },
  {
    "url": "/_nuxt/layouts/admin.c39fe4f4b76fa9632770.js",
    "revision": "22e9bad2ba46590a27be99994d2980dd"
  },
  {
    "url": "/_nuxt/layouts/company.35fd9a2681c245a75cc9.js",
    "revision": "d937945b9b8e24d37aef75dff2a63248"
  },
  {
    "url": "/_nuxt/layouts/default.35e79fb19e4d3daa4acd.js",
    "revision": "e5b63a0fc54db6085bbf4f8dbe5e8587"
  },
  {
    "url": "/_nuxt/manifest.4567e8cfd308f9c19715.js",
    "revision": "6ef0b46c75cf80dc0042024a863baea3"
  },
  {
    "url": "/_nuxt/pages/admin.d3b8c08aaaec14c31cd6.js",
    "revision": "804f5753f240f33c5a09d83ac81d9eeb"
  },
  {
    "url": "/_nuxt/pages/admin/company/_id/clients.d4b2fc4902a66c29cdbb.js",
    "revision": "006fff1e99a446fb1bf5635c06887ba6"
  },
  {
    "url": "/_nuxt/pages/admin/company/_id/data/_dataId/index.ec766855ea46745651fc.js",
    "revision": "321707d149d7e927201aba4559f9ce8f"
  },
  {
    "url": "/_nuxt/pages/admin/company/_id/data/_dataId/map.549d1567bc37de97b2fa.js",
    "revision": "03484539e22a2190da46ff3d94e989f6"
  },
  {
    "url": "/_nuxt/pages/admin/company/_id/data/index.e05b4b9237d14e6fabad.js",
    "revision": "94af0904685183d5a4bdc77a0a92b65e"
  },
  {
    "url": "/_nuxt/pages/admin/company/_id/index.ceac27c8c13cf8c8e87d.js",
    "revision": "83077a7663d7d460e088b78cb620242a"
  },
  {
    "url": "/_nuxt/pages/admin/company/_id/users.5c1b9a87a37d2ffabdf3.js",
    "revision": "bcaef554a633b6e85c86df1d703e3a54"
  },
  {
    "url": "/_nuxt/pages/admin/company/index.1b4976638353af8a3ff7.js",
    "revision": "b3f04230a60916c99544e3266a65486d"
  },
  {
    "url": "/_nuxt/pages/admin/data/_id/index.b40efbb495938833bd6a.js",
    "revision": "ed212c5a05b7796a91cb834e70ee313d"
  },
  {
    "url": "/_nuxt/pages/admin/data/_id/map.89e1d1efaa6c0b1e1fa7.js",
    "revision": "cec31a609f8cac7cdfedc75d0f94fa5b"
  },
  {
    "url": "/_nuxt/pages/admin/data/index.ab43e93998f8fdbb000c.js",
    "revision": "c06c54372aaba23513dc8625245b9c01"
  },
  {
    "url": "/_nuxt/pages/admin/files/index.fcc2dd36ff5841715a10.js",
    "revision": "6cf8b0e32e86db5f68055c222696aed9"
  },
  {
    "url": "/_nuxt/pages/admin/index.6d151b07d81d66de075c.js",
    "revision": "54f5e6f8b1a97b763dbad0a4eee9e3e1"
  },
  {
    "url": "/_nuxt/pages/admin/users/_id.726fc4beac87304d99e6.js",
    "revision": "a45e07d868775e2f84ef406cc4437586"
  },
  {
    "url": "/_nuxt/pages/admin/users/index.a4c682acaea375a2c6c7.js",
    "revision": "62f56b7596a122e18f77a5e2dd0fd37f"
  },
  {
    "url": "/_nuxt/pages/index.18234be8c7e5d0bb5899.js",
    "revision": "1f9d9a0aa5079f36a5bc7fd83f4735c4"
  },
  {
    "url": "/_nuxt/pages/index/index.6d65c7a12120741eae8b.js",
    "revision": "8f7bf2028f2992baf1d481914cc28159"
  },
  {
    "url": "/_nuxt/pages/login.4c6c02814b7060850da7.js",
    "revision": "6e8a69b54b39eeffec03f41e3744b4da"
  },
  {
    "url": "/_nuxt/pages/map.b33eca9acf12b6fabd6c.js",
    "revision": "305d0a003a13b747ebb23731ca9f3c90"
  },
  {
    "url": "/_nuxt/pages/map/_companyId/_dataId.13bcd2c0308360b98ec3.js",
    "revision": "89850bbf6d6b710cded8ec6099045c68"
  },
  {
    "url": "/_nuxt/pages/map/_companyId/index.d6736c536d2f4492a004.js",
    "revision": "c94a2496b31204c25ed368845ab44dba"
  },
  {
    "url": "/_nuxt/pages/map/index.7cd31bda3086093958fe.js",
    "revision": "c80affb1e79dff8b01ea375ef5b59453"
  },
  {
    "url": "/_nuxt/pages/reset/_token.1c36ef518088c109d2db.js",
    "revision": "e9a5633dad4e37053163397922809ed2"
  },
  {
    "url": "/_nuxt/pages/rune.6b664aa31962571674c2.js",
    "revision": "8cf8044b9d8bd728b1a8c37cfdacd76a"
  },
  {
    "url": "/_nuxt/pages/rune/index.d4de0f79f26801608041.js",
    "revision": "0125af52ad64440af39d0e1123a231dd"
  },
  {
    "url": "/_nuxt/pages/verify/_token.f00a89f4b567a04cd4aa.js",
    "revision": "9e86bc6c60ce526bd1c3e3d533ec159e"
  }
];

const workboxSW = new self.WorkboxSW({
  "cacheId": "le34-survey_1.0.0",
  "clientsClaim": true,
  "directoryIndex": "/"
});
workboxSW.precache(fileManifest);
workboxSW.router.registerRoute('/**', workboxSW.strategies.networkFirst({}), 'GET');
workboxSW.router.registerRoute('/_nuxt/**', workboxSW.strategies.cacheFirst({}), 'GET');
