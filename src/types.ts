export type ThemeType = 'cyberpunk' | 'festive' | 'christmas' | 'flat' | 'warm_gradient';
export type PointerPosition = 'top' | 'right' | 'bottom' | 'left';

export interface WheelItem {
  id: string;
  text: string;
  type?: string; // New field for prize type
  probability: number;
  color?: string;
}

export interface Profile {
  id: string;
  name: string;
  theme: ThemeType;
  items: WheelItem[];
  hiddenMode: boolean;
  visiblePercentage: number;
  transparentHide: boolean;
  spinDurationSec: number;
  pointerPosition: PointerPosition;
  logoText: string;
}

export interface Config {
  soundEnabled: boolean;
  activeProfileId: string;
  profiles: Profile[];
}

export const DEFAULT_ITEMS: WheelItem[] = [
  { id: '1', text: '超级大奖', probability: 5 },
  { id: '2', text: '再接再厉', probability: 20 },
  { id: '3', text: '神秘礼物', probability: 10 },
  { id: '4', text: '666', probability: 15 },
  { id: '5', text: '恭喜发财', probability: 15 },
  { id: '6', text: '谢谢参与', probability: 35 },
];

export const DEFAULT_PROFILE: Profile = {
  id: 'default',
  name: '默认配置',
  theme: 'cyberpunk',
  items: DEFAULT_ITEMS,
  hiddenMode: false,
  visiblePercentage: 20,
  transparentHide: false,
  spinDurationSec: 8,
  pointerPosition: 'top',
  logoText: 'BLOOMING',
};

export const THEMES: Record<ThemeType, { label: string; bg: string; primary: string }> = {
  cyberpunk: { label: '赛博朋克', bg: 'bg-cyber-bg', primary: 'text-cyber-primary' },
  festive: { label: '喜庆红金', bg: 'bg-festive-bg', primary: 'text-festive-primary' },
  christmas: { label: '圣诞主题', bg: 'bg-christmas-bg', primary: 'text-christmas-primary' },
  flat: { label: '简约扁平', bg: 'bg-flat-bg', primary: 'text-flat-primary' },
  warm_gradient: { label: '暖色渐变', bg: 'bg-orange-50', primary: 'text-orange-500' },
};
