# Campbell

## Features

- Easy and time saving file tree based web routing
- Modular !!!
- Hot reloading for frontend **and** backend

## Documentation

### Directory structure

```
my-app
├── campbell.config.js
├── public
│   ├── api
│   │   └── router.js
│   ├── index.vue
│   └── dashboard.vue
└── plugins
    ├── my-plugin
    ├── my-other-plugin
    └── ...
```

#### the public dir

This is the main directory of your project :

- .vue files will be rendered by [**nuxt**]("https://nuxtjs.org/") as this is considered as nuxt's **pages** directory.
- router.js files can create routers for the [**express**]("https://expressjs.com/") server embedded in the **instance**
- socket.js does the same as router but with [**socket.io**]("https://socket.io/") namespaces
