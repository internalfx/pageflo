# PageFlo

PageFlo is an open source headless CMS that gives you the flexibility to host almost any content you can imagine.

### Features

- Handles multiple publications, apps or websites.
- Create custom content types.
- File storage.
- Image resizing.
- Video streaming.
- Simple JSON api

### Run a dev server in minutes

> note: It is assumed you are using nvm.

#### 1. Get a DB server running.

PageFlo uses [ArangoDB](https://www.arangodb.com/) as its datastore. There are many options for running it.

- [Get a DB hosted for you.](https://cloud.arangodb.com/home)
- [Run an enterprise edition.](https://www.arangodb.com/download-arangodb-enterprise/)
- [Run the (awesome!) community version on your own computer.](https://www.arangodb.com/download-major/)

#### 2. Get the code.

```
git clone https://github.com/internalfx/pageflo.git
```

#### 3. Get dependencies

```
nvm exec yarn
```

#### 4. Copy example config file

```
cp example-config.js config.js
```

#### 5. modify config to suite your needs

```
nano config.js
```

#### 6. start your dev server!

```
nvm run app.js --build
```

## Poorly Made demonstration video!

[Watch Now!](https://pageflo2.aam.site/api/client/file/download/1582317980692X1vcs7xx9)

## Screenshots

#### Content Editor
![Content Editor](https://github.com/internalfx/pageflo/raw/master/static/contentEditor.png)

#### Files
![Files](https://github.com/internalfx/pageflo/raw/master/static/files.png)

#### Type Editor
![Type Editor](https://github.com/internalfx/pageflo/raw/master/static/typeEditor.png)