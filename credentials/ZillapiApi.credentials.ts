import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ZillapiApi implements ICredentialType {
	name = 'zillapiApi';

	displayName = 'Zillapi API';

	documentationUrl = 'https://zillapi.com/quickstart/';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your Zillapi API key (starts with "zk_"). Create one at https://zillapi.com/signup: 100 free credits, no card required.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Credential verification uses the FREE account endpoint; it validates the
	// key without consuming any credits.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.zillapi.com/v1',
			url: '/me',
		},
	};
}
