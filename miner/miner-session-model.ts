/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
export class MinerSessionModel {
	constructor(
		public id: number,
		public sessionKey: string,
		public minerName: string,
		public created: string,
		public vendorId: number,
		public completed: number,
	) {}
}

export interface IMinerWorkItem {
	id: number;
	barcode: string;
}

export class MinerWorkItem implements IMinerWorkItem {
	constructor(
		public id: number,
		public sessionId: number,
		public barcode: string,
		public price: string,
		public message: string,
		public processedWhen: string
	) {}
}

export class MinerWorkItemUpdate {
	constructor(
		public id: number,
		public sessionId: number,
		public accepted: boolean,
		public price: number,
		public message: string
	) {}
}


export class MinerWorkItemSlim implements IMinerWorkItem {
	constructor(
		public id: number,
		public barcode: string,
	) {}
}