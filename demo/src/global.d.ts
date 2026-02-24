interface AppConfig {
  AUTO_REGISTER: boolean;
  HOST_BASE: string;
  PLATFORM_BASE: string;
  USERCODE_PLATFORM: string;
  TRUSTED_ORIGINS: string[];
}

declare global {
  interface Window extends AppConfig {}

  var config: AppConfig;
}

export {};
