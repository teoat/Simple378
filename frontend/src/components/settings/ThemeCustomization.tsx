import { useState } from 'react';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'normal' | 'large';
  compactMode: boolean;
}

interface ThemeCustomizationProps {
  onSave?: (settings: ThemeSettings) => void;
}

export function ThemeCustomization({ onSave }: ThemeCustomizationProps) {
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: 'auto',
    accentColor: 'blue',
    fontSize: 'normal',
    compactMode: false,
  });

  const accentColors = [
    { name: 'blue', hex: '#3b82f6' },
    { name: 'purple', hex: '#a855f7' },
    { name: 'red', hex: '#ef4444' },
    { name: 'green', hex: '#10b981' },
    { name: 'amber', hex: '#f59e0b' },
  ];

  const handleSave = () => {
    onSave?.(theme);
    alert('Theme settings saved successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" /> Theme Customization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-sm">Appearance</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme({ ...theme, mode: 'light' })}
                className={`p-4 rounded border-2 transition-all ${
                  theme.mode === 'light'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Sun className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Light</p>
              </button>

              <button
                onClick={() => setTheme({ ...theme, mode: 'dark' })}
                className={`p-4 rounded border-2 transition-all ${
                  theme.mode === 'dark'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Moon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Dark</p>
              </button>

              <button
                onClick={() => setTheme({ ...theme, mode: 'auto' })}
                className={`p-4 rounded border-2 transition-all ${
                  theme.mode === 'auto'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Monitor className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Auto</p>
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Accent Color</h4>
            <div className="flex gap-3">
              {accentColors.map(color => (
                <button
                  key={color.name}
                  onClick={() => setTheme({ ...theme, accentColor: color.name })}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    theme.accentColor === color.name
                      ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-900'
                      : 'border-slate-200'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Font Size</h4>
            <div className="grid grid-cols-3 gap-3">
              {(['small', 'normal', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setTheme({ ...theme, fontSize: size })}
                  className={`p-3 rounded border-2 text-center transition-all ${
                    theme.fontSize === size
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p
                    className="font-medium capitalize"
                    style={{
                      fontSize:
                        size === 'small'
                          ? '12px'
                          : size === 'normal'
                            ? '14px'
                            : '16px',
                    }}
                  >
                    {size}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Compact Mode</h4>
              <p className="text-xs text-slate-600">Reduce padding and spacing</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={theme.compactMode}
                onChange={(e) => setTheme({ ...theme, compactMode: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm">{theme.compactMode ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs text-slate-600 mb-2">Preview</p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded text-sm"
                style={{
                  backgroundColor: accentColors.find(c => c.name === theme.accentColor)?.hex,
                  color: 'white',
                }}
              >
                Primary Button
              </button>
              <button className="px-3 py-1 rounded text-sm border border-slate-300">
                Secondary Button
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Save Theme Settings
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
