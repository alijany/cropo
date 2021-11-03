# cropo

[![OSSAR](https://github.com/alijany/cropo/actions/workflows/ossar-analysis.yml/badge.svg?branch=main)](https://github.com/alijany/cropo/actions/workflows/ossar-analysis.yml)
[![Node.js Package](https://github.com/alijany/cropo/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/alijany/cropo/actions/workflows/npm-publish.yml)
[![Lint Code Base](https://github.com/alijany/cropo/actions/workflows/linter.yml/badge.svg)](https://github.com/alijany/cropo/actions/workflows/linter.yml)

[Project Page](https://alijany.github.io/cropo/)

[code Example on codepen](https://codepen.io/mh_alijnay/pen/MWvErzV)

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
import { Cropo } from 'cropo';
```

using CommonJs

```js
const { Cropo } = require('cropo');
```

### 2 - initialize Cropo with the following code

```js
const cropo = new Cropo({
    imageUrl: image,
    canvas: document.getElementById('canvas'),
    rangeInput: document.getElementById('inputRange')
})
```

### 3 - Optionals

```js
// download canvas image
cropo.download();
// get image as data url
cropo.getDataUrl();
```

## Features <a name = "features"></a>

- Lightweight
- No dependencies
- Touch enabled
- Pinch gesture
- Supports any images format
- Supports url and data url
