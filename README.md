# How to build PWA in ionic

- Create the ionic project

- ng add @angular/pwa

- firebase init

  - choose Hosting

(Following directions here: https://ionicframework.com/docs/angular/pwa (but I had created the new project earlier.)

```
? Please select an option: Use an existing project
? Select a default Firebase project for this directory: vtn2-pwa-ionic (vtn2-pwa-ionic)
i  Using project vtn2-pwa-ionic (vtn2-pwa-ionic)

=== Hosting Setup
? Detected an existing Angular codebase in the current directory, should we use this? No
? Do you want to use a web framework? (experimental) No

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build's output directory.

? What do you want to use as your public directory? www
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? Set up automatic builds and deploys with GitHub? No
✔  Wrote www/index.html

i  Writing configuration info to firebase.json...
i  Writing project information to .firebaserc...

✔  Firebase initialization complete!
```

- Edit firebase.json according to https://ionicframework.com/docs/angular/pwa adding headers section.

- Edit src/index.html adding this line:
  `<link rel="manifest" href="ngsw.json">`

(Both thse lines should be in index.html)

  <link rel="manifest" href="manifest.webmanifest">
  <link rel="manifest" href="ngsw.json">
)

- To build: `$ ionic build --prod`

- Copy `public/manifest.webmanifest`, `src/firebase-messagin-sw.js`, and `src/combined-sw.js` to `www/`.

- Copy `src/assets` to `www`

- `firebase deploy` or `firebase deploy --only hosting` if you have not changed the cloud functions.
