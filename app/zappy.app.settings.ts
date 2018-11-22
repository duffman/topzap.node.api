/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

export module Settings {
	export module PriceServiceApi {
		export const Endpoint = "http://localhost:6562";
	}

	export module MongoDb {
		export const mongoDbUrl = "mongodb://localhost:27017/TopZapDB";
	}

	export module Database {
		export const dbName = "topzap-prod";
		export const dbHost = "localhost";
		export const dbUser = "duffman";
		export const dbPass = "bjoe7151212";
	}
}
