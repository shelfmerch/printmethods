import washCold from '@/assets/care-icons/wash-cold.svg';
import washWarm from '@/assets/care-icons/wash-warm.svg';
import noWash from '@/assets/care-icons/no-wash.svg';
import noBleach from '@/assets/care-icons/no-bleach.svg';
import noIron from '@/assets/care-icons/no-iron.svg';
import noDryClean from '@/assets/care-icons/no-dry-clean.svg';
import dryNormal from '@/assets/care-icons/tumble-dry-normal.svg';
import dryMedium from '@/assets/care-icons/tumble-dry-medium.svg';

export interface PredefinedCareIcon {
  key: string;
  label: string;
  icon: string;
}

export const PREDEFINED_CARE_ICONS: PredefinedCareIcon[] = [
  { key: 'wash-cold', label: 'Wash Cold', icon: washCold },
  { key: 'wash-warm', label: 'Wash Warm', icon: washWarm },
  { key: 'no-wash', label: 'Do Not Wash', icon: noWash },
  { key: 'no-bleach', label: 'Do Not Bleach', icon: noBleach },
  { key: 'no-iron', label: 'Do Not Iron', icon: noIron },
  { key: 'no-dry-clean', label: 'Do Not Dry Clean', icon: noDryClean },
  { key: 'tumble-dry-normal', label: 'Tumble Dry Normal', icon: dryNormal },
  { key: 'tumble-dry-medium', label: 'Tumble Dry Medium', icon: dryMedium },
];

export const getCareIconByKey = (key: string) => {
  return PREDEFINED_CARE_ICONS.find(icon => icon.key === key);
};
