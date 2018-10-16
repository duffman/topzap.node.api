"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ProductModel {
    constructor(id, platformName, title, publisher, developer, genre, coverImage, thumbImage, videoSource, source, releaseDate) {
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
