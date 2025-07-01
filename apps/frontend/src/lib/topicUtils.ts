import {
  AcademicCapIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  CakeIcon,
  CloudIcon,
  HeartIcon,
  HomeIcon,
  PaintBrushIcon,
  SwatchIcon,
  TruckIcon,
  MapPinIcon,
  ComputerDesktopIcon,
  FaceSmileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// Topic mappings with Vietnamese translations
export const TOPIC_MAPPINGS: Record<string, string> = {
  'animals': 'Động vật',
  'body_parts': 'Bộ phận c�� thể',
  'business': 'Kinh doanh',
  'clothing': 'Quần áo',
  'colors': 'Màu sắc',
  'education': 'Giáo dục',
  'food': 'Thức ăn',
  'fruits': 'Trái cây',
  'health_medical': 'Y tế - Sức khỏe',
  'house_furniture': 'Nhà cửa - Nội thất',
  'sports': 'Thể thao',
  'technology': 'Công nghệ',
  'transportation': 'Giao thông',
  'travel': 'Du lịch',
  'weather': 'Thời tiết'
};

// Topic icons mapping
export const TOPIC_ICONS: Record<string, any> = {
  'animals': FaceSmileIcon,
  'body_parts': HeartIcon,
  'business': BuildingOfficeIcon,
  'clothing': SwatchIcon,
  'colors': PaintBrushIcon,
  'education': AcademicCapIcon,
  'food': CakeIcon,
  'fruits': BeakerIcon,
  'health_medical': HeartIcon,
  'house_furniture': HomeIcon,
  'sports': FaceSmileIcon,
  'technology': ComputerDesktopIcon,
  'transportation': TruckIcon,
  'travel': MapPinIcon,
  'weather': CloudIcon
};

// Format topic display name
export function formatTopicDisplay(topic: string): string {
  return topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Get Vietnamese topic name
export function getVietnameseTopicName(topic: string): string {
  return TOPIC_MAPPINGS[topic] || formatTopicDisplay(topic);
}

// Get topic icon component
export function getTopicIcon(topic: string) {
  return TOPIC_ICONS[topic] || GlobeAltIcon;
}

// Get topic color class
export function getTopicColorClass(topic: string): string {
  const colors: Record<string, string> = {
    'animals': 'bg-green-100 text-green-800 border-green-200',
    'body_parts': 'bg-red-100 text-red-800 border-red-200',
    'business': 'bg-blue-100 text-blue-800 border-blue-200',
    'clothing': 'bg-purple-100 text-purple-800 border-purple-200',
    'colors': 'bg-pink-100 text-pink-800 border-pink-200',
    'education': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'food': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'fruits': 'bg-orange-100 text-orange-800 border-orange-200',
    'health_medical': 'bg-red-100 text-red-800 border-red-200',
    'house_furniture': 'bg-brown-100 text-brown-800 border-brown-200',
    'sports': 'bg-green-100 text-green-800 border-green-200',
    'technology': 'bg-gray-100 text-gray-800 border-gray-200',
    'transportation': 'bg-blue-100 text-blue-800 border-blue-200',
    'travel': 'bg-teal-100 text-teal-800 border-teal-200',
    'weather': 'bg-sky-100 text-sky-800 border-sky-200'
  };

  return colors[topic] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Get topic display with both Vietnamese and English
export function getTopicDisplayBilingual(topic: string, topicVi?: string): string {
  // Use topicVi from database if available, otherwise fallback to mapping
  const vietnameseName = topicVi || getVietnameseTopicName(topic);
  const englishName = formatTopicDisplay(topic);
  return `${vietnameseName} - ${englishName}`;
}

// Topic emoji mapping - centralized function to avoid duplication
export const getTopicEmoji = (topic: string): string => {
  const emojiMap: { [key: string]: string } = {
    'actions': '⚡',
    'animals': '🐕',
    'arts_culture': '🎨',
    'beverages': '🥤',
    'body_parts': '👁️',
    'business': '💼',
    'chemistry': '⚗️',
    'clothing': '👕',
    'clothing_fashion': '👗',
    'colors': '🎨',
    'cooking': '👨‍🍳',
    'economics': '📈',
    'education': '📚',
    'emotions': '😊',
    'entertainment': '🎭',
    'environment': '🌍',
    'family': '👨‍👩‍👧‍👦',
    'finance': '💰',
    'food': '🍕',
    'food_drink': '🍔',
    'fruits': '🍎',
    'health': '🏥',
    'history': '📜',
    'home': '🏠',
    'house_home': '🏡',
    'human_body': '🧠',
    'jobs_careers': '💼',
    'jobs_professions': '👨‍💼',
    'law': '⚖️',
    'marketing': '📊',
    'media_communication': '📱',
    'nature': '🌳',
    'people_relationships': '👥',
    'personality': '🧑‍🎓',
    'physics': '⚛️',
    'plants_flowers': '🌸',
    'politics': '🏛️',
    'psychology': '🧠',
    'school': '🏫',
    'school_supplies': '✏️',
    'science': '🔬',
    'shapes': '🔵',
    'shopping': '🛒',
    'sports': '⚽',
    'subjects': '📖',
    'technology': '💻',
    'time': '⏰',
    'transportation': '🚗',
    'travel': '✈️',
    'vegetables': '🥕',
    'weather': '🌤️'
  };
  return emojiMap[topic] || '📖';
};

// Simple display function for topics
export const getTopicDisplay = (topic: string, topicVi?: string): string => {
  if (topicVi) {
    return topicVi;
  }
  return topic.charAt(0).toUpperCase() + topic.slice(1).replace('_', ' ');
};
