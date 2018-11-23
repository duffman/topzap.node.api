"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ProductModel {
    constructor(id = null, platformName = null, title = null, publisher = null, developer = null, genre = null, coverImage = null, thumbImage = null, videoSource = null, source = null, releaseDate = null) {
        this.id = id;
        this.platformName = platformName;
        this.title = title;
        this.publisher = publisher;
        this.developer = developer;
        this.genre = genre;
        this.coverImage = coverImage;
        this.thumbImage = thumbImage;
        this.videoSource = videoSource;
        this.source = source;
        this.releaseDate = releaseDate;
    }
}
exports.ProductModel = ProductModel;
