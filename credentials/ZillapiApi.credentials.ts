import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ZillapiApi implements ICredentialType {
	name = 'zillapiApi';

	displayName = 'Zillapi API';

	documentationUrl = 'https://zillapi.com/app/keys';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			placeholder: 'zk_...',
			description:
				'Your Zillapi API key (starts with "zk_"). Sign up at https://zillapi.com/signup (100 free credits, no card required), then create a key at https://zillapi.com/app/keys.',
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
