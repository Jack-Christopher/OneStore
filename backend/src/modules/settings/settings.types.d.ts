export interface SettingDTO {
  tenantId: string;
  key: string;
  value: any;
  description?: string;
}

export interface SettingEntity {
  id: string;
  tenantId: string;
  key: string;
  value: any;
  description?: string;
}

export interface BulkUpdateSettingsDTO {
  store_name?: string;
  store_ruc?: string;
  store_logo_path?: string;
  date_format?: string;
  theme?: string;
  currency?: string;
}

