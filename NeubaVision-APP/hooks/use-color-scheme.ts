import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useAppSettingsStore } from '@/store/useAppSettingsStore';

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const themeMode = useAppSettingsStore((state) => state.themeMode);

  if (themeMode === 'auto') {
    return systemColorScheme ?? 'light';
  }

  return themeMode;
}
