/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import { IZappyApp }              from "@app/zappy.app";

export class ZappyAppCore implements IZappyApp {
	public getVersion(): string {
		return "topzap.node.api//"
	}
}