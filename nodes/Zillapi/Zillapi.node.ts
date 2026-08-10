import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const BASE_URL = 'https://api.zillapi.com/v1';

export class Zillapi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zillapi',
		name: 'zillapi',
		icon: 'file:zillapi.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Look up US property records, Zestimates, photos, schools and price history, and search Zillow listings via Zillapi',
		defaults: {
			name: 'Zillapi',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'zillapiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Property', value: 'property' },
					{ name: 'Listing', value: 'listing' },
					{ name: 'Account', value: 'account' },
				],
				default: 'property',
			},

			// ── Property ─────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['property'] } },
				options: [
					{
						name: 'Get by Address',
						value: 'getByAddress',
						description: 'Full property record from a US street address (3 credits)',
						action: 'Get a property by address',
					},
					{
						name: 'Get by URL',
						value: 'getByUrl',
						description: 'Full property record from a zillow.com link (1 credit per record)',
						action: 'Get a property by zillow com URL',
					},
					{
						name: 'Get by Zpid',
						value: 'getByZpid',
						description: 'Full property record from a numeric Zillow property ID (1 credit)',
						action: 'Get a property by zpid',
					},
					{
						name: 'Get Sub-Resource',
						value: 'getSubResource',
						description:
							'One slice of a property record: photos, price history, tax history, schools, nearby, agent, open houses or facts (1 credit)',
						action: 'Get a property sub resource',
					},
					{
						name: 'Get Zestimate',
						value: 'getZestimate',
						description:
							'Just the Zestimate, rent Zestimate, tax assessed value and last sold price (1 credit)',
						action: 'Get a property zestimate',
					},
				],
				default: 'getByAddress',
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['property'], operation: ['getByAddress'] } },
				default: '',
				placeholder: '17 Zelma Dr, Greenville, SC 29617',
				description: 'US street address with city and state. Loose strings of 6+ characters work.',
			},
			{
				displayName: 'Zillow URL',
				name: 'url',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['property'], operation: ['getByUrl'] } },
				default: '',
				placeholder: 'https://www.zillow.com/homedetails/...',
				description: 'A zillow.com property link',
			},
			{
				displayName: 'Zpid',
				name: 'zpid',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['property'],
						operation: ['getByZpid', 'getZestimate', 'getSubResource'],
					},
				},
				default: '',
				placeholder: '11026031',
				description: 'Numeric Zillow property ID, returned by any lookup or search call',
			},
			{
				displayName: 'Sub-Resource',
				name: 'subResource',
				type: 'options',
				displayOptions: { show: { resource: ['property'], operation: ['getSubResource'] } },
				options: [
					{ name: 'Agent Contact', value: 'agent' },
					{ name: 'Facts', value: 'facts' },
					{ name: 'Nearby Properties', value: 'nearby' },
					{ name: 'Open Houses', value: 'open-houses' },
					{ name: 'Photos', value: 'photos' },
					{ name: 'Price History', value: 'price-history' },
					{ name: 'Schools', value: 'schools' },
					{ name: 'Tax History', value: 'tax-history' },
				],
				default: 'price-history',
				description: 'Which slice of the property record to fetch',
			},
			{
				displayName: 'Options',
				name: 'propertyOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					show: { resource: ['property'], operation: ['getByAddress', 'getByUrl', 'getByZpid'] },
				},
				options: [
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'string',
						default: '',
						placeholder: 'zpid,price,zestimate,address.streetAddress',
						description:
							'Comma-separated dotted-path projection to shrink the 300+ field record to just the slice you need',
					},
					{
						displayName: 'Listing Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'For Rent', value: 'FOR_RENT' },
							{ name: 'For Sale', value: 'FOR_SALE' },
							{ name: 'Recently Sold', value: 'RECENTLY_SOLD' },
						],
						default: 'FOR_SALE',
						description: 'Which listing context to read the record in',
					},
				],
			},

			// ── Listing ──────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['listing'] } },
				options: [
					{
						name: 'Search',
						value: 'search',
						description:
							'Search for sale, for rent or sold listings by location or bounding box (1 credit per result)',
						action: 'Search listings',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				displayOptions: { show: { resource: ['listing'], operation: ['search'] } },
				default: '',
				placeholder: 'Austin, TX or 78704',
				description:
					'City, ZIP or neighborhood string. Leave empty only when a bounding box is set in Filters.',
			},
			{
				displayName: 'Status',
				name: 'listingStatus',
				type: 'options',
				displayOptions: { show: { resource: ['listing'], operation: ['search'] } },
				options: [
					{ name: 'For Rent', value: 'for_rent' },
					{ name: 'For Sale', value: 'for_sale' },
					{ name: 'Sold', value: 'sold' },
				],
				default: 'for_sale',
			},
			{
				displayName: 'Max Results',
				name: 'maxItems',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 50 },
				displayOptions: { show: { resource: ['listing'], operation: ['search'] } },
				default: 10,
				description:
					'Cap on returned listings (max 50). Every returned listing costs one credit, so keep this tight.',
			},
			{
				displayName: 'Filters',
				name: 'listingFilters',
				type: 'collection',
				placeholder: 'Add filter',
				default: {},
				displayOptions: { show: { resource: ['listing'], operation: ['search'] } },
				options: [
					{
						displayName: 'Baths Max',
						name: 'baths_max',
						type: 'number',
						default: 0,
						description: 'Maximum bathrooms',
					},
					{
						displayName: 'Baths Min',
						name: 'baths_min',
						type: 'number',
						default: 0,
						description: 'Minimum bathrooms',
					},
					{
						displayName: 'Beds Max',
						name: 'beds_max',
						type: 'number',
						default: 0,
						description: 'Maximum bedrooms',
					},
					{
						displayName: 'Beds Min',
						name: 'beds_min',
						type: 'number',
						default: 0,
						description: 'Minimum bedrooms',
					},
					{
						displayName: 'Bounding Box',
						name: 'bbox',
						type: 'string',
						default: '',
						placeholder: '-97.85,30.20,-97.65,30.35',
						description: 'Alternative to Location: "west,south,east,north" in decimal degrees',
					},
					{
						displayName: 'Days on Zillow',
						name: 'days_on_zillow',
						type: 'options',
						options: [
							{ name: '1 Day', value: '1' },
							{ name: '7 Days', value: '7' },
							{ name: '14 Days', value: '14' },
							{ name: '30 Days', value: '30' },
							{ name: '90 Days', value: '90' },
							{ name: '6 Months', value: '6m' },
							{ name: '12 Months', value: '12m' },
							{ name: '24 Months', value: '24m' },
							{ name: '36 Months', value: '36m' },
						],
						default: '30',
					},
					{
						displayName: 'Home Types',
						name: 'home_types',
						type: 'string',
						default: '',
						placeholder: 'house,condo,townhouse',
						description:
							'Comma-separated subset of house, condo, townhouse, multi_family, manufactured, lot, apartment',
					},
					{
						displayName: 'Price Max',
						name: 'price_max',
						type: 'number',
						default: 0,
						description: 'Maximum price in dollars',
					},
					{
						displayName: 'Price Min',
						name: 'price_min',
						type: 'number',
						default: 0,
						description: 'Minimum price in dollars',
					},
					{
						displayName: 'Sqft Max',
						name: 'sqft_max',
						type: 'number',
						default: 0,
						description: 'Maximum square footage',
					},
					{
						displayName: 'Sqft Min',
						name: 'sqft_min',
						type: 'number',
						default: 0,
						description: 'Minimum square footage',
					},
					{
						displayName: 'Year Built Max',
						name: 'year_built_max',
						type: 'number',
						default: 0,
						description: 'Latest build year',
					},
					{
						displayName: 'Year Built Min',
						name: 'year_built_min',
						type: 'number',
						default: 0,
						description: 'Earliest build year',
					},
				],
			},

			// ── Account ──────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{
						name: 'Get Profile',
						value: 'getMe',
						description: 'Account profile and plan (free)',
						action: 'Get the account profile',
					},
					{
						name: 'Get Usage',
						value: 'getUsage',
						description: 'Credit balance and usage (free)',
						action: 'Get account usage',
					},
				],
				default: 'getUsage',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let url = '';
				const qs: IDataObject = {};

				if (resource === 'property') {
					if (operation === 'getByAddress') {
						url = '/properties/by-address';
						qs.address = this.getNodeParameter('address', i) as string;
					} else if (operation === 'getByUrl') {
						url = '/properties/by-url';
						qs.url = this.getNodeParameter('url', i) as string;
					} else if (operation === 'getByZpid') {
						url = `/properties/${encodeURIComponent(this.getNodeParameter('zpid', i) as string)}`;
					} else if (operation === 'getZestimate') {
						url = `/properties/${encodeURIComponent(this.getNodeParameter('zpid', i) as string)}/zestimate`;
					} else if (operation === 'getSubResource') {
						const sub = this.getNodeParameter('subResource', i) as string;
						url = `/properties/${encodeURIComponent(this.getNodeParameter('zpid', i) as string)}/${sub}`;
					}
					if (['getByAddress', 'getByUrl', 'getByZpid'].includes(operation)) {
						const opts = this.getNodeParameter('propertyOptions', i, {}) as IDataObject;
						if (opts.fields) qs.fields = opts.fields;
						if (opts.status) qs.status = opts.status;
					}
				} else if (resource === 'listing' && operation === 'search') {
					url = '/listings';
					qs.status = this.getNodeParameter('listingStatus', i) as string;
					qs.max_items = this.getNodeParameter('maxItems', i) as number;
					const location = this.getNodeParameter('location', i, '') as string;
					const filters = this.getNodeParameter('listingFilters', i, {}) as IDataObject;
					if (location) qs.location = location;
					for (const [key, value] of Object.entries(filters)) {
						if (value !== '' && value !== 0 && value !== undefined) qs[key] = value;
					}
					if (!qs.location && !qs.bbox) {
						throw new NodeOperationError(
							this.getNode(),
							'Provide a Location or a Bounding Box filter',
							{ itemIndex: i },
						);
					}
				} else if (resource === 'account') {
					url = operation === 'getMe' ? '/me' : '/usage';
				}

				if (url === '') {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation "${operation}" for resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				const options: IHttpRequestOptions = {
					method: 'GET',
					baseURL: BASE_URL,
					url,
					qs,
					json: true,
				};

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'zillapiApi',
					options,
				)) as IDataObject;

				returnData.push({ json: response, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
