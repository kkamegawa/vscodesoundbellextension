type PlatformSettingValues = Record<string, string>;

interface PlatformSettingInspection {
    defaultValue?: PlatformSettingValues;
    globalValue?: PlatformSettingValues;
    workspaceValue?: PlatformSettingValues;
    workspaceFolderValue?: PlatformSettingValues;
}

/**
 * Local audio playback must not use commands or file paths supplied by a workspace.
 * Keep contributed defaults and user settings, while deliberately ignoring workspace values.
 */
export function getTrustedPlatformSettingValues(inspected: PlatformSettingInspection | undefined): PlatformSettingValues {
    return {
        ...(inspected?.defaultValue ?? {}),
        ...(inspected?.globalValue ?? {})
    };
}
