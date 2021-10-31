# cropo

[Project Page](https://alijany.github.io/cropo/)

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Features](#features)

## About <a name = "about"></a>

Cropo is a fast, lightweight image cropping tools for JavaScript. Resize and crop your uploaded image using a intuitive user interface.

## Getting Started <a name = "getting_started"></a>

### Install via NPM

```bash
npm install --save cropo
```

### Install via Yarn

```bash
yarn add --save cropo
```

## Usage <a name = "usage"></a>

### 1 - Include the cropo using ES modules

using ES modules

```js
import cr from 'cropo';
```

using CommonJs

```js
const cr = require('cropo');
```

### 2 - initialize Cropo with the following code

```js
// load html canvas element
cr.loadCanvas(document.getElementById('canvas'));
// load image
cr.loadImageFromUrl('https://loacl/landscape/3.jpg');
```

### 3 - Optionals

```js
// select an input to control zoom level
cr.loadSlider(document.getElementById("myRange"))
```

input range most be between 1 and 5

### 4 - Download or upload image

```js
// download canvas image
cr.download();
// get image as data url
cr.getDataUrl();
```

## Features <a name = "features"></a>

- Lightweight
- No dependencies
- Touch enabled
- Pinch gesture
- Supports any images format
- Supports url and data url
