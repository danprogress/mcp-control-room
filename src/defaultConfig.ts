import type { JsonObject } from './types';

const defaultConfig: JsonObject = {
  api: {
    openapi: {
      spec_file: './openapi.yml',
      base_url: 'https://api.example.com',
    },
  },
  security: {
    authentication: {
      enabled: true,
      service_account: {
        enabled: true,
        required: true,
        mode: 'oauth',
        header: 'Authorization',
        public_key: null,
        issuer: 'https://idp.example.com/realms/mcp',
        required_scopes: ['mcp_access'],
        prefix: 'Bearer ',
        resource_server_url: 'https://mcp.example.com',
        jwks_uri: 'https://idp.example.com/realms/mcp/protocol/openid-connect/certs',
        algorithms: ['RS256'],
        audience: 'mcp-client',
        client_id: 'mcp-client',
        client_secret: '${MCP_CLIENT_SECRET}',
        jwks_cache_seconds: 300,
        authorization_servers: ['https://idp.example.com/realms/mcp'],
        advertised_scopes: [
          'openid',
          'profile',
          'email',
          'mcp_access',
          'prompts.read',
          'schema.read',
          'tags.read',
        ],
        require_metadata_on_401: true,
        sso_mode: true,
        bearer_methods_supported: ['header'],
        resource_documentation: 'https://mcp.example.com/docs',
        resource_policy_uri: 'https://mcp.example.com/policy',
        revocation_endpoint:
          'https://idp.example.com/realms/mcp/protocol/openid-connect/revoke',
        introspection_endpoint:
          'https://idp.example.com/realms/mcp/protocol/openid-connect/token/introspect',
      },
      user_auth: {
        enabled: false,
        mode: 'token',
        header: 'Authorization',
        prefix: 'Bearer ',
        forward_downstream: null,
        token_exchange: {
          enabled: false,
          url: '',
          method: 'POST',
          timeout_ms: 5000,
          headers: {},
          body: {
            mode: 'json',
            field: 'token',
            include_prefix: false,
          },
          response: {
            type: 'json',
            json_path: 'access_token',
          },
          output: {
            header: 'Authorization',
            prefix: 'Bearer ',
          },
          debug_raw: false,
        },
      },
    },
    authorization: {
      tools: {
        default: ['mcp_access'],
        select_prompts: ['prompts.read'],
        list_all_tags: ['tags.read'],
        get_tool_schema: ['schema.read'],
        get_filter_fields: ['schema.read'],
      },
    },
  },
  runtime: {
    server: {
      name: 'oemcp-server',
      transport: {
        type: 'streamable-http',
        host: '0.0.0.0',
        port: 8500,
        path: '/http',
        tls: {
          certfile: './certs/server.pem',
          keyfile: './certs/server-key.pem',
          cafile: './certs/ca.pem',
          keyfile_password: '${SSL_KEYFILE_PASSWORD}',
          client_cafile: './certs/client-ca.pem',
          require_client_cert: false,
        },
      },
    },
    http: {
      base_url: 'https://api.example.com',
      default_headers: {
        Accept: 'application/json',
      },
      accept_encoding: null,
      response_guard: {
        enabled: true,
        mode: 'block',
        max_array_items: 50,
        max_response_bytes: 1048576,
      },
      tls: {
        certs_dir: './certs/downstream',
        p12_password: '${TLS_P12_PASSWORD}',
        key_password: '${TLS_KEY_PASSWORD}',
        ignoreHostVerification: false,
        insecureSkipVerify: false,
      },
      limits: {
        max_connections: 100,
        max_keepalive_connections: 20,
      },
      debug_raw: false,
    },
    max_request_bytes: 10240,
    middleware: {
      error_handling: {
        enabled: true,
        include_traceback: false,
        transform_errors: true,
      },
      logging: {
        enabled: true,
        structured: true,
        include_payloads: false,
      },
      timing: {
        enabled: false,
      },
      rate_limiting: {
        enabled: true,
        max_requests_per_second: 10.0,
        burst_capacity: 20,
        global: true,
      },
      request_timeout: {
        enabled: true,
        timeout_ms: 500,
      },
      method_validation: {
        enabled: true,
      },
      circuit_breaker: {
        enabled: true,
        error_threshold: 0.5,
        window_seconds: 60,
        min_requests: 10,
      },
    },
    tools: {
      param_validation: {
        enabled: true,
        max_total_bytes: 65536,
        max_string_length: 16384,
        patterns: [
          'javascript:',
          'data:text/html',
          '<script',
          'on\\w+\\s*=',
          'file:',
          '\\.\\./',
          '\\.\\.\\\\',
          '%2e%2e/',
          '%2e%2e\\\\',
          '\\r\\n',
          '%0d%0a',
          '&&',
          '\\|',
          '\\|\\|',
          '\\$\\(',
          '`',
        ],
      },
    },
  },
  assistant: {
    prompts: {
      dir: './prompts',
    },
  },
  observability: {
    logging: {
      level: 'INFO',
      json: true,
      format: '',
      loggers: {},
    },
  },
  openapi_visibility: {
    add_filter_examples: true,
    add_param_examples: true,
    context_dir: './openapi-context',
    global_context_char_limit: 1500,
  },
  openapi_logging: {
    annotations: true,
    verbose: false,
  },
};

export function loadDefaultConfig(): JsonObject {
  return structuredClone(defaultConfig);
}
