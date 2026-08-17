import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { loadDefaultConfig } from './defaultConfig';
import type { JsonObject, JsonValue } from './types';
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Cloud,
  Code2,
  Copy,
  Download,
  FileJson,
  Gauge,
  KeyRound,
  LockKeyhole,
  Network,
  RotateCcw,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  Trash2,
  Upload,
  Wrench,
} from 'lucide-react';

type SectionKey = 'api' | 'security' | 'runtime' | 'assistant' | 'observability';
type FieldKind = 'text' | 'number' | 'toggle' | 'list' | 'select';
type FieldDefinition = { path: string; label: string; hint?: string; kind: FieldKind; options?: string[] };
type SectionDefinition = { key: SectionKey; label: string; eyebrow: string; icon: typeof ShieldCheck; fields: FieldDefinition[] };

const sections: SectionDefinition[] = [
  { key: 'api', label: 'API contract', eyebrow: '01 · Interface', icon: FileJson, fields: [{ path: 'api.openapi.spec_file', label: 'OpenAPI spec file', hint: 'The contract used to describe available operations.', kind: 'text' }, { path: 'api.openapi.base_url', label: 'Base URL', hint: 'The root URL for API requests.', kind: 'text' }] },
  { key: 'security', label: 'Security', eyebrow: '02 · Access control', icon: ShieldCheck, fields: [
    { path: 'security.authentication.enabled', label: 'Authentication enabled', kind: 'toggle' },
    { path: 'security.authentication.service_account.enabled', label: 'Service account enabled', kind: 'toggle' },
    { path: 'security.authentication.service_account.required', label: 'Require service account', kind: 'toggle' },
    { path: 'security.authentication.service_account.mode', label: 'Authentication mode', kind: 'select', options: ['token', 'oauth'] },
    { path: 'security.authentication.service_account.header', label: 'Service account header', kind: 'text' },
    { path: 'security.authentication.service_account.prefix', label: 'Prefix', kind: 'text' },
    { path: 'security.authentication.service_account.audience', label: 'Audience', kind: 'text' },
    { path: 'security.authentication.service_account.public_key', label: 'Public key', kind: 'text' },
    { path: 'security.authentication.service_account.issuer', label: 'Token issuer', kind: 'text' },
    { path: 'security.authentication.service_account.required_scopes', label: 'Required scopes', hint: 'Separate multiple values with commas.', kind: 'list' },
    { path: 'security.authentication.service_account.jwks_uri', label: 'JWKS URI', kind: 'text' },
    { path: 'security.authentication.service_account.algorithms', label: 'Allowed algorithms', hint: 'Separate multiple values with commas.', kind: 'list' },
    { path: 'security.authentication.service_account.jwks_cache_seconds', label: 'JWKS cache duration', hint: 'Seconds.', kind: 'number' },
    { path: 'security.authentication.user_auth.enabled', label: 'User authentication enabled', kind: 'toggle' },
  ] },
  { key: 'runtime', label: 'Runtime', eyebrow: '03 · Server behavior', icon: Server, fields: [
    { path: 'runtime.max_request_bytes', label: 'Maximum request size', hint: 'Bytes.', kind: 'number' },
    { path: 'runtime.server.name', label: 'Server name', kind: 'text' },
    { path: 'runtime.server.transport.type', label: 'Transport type', kind: 'select', options: ['streamable-http', 'tls'] },
    { path: 'runtime.server.transport.host', label: 'Transport host', kind: 'text' },
    { path: 'runtime.server.transport.port', label: 'Transport port', kind: 'number' },
    { path: 'runtime.server.transport.path', label: 'Transport path', kind: 'text' },
    { path: 'runtime.server.transport.tls.certfile', label: 'Certificate file', kind: 'text' },
    { path: 'runtime.server.transport.tls.keyfile', label: 'Key file', kind: 'text' },
    { path: 'runtime.server.transport.tls.client_cafile', label: 'Client CA file', kind: 'text' },
    { path: 'runtime.server.transport.tls.require_client_cert', label: 'Require client certificate', kind: 'toggle' },
    { path: 'runtime.server.transport.tls.keyfile_password', label: 'Key file password', kind: 'text' },
    { path: 'runtime.http.base_url', label: 'HTTP base URL', kind: 'text' },
    { path: 'runtime.http.response_guard.enabled', label: 'Response guard enabled', kind: 'toggle' },
    { path: 'runtime.http.response_guard.mode', label: 'Response guard mode', kind: 'text' },
    { path: 'runtime.http.response_guard.max_array_items', label: 'Maximum array items', kind: 'number' },
    { path: 'runtime.http.response_guard.max_response_bytes', label: 'Maximum response size', hint: 'Bytes.', kind: 'number' },
    { path: 'runtime.http.limits.max_connections', label: 'Maximum connections', kind: 'number' },
    { path: 'runtime.http.limits.max_keepalive_connections', label: 'Keep-alive connections', kind: 'number' },
    { path: 'runtime.http.tls.certs_dir', label: 'TLS certificates directory', kind: 'text' },
    { path: 'runtime.http.tls.insecureSkipVerify', label: 'Skip TLS verification', kind: 'toggle' },
    { path: 'runtime.http.tls.ignoreHostVerification', label: 'Ignore host verification', kind: 'toggle' },
    { path: 'runtime.middleware.error_handling.enabled', label: 'Error handling enabled', kind: 'toggle' },
    { path: 'runtime.middleware.error_handling.transform_errors', label: 'Transform errors', kind: 'toggle' },
    { path: 'runtime.middleware.error_handling.include_traceback', label: 'Include traceback', kind: 'toggle' },
    { path: 'runtime.middleware.logging.enabled', label: 'Logging enabled', kind: 'toggle' },
    { path: 'runtime.middleware.logging.structured', label: 'Structured logging', kind: 'toggle' },
    { path: 'runtime.middleware.logging.include_payloads', label: 'Include payloads in logs', kind: 'toggle' },
    { path: 'runtime.middleware.request_timeout.enabled', label: 'Request timeout enabled', kind: 'toggle' },
    { path: 'runtime.middleware.request_timeout.timeout_ms', label: 'Request timeout', hint: 'Milliseconds.', kind: 'number' },
    { path: 'runtime.middleware.method_validation.enabled', label: 'Method validation enabled', kind: 'toggle' },
    { path: 'runtime.middleware.circuit_breaker.enabled', label: 'Circuit breaker enabled', kind: 'toggle' },
    { path: 'runtime.middleware.circuit_breaker.error_threshold', label: 'Circuit breaker error threshold', kind: 'number' },
    { path: 'runtime.middleware.circuit_breaker.window_seconds', label: 'Circuit breaker window', hint: 'Seconds.', kind: 'number' },
    { path: 'runtime.middleware.circuit_breaker.min_requests', label: 'Minimum requests', kind: 'number' },
    { path: 'runtime.middleware.rate_limiting.enabled', label: 'Rate limiting enabled', kind: 'toggle' },
    { path: 'runtime.middleware.rate_limiting.max_requests_per_second', label: 'Requests per second', kind: 'number' },
    { path: 'runtime.middleware.rate_limiting.burst_capacity', label: 'Burst capacity', kind: 'number' },
    { path: 'runtime.middleware.rate_limiting.global', label: 'Global rate limit', kind: 'toggle' },
    { path: 'runtime.middleware.audit.enabled', label: 'Audit logging enabled', kind: 'toggle' },
    { path: 'runtime.middleware.audit.file', label: 'Audit log file', kind: 'text' },
    { path: 'runtime.middleware.audit.max_bytes', label: 'Audit log max size', hint: 'Bytes.', kind: 'number' },
    { path: 'runtime.middleware.audit.backup_count', label: 'Audit backup count', kind: 'number' },
    { path: 'runtime.middleware.audit.mode', label: 'Audit log mode', kind: 'text' },
    { path: 'runtime.tools.param_validation.enabled', label: 'Parameter validation enabled', kind: 'toggle' },
    { path: 'runtime.tools.param_validation.max_total_bytes', label: 'Maximum parameter size', hint: 'Bytes.', kind: 'number' },
    { path: 'runtime.tools.param_validation.max_string_length', label: 'Maximum string length', kind: 'number' },
    { path: 'runtime.tools.param_validation.patterns', label: 'Blocked patterns', hint: 'Separate multiple values with commas.', kind: 'list' },
  ] },
  { key: 'assistant', label: 'Assistant', eyebrow: '04 · Content', icon: Wrench, fields: [{ path: 'assistant.prompts.dir', label: 'Prompts directory', kind: 'text' }] },
  { key: 'observability', label: 'Observability', eyebrow: '05 · Diagnostics', icon: Activity, fields: [
    { path: 'observability.logging.level', label: 'Log level', kind: 'text' },
    { path: 'observability.logging.json', label: 'JSON logs', kind: 'toggle' },
    { path: 'observability.logging.loggers.middleware.circuit_breaker', label: 'Circuit breaker logger', kind: 'text' },
    { path: 'observability.logging.loggers.middleware.timeout', label: 'Timeout logger', kind: 'text' },
    { path: 'observability.logging.loggers.http.outbound', label: 'Outbound HTTP logger', kind: 'text' },
    { path: 'observability.logging.loggers.auth', label: 'Auth logger', kind: 'text' },
  ] },
];

function getPathKeys(path: string): string[] {
  const loggerPrefix = 'observability.logging.loggers.';
  return path.startsWith(loggerPrefix) ? [...loggerPrefix.slice(0, -1).split('.'), path.slice(loggerPrefix.length)] : path.split('.');
}

function getValue(config: JsonObject, path: string): JsonValue | undefined {
  return getPathKeys(path).reduce<JsonValue | undefined>((value, key) => (value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject)[key] : undefined), config);
}

function setValue(config: JsonObject, path: string, value: JsonValue): JsonObject {
  const next = structuredClone(config) as JsonObject;
  const keys = getPathKeys(path);
  let cursor = next;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) cursor[key] = value;
    else {
      if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) cursor[key] = {};
      cursor = cursor[key] as JsonObject;
    }
  });
  return next;
}

function formatValue(value: JsonValue | undefined): string {
  return Array.isArray(value) ? value.join(', ') : String(value ?? '');
}

function formatGroupLabel(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getFieldGroup(field: FieldDefinition, sectionKey: SectionKey): string {
  const keys = getPathKeys(field.path);
  const sectionIndex = keys.indexOf(sectionKey);
  return keys.slice(sectionIndex + 1, -1).map(formatGroupLabel).join(' / ');
}

function isEmptyValue(field: FieldDefinition, value: JsonValue | undefined): boolean {
  if (field.kind === 'toggle') return value !== true;
  if (field.kind === 'list') return !Array.isArray(value) || value.length === 0;
  return value === '' || value === undefined || value === null;
}

function cleanEmpty(obj: JsonObject): boolean {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      if (cleanEmpty(val as JsonObject)) delete obj[key];
    }
  }
  return Object.keys(obj).length === 0;
}

function pruneConfig(config: JsonObject): JsonObject {
  const pruned = structuredClone(config) as JsonObject;
  const allFields = sections.flatMap((s) => s.fields);
  for (const field of allFields) {
    if (isEmptyValue(field, getValue(pruned, field.path))) {
      const keys = getPathKeys(field.path);
      let parent: JsonObject | undefined = pruned;
      for (let i = 0; i < keys.length - 1; i++) {
        const next = parent[keys[i]];
        if (typeof next !== 'object' || next === null || Array.isArray(next)) { parent = undefined; break; }
        parent = next as JsonObject;
      }
      if (parent) delete parent[keys[keys.length - 1]];
    }
  }
  cleanEmpty(pruned);
  return pruned;
}

type ValidationIssue = { severity: 'error' | 'warning'; message: string; path?: string };

function validateConfig(config: JsonObject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const knownSections = sections.map((s) => s.key);
  const present = knownSections.filter((key) => key in config);
  if (!present.length) issues.push({ severity: 'error', message: 'No recognized configuration sections are present.' });

  const get = (path: string): JsonValue | undefined => getValue(config, path);
  const requireString = (path: string, label: string) => {
    const v = get(path);
    if (v === undefined || v === null || v === '') issues.push({ severity: 'error', message: `${label} is required.`, path });
    else if (typeof v !== 'string') issues.push({ severity: 'error', message: `${label} must be text.`, path });
  };
  const requireNumber = (path: string, label: string, min?: number, max?: number) => {
    const v = get(path);
    if (v === undefined || v === null || v === '') issues.push({ severity: 'error', message: `${label} is required.`, path });
    else if (typeof v !== 'number' || Number.isNaN(v)) issues.push({ severity: 'error', message: `${label} must be a number.`, path });
    else if (min !== undefined && v < min) issues.push({ severity: 'error', message: `${label} must be at least ${min}.`, path });
    else if (max !== undefined && v > max) issues.push({ severity: 'error', message: `${label} must be at most ${max}.`, path });
  };
  const requireUrl = (path: string, label: string) => {
    const v = get(path);
    if (v === undefined || v === null || v === '') issues.push({ severity: 'error', message: `${label} is required.`, path });
    else if (typeof v !== 'string' || !/^https?:\/\/.+/i.test(v)) issues.push({ severity: 'warning', message: `${label} should be a valid HTTP(S) URL.`, path });
  };
  const requireList = (path: string, label: string) => {
    const v = get(path);
    if (v === undefined || v === null) issues.push({ severity: 'warning', message: `${label} is empty.`, path });
    else if (!Array.isArray(v)) issues.push({ severity: 'error', message: `${label} must be a list.`, path });
    else if (v.length === 0) issues.push({ severity: 'warning', message: `${label} is empty.`, path });
  };

  if ('runtime' in config) {
    requireString('runtime.server.name', 'Server name');
    requireString('runtime.server.transport.type', 'Transport type');
    requireString('runtime.server.transport.host', 'Transport host');
    if (get('runtime.server.transport.type') === 'streamable-http') requireNumber('runtime.server.transport.port', 'Transport port', 1, 65535);
    requireNumber('runtime.max_request_bytes', 'Maximum request size', 1);
    if (get('runtime.http.response_guard.enabled') === true) {
      requireString('runtime.http.response_guard.mode', 'Response guard mode');
      requireNumber('runtime.http.response_guard.max_array_items', 'Maximum array items', 1);
      requireNumber('runtime.http.response_guard.max_response_bytes', 'Maximum response size', 1);
    }
    if (get('runtime.middleware.rate_limiting.enabled') === true) {
      requireNumber('runtime.middleware.rate_limiting.max_requests_per_second', 'Requests per second', 1);
      requireNumber('runtime.middleware.rate_limiting.burst_capacity', 'Burst capacity', 1);
    }
    if (get('runtime.middleware.circuit_breaker.enabled') === true) {
      requireNumber('runtime.middleware.circuit_breaker.error_threshold', 'Circuit breaker error threshold', 0, 1);
      requireNumber('runtime.middleware.circuit_breaker.window_seconds', 'Circuit breaker window', 1);
      requireNumber('runtime.middleware.circuit_breaker.min_requests', 'Minimum requests', 1);
    }
    if (get('runtime.tools.param_validation.enabled') === true) {
      requireNumber('runtime.tools.param_validation.max_total_bytes', 'Maximum parameter size', 1);
      requireNumber('runtime.tools.param_validation.max_string_length', 'Maximum string length', 1);
      requireList('runtime.tools.param_validation.patterns', 'Blocked patterns');
    }
  }
  if ('security' in config) {
    if (get('security.authentication.enabled') === true) {
      requireString('security.authentication.service_account.mode', 'Authentication mode');
      requireString('security.authentication.service_account.header', 'Service account header');
      requireUrl('security.authentication.service_account.issuer', 'Token issuer');
      requireUrl('security.authentication.service_account.jwks_uri', 'JWKS URI');
      requireList('security.authentication.service_account.required_scopes', 'Required scopes');
      requireList('security.authentication.service_account.algorithms', 'Allowed algorithms');
    }
  }
  if ('observability' in config) {
    requireString('observability.logging.level', 'Log level');
  }
  return issues;
}

function App() {
  const [config, setConfig] = useState<JsonObject>({});
  const [savedConfig, setSavedConfig] = useState<JsonObject>({});
  const [loaded, setLoaded] = useState(false);
  const [availableSections, setAvailableSections] = useState<SectionDefinition[]>(sections);
  const [activeSection, setActiveSection] = useState<SectionKey>('security');
  const [showAllOutput, setShowAllOutput] = useState(false);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SectionDefinition | null>(null);
  const [pendingReset, setPendingReset] = useState(false);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[] | null>(null);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const data = loadDefaultConfig();
    const pruned = pruneConfig(data);
    setConfig(pruned);
    setSavedConfig(structuredClone(pruned));
    setLoaded(true);
  }, []);

  const focusField = (path: string) => {
    const sectionKey = path.split('.')[0] as SectionKey;
    const section = availableSections.find((s) => s.key === sectionKey);
    if (section) {
      setActiveSection(sectionKey);
      setShowAllOutput(false);
      setQuery('');
    }
    setHighlightedField(path);
    setTimeout(() => {
      const el = fieldRefs.current[path];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    setTimeout(() => setHighlightedField(null), 3000);
  };

  const active = availableSections.find((section) => section.key === activeSection) ?? availableSections[0];
  const transportType = getValue(config, 'runtime.server.transport.type');
  const filteredFields = useMemo(() => active?.fields.filter((field) => {
    const isHttpTransportField = ['runtime.server.transport.host', 'runtime.server.transport.port', 'runtime.server.transport.path'].includes(field.path);
    const isTlsTransportField = field.path.startsWith('runtime.server.transport.tls.');
    if (isHttpTransportField && transportType === 'tls') return false;
    if (isTlsTransportField && transportType !== 'tls') return false;
    return `${field.label} ${field.path}`.toLowerCase().includes(query.toLowerCase());
  }) ?? [], [active, query, transportType]);
  const previewConfig = showAllOutput || !active ? config : { [active.key]: config[active.key] };
  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  const clearResetNotice = () => {
    setNotice((current) => current?.text === 'Configuration reset to default values.' ? null : current);
  };

  const updateField = (field: FieldDefinition, event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const raw = event.target.value;
    const value: JsonValue = field.kind === 'number' ? (raw === '' ? '' : Number(raw)) : field.kind === 'list' ? raw.split(',').map((item) => item.trim()).filter(Boolean) : raw;
    clearResetNotice();
    setConfig((current) => {
      if (field.path !== 'runtime.server.transport.type') return pruneConfig(setValue(current, field.path, value));
      const next = structuredClone(current) as JsonObject;
      const transport = getValue(next, 'runtime.server.transport') as JsonObject;
      transport.type = value;
      if (value === 'tls') {
        delete transport.host;
        delete transport.port;
        delete transport.path;
        transport.tls = { certfile: './certs/server.crt', keyfile: './certs/server.key', client_cafile: './certs/client-ca.pem', require_client_cert: false, keyfile_password: '' };
      } else {
        delete transport.tls;
        transport.host = '0.0.0.0';
        transport.port = 8500;
        transport.path = '/http';
      }
      return pruneConfig(next);
    });
    setNotice(null);
    setValidationIssues(null);
  };

  const updateToggle = (field: FieldDefinition, checked: boolean) => {
    clearResetNotice();
    setConfig((current) => pruneConfig(setValue(current, field.path, checked)));
    setNotice(null);
    setValidationIssues(null);
  };
  const deleteField = (field: FieldDefinition) => {
    clearResetNotice();
    const fieldsToRemove = new Set(active.fields.filter((f) => f.path === field.path || f.path.startsWith(field.path + '.')).map((f) => f.path));
    const next = structuredClone(config) as JsonObject;
    for (const path of fieldsToRemove) {
      const keys = getPathKeys(path);
      let parent: JsonObject | undefined = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const child = parent[keys[i]];
        if (typeof child !== 'object' || child === null || Array.isArray(child)) { parent = undefined; break; }
        parent = child as JsonObject;
      }
      if (parent) delete parent[keys[keys.length - 1]];
    }
    cleanEmpty(next);
    const remainingFields = active.fields.filter((f) => !fieldsToRemove.has(f.path));
    if (remainingFields.length === 0) {
      delete next[active.key];
      setConfig(next);
      const remaining = availableSections.filter((s) => s.key !== active.key);
      setAvailableSections(remaining);
      if (remaining.length) setActiveSection(remaining[0].key);
      setNotice({ type: 'success', text: `"${field.label}" removed. The "${active.label}" section is now empty and was also removed.` });
    } else {
      setConfig(next);
      setAvailableSections((prev) => prev.map((s) => s.key !== active.key ? s : { ...s, fields: remainingFields }));
      setNotice({ type: 'success', text: `"${field.label}" removed from the configuration.` });
    }
    setValidationIssues(null);
  };

  const deleteGroup = (group: string) => {
    clearResetNotice();
    const fieldsToRemove = active.fields.filter((field) => {
      const fieldGroup = getFieldGroup(field, active.key);
      return fieldGroup === group || fieldGroup.startsWith(`${group} / `);
    });
    const next = structuredClone(config) as JsonObject;
    for (const field of fieldsToRemove) {
      const keys = getPathKeys(field.path);
      let parent: JsonObject | undefined = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const child = parent[keys[i]];
        if (typeof child !== 'object' || child === null || Array.isArray(child)) { parent = undefined; break; }
        parent = child as JsonObject;
      }
      if (parent) delete parent[keys[keys.length - 1]];
    }
    cleanEmpty(next);
    const remainingFields = active.fields.filter((field) => !fieldsToRemove.includes(field));
    if (remainingFields.length === 0) {
      delete next[active.key];
      const remaining = availableSections.filter((section) => section.key !== active.key);
      setAvailableSections(remaining);
      if (remaining.length) setActiveSection(remaining[0].key);
    } else {
      setAvailableSections((prev) => prev.map((section) => section.key !== active.key ? section : { ...section, fields: remainingFields }));
    }
    setConfig(next);
    setNotice({ type: 'success', text: `“${group}” group removed from the configuration.` });
    setValidationIssues(null);
  };

  const reset = () => { const data = loadDefaultConfig(); setConfig(pruneConfig(data)); setAvailableSections(sections); setActiveSection(sections[0].key); setImportedFileName(null); setNotice(null); setValidationIssues(null); };
  const confirmReset = () => { reset(); setPendingReset(false); };
  const confirmDelete = () => {
    if (!pendingDelete) return;
    const key = pendingDelete.key;
    const next = structuredClone(config) as JsonObject;
    delete next[key];
    setConfig(next);
    const remaining = availableSections.filter((s) => s.key !== key);
    setAvailableSections(remaining);
    if (activeSection === key && remaining.length) setActiveSection(remaining[0].key);
    setPendingDelete(null);
    setNotice({ type: 'success', text: `"${pendingDelete.label}" section removed from the configuration.` });
  };
  const pickImportFile = () => fileInputRef.current?.click();
  const importJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('not an object');
        const imported = parsed as JsonObject;
        const knownKeys = new Set(sections.map((s) => s.key));
        const matched = sections.filter((s) => s.key in imported);
        if (!matched.length) { setNotice({ type: 'error', text: 'No recognizable configuration sections found in the imported file.' }); return; }
        setConfig(pruneConfig(imported));
        setAvailableSections(matched);
        setActiveSection(matched[0].key);
        setImportedFileName(file.name);
        setNotice({ type: 'success', text: `Configuration imported from "${file.name}".` });
      } catch {
        setNotice({ type: 'error', text: 'Could not read the file. Make sure it is a valid JSON configuration.' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  const copyJson = async () => { await navigator.clipboard.writeText(JSON.stringify(previewConfig, null, 2)); setNotice({ type: 'success', text: 'JSON copied to clipboard.' }); };
  const validate = () => {
    const issues = validateConfig(config);
    setValidationIssues(issues);
    if (issues.length === 0) {
      setNotice({ type: 'success', text: 'Configuration is valid. No issues found.' });
    } else {
      const errors = issues.filter((i) => i.severity === 'error').length;
      const warnings = issues.filter((i) => i.severity === 'warning').length;
      setNotice({ type: errors ? 'error' : 'success', text: `Validation found ${errors} error${errors === 1 ? '' : 's'} and ${warnings} warning${warnings === 1 ? '' : 's'}.` });
    }
    return issues;
  };

  const exportJson = async () => {
    const issues = validateConfig(config);
    const blocking = issues.filter((i) => i.severity === 'error');
    if (blocking.length) {
      setValidationIssues(issues);
      setNotice({ type: 'error', text: `Export blocked: ${blocking.length} validation error${blocking.length === 1 ? '' : 's'} must be fixed first.` });
      return;
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const picker = (window as Window & {
      showSaveFilePicker?: (options?: {
        suggestedName?: string;
        types?: { description: string; accept: Record<string, string[]> }[];
      }) => Promise<{ name: string; createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }>;
    }).showSaveFilePicker;

    if (picker) {
      try {
        const fileHandle = await picker({
          suggestedName: 'mcp-configuration.json',
          types: [{ description: 'JSON file', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        setNotice({ type: 'success', text: `Configuration exported as ${fileHandle.name}.` });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    const requestedName = window.prompt('File name for export:', 'mcp-configuration.json');
    if (requestedName === null) return;

    const fileName = requestedName.trim() || 'mcp-configuration.json';
    const finalName = fileName.toLowerCase().endsWith('.json') ? fileName : `${fileName}.json`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice({ type: 'success', text: `Configuration exported as ${finalName}.` });
  };

  if (!loaded) return (
    <div className="app-shell"><main className="workspace"><section className="content-area"><div className="empty-state"><Network size={24} /><strong>Loading configuration…</strong><span>Reading default values.</span></div></section></main></div>
  );
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Network size={20} /></div><div><span className="brand-kicker">OpenEdge</span><strong>MCP Control Room</strong></div></div>
        <div className="topbar-meta"><span className="live-dot" /> <span>Local configuration</span><span className="top-divider" /><span className="version">v1.0</span></div>
      </header>
      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-intro"><span className="eyebrow">Configuration</span><h1>Shape the<br /><em>runtime.</em></h1><p>Manage the settings that keep your MCP server reliable, secure, and observable.</p></div>
          <nav className="section-nav">{availableSections.map((section) => { const Icon = section.icon; return <div className={`nav-item-wrap ${activeSection === section.key ? 'active' : ''}`} key={section.key}><button className="nav-item" onClick={() => { setActiveSection(section.key); setShowAllOutput(false); setQuery(''); }}><span className="nav-icon"><Icon size={17} /></span><span><small>{section.eyebrow}</small>{section.label}</span><ChevronRight className="nav-arrow" size={15} /></button><button className="nav-delete" onClick={() => setPendingDelete(section)} title={`Delete ${section.label}`}><Trash2 size={13} /></button></div>; })}</nav>
          <div className="import-section"><span className="eyebrow">Import / Export</span><div className="import-card" onClick={pickImportFile} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickImportFile(); } }}><Upload size={18} /><div><strong>Load from file</strong><span>{importedFileName ?? 'Pick a JSON file from disk'}</span></div></div></div>
          <div className="sidebar-footer"><div className="security-badge"><LockKeyhole size={16} /><div><strong>Manual file source</strong><span>Reloads read the startup JSON file</span></div></div><span className="updated-label">{hasChanges ? 'Session changes only' : 'Loaded from startup file'}</span></div>
        </aside>
        <section className="content-area">
          <div className="sticky-top"><div className="content-header"><div><div className="breadcrumb"><span>Settings</span><ChevronRight size={14} /><strong>{active.label}</strong></div><h2>{active.label}</h2><p>Configure the values for this part of your server.</p></div><div className="header-actions"><button className="button secondary" onClick={pickImportFile} title="Import JSON file"><Upload size={15} /> Import</button><button className="button secondary" onClick={validate} title="Check configuration for problems"><ShieldCheck size={15} /> Validate</button><button className="button secondary" onClick={exportJson} title="Export JSON file"><Download size={15} /> Export</button><button className="button secondary" onClick={() => setPendingReset(true)} title="Reset to default configuration"><RotateCcw size={15} /> Reset</button></div></div>
          <div className="toolbar"><div className="search-wrap"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search settings" /></div><div className="toolbar-status"><span className={hasChanges ? 'status-dot pending' : 'status-dot'} />{hasChanges ? 'Changes pending' : 'In sync'}<span className="toolbar-divider" /><span>{filteredFields.length} settings</span></div></div></div>
          {notice && <div className={`notice ${notice.type}`}><span>{notice.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}</span>{notice.text}</div>}
          {validationIssues && (
            <div className="validation-panel">
              <div className="validation-header"><ShieldCheck size={15} /><span>Validation results</span><button className="validation-close" onClick={() => setValidationIssues(null)} aria-label="Dismiss validation results">×</button></div>
              {validationIssues.length === 0 ? (
                <div className="validation-summary valid"><Check size={16} /><div><strong>Configuration is valid</strong><span>No issues found. Your configuration is ready to export.</span></div></div>
              ) : (
                <div className="validation-summary invalid"><AlertTriangle size={16} /><div><strong>Configuration is invalid</strong><span>{validationIssues.filter((i) => i.severity === 'error').length} error(s) and {validationIssues.filter((i) => i.severity === 'warning').length} warning(s) must be reviewed.</span></div></div>
              )}
              {validationIssues.length > 0 && (
                <ul className="validation-list">{validationIssues.map((issue, index) => <li key={index} className={`validation-item ${issue.severity} ${issue.path ? 'clickable' : ''}`} onClick={() => issue.path && focusField(issue.path)} onKeyDown={(event) => { if (issue.path && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); focusField(issue.path); } }} role={issue.path ? 'button' : undefined} tabIndex={issue.path ? 0 : undefined}><span className="validation-badge">{issue.severity === 'error' ? 'Error' : 'Warning'}</span>{issue.message}</li>)}</ul>
              )}
            </div>
          )}
          {active ? <div className="editor-grid"><div className="fields-card">{filteredFields.length ? filteredFields.map((field, index) => { const value = getValue(config, field.path); const group = getFieldGroup(field, active.key); const previousGroup = index > 0 ? getFieldGroup(filteredFields[index - 1], active.key) : ''; return <div key={field.path}>{group && group !== previousGroup && <div className="field-group-heading"><span className="field-group-line" /><span>{group}</span><button className="group-delete" onClick={() => deleteGroup(group)} title={`Delete ${group} group`} aria-label={`Delete ${group} group`}><Trash2 size={13} /></button></div>}<div ref={(element) => { fieldRefs.current[field.path] = element; }} className={`field-row ${field.kind === 'toggle' ? 'toggle-row' : ''} ${highlightedField === field.path ? 'highlighted' : ''}`}><div className="field-copy"><label htmlFor={field.path}>{field.label}</label><span>{field.hint ?? field.path}</span></div><div className="field-controls">{field.kind === 'toggle' ? <button className={`toggle ${value === true ? 'on' : ''}`} onClick={() => updateToggle(field, value !== true)} aria-label={`${field.label}: ${value === true ? 'on' : 'off'}`}><span /></button> : field.kind === 'select' ? <select id={field.path} className="field-input" value={formatValue(value)} onChange={(event) => updateField(field, event)}>{field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select> : <input id={field.path} className="field-input" type={field.kind === 'number' ? 'number' : 'text'} value={formatValue(value)} onChange={(event) => updateField(field, event)} />}<button className="field-delete" onClick={() => deleteField(field)} title={`Delete ${field.label}`} aria-label={`Delete ${field.label}`}><Trash2 size={13} /></button></div></div></div>; }) : <div className="empty-state"><Search size={20} /><strong>No matching settings</strong><span>Try a different search term.</span></div>}</div><aside className="preview-card"><div className="preview-heading"><div><span className="eyebrow">Live output</span><h3>Configuration JSON</h3></div><div className="preview-actions"><button className="button secondary" onClick={() => setShowAllOutput((current) => !current)}>{showAllOutput ? 'Show Current' : 'Show All'}</button><button className="icon-button" onClick={copyJson} title="Copy JSON"><Copy size={15} /></button></div></div><pre>{JSON.stringify(previewConfig, null, 2)}</pre><div className="preview-footer"><Code2 size={14} /><span>Changes are reflected instantly</span></div></aside></div> : <div className="empty-state"><FileJson size={24} /><strong>No sections remaining</strong><span>All configuration sections have been deleted. Save to persist the empty configuration.</span></div>}
        </section>
      </main>
      {pendingReset && (
        <div className="modal-overlay" onClick={() => setPendingReset(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon"><RotateCcw size={26} /></div>
            <h3>Reset to defaults?</h3>
            <p>This will discard all your current changes and restore every setting to its default value. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setPendingReset(false)}>Cancel</button>
              <button className="button solid" onClick={confirmReset}><RotateCcw size={15} /> Reset configuration</button>
            </div>
          </div>
        </div>
      )}
      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon"><AlertTriangle size={26} /></div>
            <h3>Delete "{pendingDelete.label}"?</h3>
            <p>This will remove the entire <strong>{pendingDelete.key}</strong> section and all its settings from the configuration. You can still undo by resetting before saving.</p>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setPendingDelete(null)}>Cancel</button>
              <button className="button danger solid" onClick={confirmDelete}><Trash2 size={15} /> Delete section</button>
            </div>
          </div>
        </div>
      )}
      <input type="file" accept="application/json,.json" ref={fileInputRef} onChange={importJson} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
