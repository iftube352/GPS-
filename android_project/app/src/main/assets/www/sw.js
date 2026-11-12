/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "d758d27281788772936af5ca0ed1b4d0"
  }, {
    "url": "pwa-512x512.png",
    "revision": "0f15faadca82c229a5e177888a9029c7"
  }, {
    "url": "pwa-192x192.png",
    "revision": "3ed38a43950244257f485dd1c0d7f978"
  }, {
    "url": "index.html",
    "revision": "c0f1a72743a037b37afb7c9497f3c463"
  }, {
    "url": "icon.svg",
    "revision": "02edcbaaf0fc9a9f006216ff37dcf8f6"
  }, {
    "url": "archive-gallery.html",
    "revision": "0a00b7546e02ffd504238f5d1d7cf924"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "72186f321d33c42b49e26fc4968047cc"
  }, {
    "url": "assets/purify.es-Dqk5qvad.js",
    "revision": null
  }, {
    "url": "assets/index.es-BtTJfVXo.js",
    "revision": null
  }, {
    "url": "assets/index-CirFpsVF.js",
    "revision": null
  }, {
    "url": "assets/index-BKu_zaPs.css",
    "revision": null
  }, {
    "url": "assets/aistudio/yputube_d9e9a0fb.png",
    "revision": null
  }, {
    "url": "assets/aistudio/whatsapp_236996ca.png",
    "revision": null
  }, {
    "url": "assets/aistudio/twitter_4c1342d0.png",
    "revision": null
  }, {
    "url": "assets/aistudio/linkdin_91d33015.png",
    "revision": null
  }, {
    "url": "assets/aistudio/instagram_be056fee.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_035.svg",
    "revision": null
  }, {
    "url": "assets/aistudio/image_035.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_031.svg",
    "revision": null
  }, {
    "url": "assets/aistudio/image_031.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_022_5c47eeaa.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_021_491fb5ac.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_020_a379be76.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_019_11ad539e.png",
    "revision": null
  }, {
    "url": "assets/aistudio/facebook_b4556ed7.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Microsoft_Profile_78e13ce1.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Meta_AI_4_e1180f35.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Imgae__004_ddf9db50.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Image_012.svg",
    "revision": null
  }, {
    "url": "assets/aistudio/Gemini_3_b7bc17c8.png",
    "revision": null
  }, {
    "url": "assets/aistudio/DeepSeek_2_60f2583f.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Copilot_5_a640519f.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Claude_6_abb83862.png",
    "revision": null
  }, {
    "url": "assets/aistudio/ChatGPT_1_132a42df.png",
    "revision": null
  }, {
    "url": "assets/aistudio/20260903_200547_79893d25.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "72186f321d33c42b49e26fc4968047cc"
  }, {
    "url": "icon.svg",
    "revision": "02edcbaaf0fc9a9f006216ff37dcf8f6"
  }, {
    "url": "pwa-192x192.png",
    "revision": "3ed38a43950244257f485dd1c0d7f978"
  }, {
    "url": "pwa-512x512.png",
    "revision": "0f15faadca82c229a5e177888a9029c7"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "d758d27281788772936af5ca0ed1b4d0"
  }, {
    "url": "manifest.webmanifest",
    "revision": "f1cd00a9f55aab316ebc4e9725e372c0"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
