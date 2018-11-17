


export class ProductVendor {
	public vendorName: string;
	public allowedTypes: ProductType[];
	public minimumValue: number;
}


export enum ProductType {
	Unset        = 0,
	ConsoleGame  = 1,
	PCGame       = 2,
	MusicCD      = 3,
	DVD          = 4,
	BlueRayDisc  = 5,
	Book         = 6
}


export class ProductItem {
	constructor(
		public name: string = "",
		public type: ProductType = ProductType.Unset,
		public itemId: number = -1,
		public price: number = -1)
	{}
}


export class PriceEngine {
	constructor() {
	}
}

let engine = new PriceEngine();