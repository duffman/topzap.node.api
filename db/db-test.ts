

import {DbManager} from "@db/database-manager";
import {MinerDb} from "@miner/miner-db";

export class DbTest {
	minerDb: MinerDb;

	constructor() {
		this.minerDb = new MinerDb();
	}

	public execute() {
		let scope = this;
		let db = new DbManager();


		scope.minerDb.checkOutWorkQueue(29, 10).then((res) => {
			console.log("RES ::", res);

		}).catch((err) => {
			console.log("CATCH ::", err);
		});

		/*
		scope.minerDb.getWorkQueue(29, 10).then((res) => {
			let idList = new Array<string>();

			for (let i = 0; i < res.length; i++) {
				let item = res[i];
				let entry = `id=${item.id}`;
				idList.push(entry);
			}

			let sqlString = "UPDATE price_miner_queue SET checkout_time=NOW() WHERE " + idList.join(" OR ");
			console.log(sqlString);
		});
		*/

		/*
		db.runInTransaction("SELECT * FROM price_miner_queue").then((res) => {
			console.log("RES", res);
		});
		*/
	}
}


let app = new DbTest();
app.execute();